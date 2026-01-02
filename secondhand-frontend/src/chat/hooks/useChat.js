import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import useWebSocket from '../../common/hooks/useWebSocket.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { UNREAD_COUNT_KEYS } from './useUnreadCount.js';

export const useChat = (userId, options = {}) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const enableChatRoomsFetch = options.enableChatRoomsFetch ?? false;

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
        queryKey: ['chatRooms', user?.id],
        queryFn: () => chatService.getUserChatRooms(),
        enabled: !!user?.id && enableChatRoomsFetch,
        staleTime: 10 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchIntervalInBackground: false,
        retry: 1,
    });

    const {
        data: chatMessages,
        isLoading: isLoadingMessages,
        error: messagesError,
        refetch: refetchMessages
    } = useQuery({
        queryKey: ['chatMessages', selectedChatRoom?.id],
        queryFn: () => chatService.getChatMessages(selectedChatRoom.id),
        enabled: !!selectedChatRoom?.id,
        staleTime: 5 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const sendMessageMutation = useMutation({
        mutationFn: (messageData) => chatService.sendMessage(messageData),
        onSuccess: (data) => {
            setMessages(prev => {
                if (prev.some(msg => msg.id === data.id)) return prev;
                return [...prev, data];
            });
            // Only update specific queries, don't invalidate everything
            queryClient.setQueryData(['chatMessages', selectedChatRoom?.id], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: [...(oldData.content || []), data]
                };
            });
        }
    });

    const markAsReadMutation = useMutation({
        mutationFn: ({ chatRoomId }) => chatService.markMessagesAsRead(chatRoomId),
        onSuccess: (_, { chatRoomId }) => {
            // Don't invalidate queries, just update unread counts
            queryClient.setQueryData(UNREAD_COUNT_KEYS.room(chatRoomId, user?.id), 0);
            queryClient.invalidateQueries({
                queryKey: UNREAD_COUNT_KEYS.total(user?.id),
                refetchType: 'none'
            });
        }
    });

    const deleteMessageMutation = useMutation({
        mutationFn: ({ messageId }) => chatService.deleteMessage(messageId),
        onSuccess: (_, { messageId }) => {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            // Only update the specific message cache, don't refetch everything
            queryClient.setQueryData(['chatMessages', selectedChatRoom?.id], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: oldData.content.filter(msg => msg.id !== messageId)
                };
            });
        }
    });

    const deleteConversationMutation = useMutation({
        mutationFn: ({ chatRoomId }) => chatService.deleteConversation(chatRoomId),
        onSuccess: () => {
            setSelectedChatRoom(null);
            setMessages([]);
            // Only invalidate chat rooms when absolutely necessary
            queryClient.invalidateQueries(['chatRooms', user?.id]);
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
            // Only mark as read if there are actually unread messages
            if (chatRoom.unreadCount > 0) {
                setTimeout(() => {
                    markAsReadMutation.mutate({ chatRoomId: chatRoom.id });
                }, 1000); // Increased delay to ensure messages are loaded
            }
        }
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
        const chatRoom = await chatService.createOrGetDirectChat(otherUserId);
        setSelectedChatRoom(chatRoom);
        return chatRoom;
    }, []);

    const createListingChat = useCallback(async (listingId, listingTitle) => {
        const chatRoom = await chatService.createOrGetListingChat(listingId, listingTitle);
        setSelectedChatRoom(chatRoom);
        return chatRoom;
    }, []);

    const deleteMessage = useCallback((messageId) => {
        deleteMessageMutation.mutate({ messageId });
    }, [deleteMessageMutation]);

    const deleteConversation = useCallback((chatRoomId) => {
        deleteConversationMutation.mutate({ chatRoomId });
    }, [deleteConversationMutation]);

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
            setMessages(chatMessages.content);
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
