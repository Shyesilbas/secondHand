import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import useWebSocket from '../../common/hooks/useWebSocket.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { UNREAD_COUNT_KEYS } from './useUnreadCount.js';

export const useChat = (userId) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);

    const {
        isConnected,
        sendMessage: sendWebSocketMessage,
        joinRoom,
        leaveRoom,
        markAsRead: markAsReadWebSocket,
        subscribeToChatRoom,
        unsubscribeFromChatRoom,
        addMessageCallback,
        removeMessageCallback
    } = useWebSocket(user?.id);

    const {
        data: chatRooms = [],
        isLoading: isLoadingRooms,
        error: roomsError,
        refetch: refetchRooms
    } = useQuery({
        queryKey: ['chatRooms', userId],
        queryFn: () => chatService.getUserChatRooms(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,         cacheTime: 10 * 60 * 1000,         refetchInterval: 5 * 60 * 1000,         refetchOnWindowFocus: false,
        refetchOnMount: false,         refetchIntervalInBackground: false,     });

    const {
        data: chatMessages,
        isLoading: isLoadingMessages,
        error: messagesError,
        refetch: refetchMessages
    } = useQuery({
        queryKey: ['chatMessages', selectedChatRoom?.id],
        queryFn: () => chatService.getChatMessages(selectedChatRoom.id),
        enabled: !!selectedChatRoom?.id,
        staleTime: 2 * 60 * 1000,         cacheTime: 5 * 60 * 1000,         refetchInterval: false,         refetchOnWindowFocus: false,
        refetchOnMount: false,     });

    const sendMessageMutation = useMutation({
        mutationFn: (messageData) => chatService.sendMessage(messageData),
        onSuccess: (data) => {
            setMessages(prev => {
                if (prev.some(msg => msg.id === data.id)) return prev;
                return [...prev, data];
            });
            queryClient.invalidateQueries(['chatMessages', selectedChatRoom?.id]);
            queryClient.invalidateQueries(['chatRooms', userId]);
                        queryClient.invalidateQueries({
                queryKey: UNREAD_COUNT_KEYS.all, 
                refetchType: 'none'             });
        }
    });

    const markAsReadMutation = useMutation({
        mutationFn: ({ chatRoomId, userId }) => chatService.markMessagesAsRead(chatRoomId, userId),
        onSuccess: (_, { chatRoomId, userId }) => {
            queryClient.invalidateQueries(['chatMessages', selectedChatRoom?.id]);
            queryClient.invalidateQueries(['chatRooms', userId]);
                        queryClient.setQueryData(UNREAD_COUNT_KEYS.room(chatRoomId, userId), 0);
                        queryClient.invalidateQueries({
                queryKey: UNREAD_COUNT_KEYS.total(userId),
                refetchType: 'none'
            });
        }
    });

    const deleteMessageMutation = useMutation({
        mutationFn: ({ messageId, userId }) => chatService.deleteMessage(messageId, userId),
        onSuccess: (_, { messageId }) => {
                        setMessages(prev => prev.filter(msg => msg.id !== messageId));
                        queryClient.invalidateQueries(['chatMessages', selectedChatRoom?.id]);
            queryClient.invalidateQueries(['chatRooms', userId]);
        }
    });

    const deleteConversationMutation = useMutation({
        mutationFn: ({ chatRoomId, userId }) => chatService.deleteConversation(chatRoomId, userId),
        onSuccess: () => {
                        setSelectedChatRoom(null);
            setMessages([]);
                        queryClient.invalidateQueries(['chatRooms', userId]);
        }
    });

    const selectChatRoom = useCallback((chatRoom) => {
        if (selectedChatRoom?.id) {
            leaveRoom(selectedChatRoom.id, user?.id);
            unsubscribeFromChatRoom(selectedChatRoom.id);
        }

        setSelectedChatRoom(chatRoom);

        if (chatRoom?.id) {
            joinRoom(chatRoom.id, user?.id);
            subscribeToChatRoom(chatRoom.id);
                        setTimeout(() => {
                markAsReadMutation.mutate({ chatRoomId: chatRoom.id, userId: user?.id });
            }, 500);         }
    }, [selectedChatRoom, user?.id, leaveRoom, joinRoom, subscribeToChatRoom, unsubscribeFromChatRoom, markAsReadMutation]);

    const sendMessage = useCallback((content) => {
        if (!selectedChatRoom?.id || !user?.id) return;

        const otherParticipant = selectedChatRoom.participantIds.find(id => id !== user.id);
        if (!otherParticipant) return;

        const messageData = {
            content,
            senderId: user.id,
            recipientId: otherParticipant,
            chatRoomId: selectedChatRoom.id,
            messageType: 'TEXT'
        };

        sendMessageMutation.mutate(messageData);
    }, [selectedChatRoom?.id, user?.id, sendMessageMutation]);

    const createDirectChat = useCallback(async (otherUserId) => {
        const chatRoom = await chatService.createOrGetDirectChat(userId, otherUserId);
        setSelectedChatRoom(chatRoom);
        return chatRoom;
    }, [userId]);

    const createListingChat = useCallback(async (listingId, listingTitle) => {
        const chatRoom = await chatService.createOrGetListingChat(userId, listingId, listingTitle);
        setSelectedChatRoom(chatRoom);
        return chatRoom;
    }, [userId]);

    const deleteMessage = useCallback((messageId) => {
        deleteMessageMutation.mutate({ messageId, userId: user?.id });
    }, [deleteMessageMutation, user?.id]);

    const deleteConversation = useCallback((chatRoomId) => {
        deleteConversationMutation.mutate({ chatRoomId, userId: user?.id });
    }, [deleteConversationMutation, user?.id]);

    useEffect(() => {
        if (isConnected && selectedChatRoom?.id) {
            const handleNewMessage = (messageData) => {
                if (messageData.senderId === user?.id) return;
                setMessages(prev => {
                    if (prev.some(msg => msg.id === messageData.id)) return prev;
                    return [...prev, messageData];
                });
            };

            addMessageCallback(handleNewMessage);
            return () => removeMessageCallback(handleNewMessage);
        }
    }, [isConnected, selectedChatRoom?.id, user?.id, addMessageCallback, removeMessageCallback]);

    useEffect(() => {
        if (chatMessages?.content) {
            const sortedMessages = [...chatMessages.content].reverse();
            setMessages(sortedMessages);
        }
    }, [chatMessages]);

    return {
        chatRooms: chatRooms || [],
        selectedChatRoom,
        messages,
        isConnected,
        isLoadingRooms,
        isLoadingMessages,
        isSendingMessage: sendMessageMutation.isPending,
        isDeletingMessage: deleteMessageMutation.isPending,
        isDeletingConversation: deleteConversationMutation.isPending,
        roomsError,
        messagesError,
        selectChatRoom,
        sendMessage,
        deleteMessage,
        deleteConversation,
        createDirectChat,
        createListingChat,
        markAsRead: markAsReadMutation.mutate,
        refetchRooms,
        refetchMessages
    };
};
