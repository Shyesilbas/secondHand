import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import useWebSocket from '../../common/hooks/useWebSocket.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { UNREAD_COUNT_KEYS } from './useUnreadCount.js';
import { CHAT_DEFAULTS, CHAT_MESSAGE_TYPES } from '../chatConstants.js';
import { sameChatId } from '../chatIdUtils.js';

export const useChat = (userId, options = {}) => {
    const { user } = useAuthState();
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
        staleTime: CHAT_DEFAULTS.ROOM_STALE_TIME_MS,
        cacheTime: CHAT_DEFAULTS.ROOM_CACHE_TIME_MS,
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
        queryKey: ['chatMessages', user?.id, selectedChatRoom?.id],
        queryFn: () => chatService.getChatMessages(selectedChatRoom.id),
        enabled: !!(user?.id && selectedChatRoom?.id),
        staleTime: CHAT_DEFAULTS.MESSAGE_STALE_TIME_MS,
        cacheTime: CHAT_DEFAULTS.MESSAGE_CACHE_TIME_MS,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });

    const sendMessageMutation = useMutation({
        mutationFn: (messageData) => chatService.sendMessage(messageData),
        onSuccess: (data) => {
            setMessages(prev => {
                if (prev.some(msg => sameChatId(msg.id, data.id))) return prev;
                return [...prev, data];
            });
            // Only update specific queries, don't invalidate everything
            queryClient.setQueryData(['chatMessages', user?.id, selectedChatRoom?.id], (oldData) => {
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
            setMessages((prev) => prev.filter((msg) => !sameChatId(msg.id, messageId)));
            // Only update the specific message cache, don't refetch everything
            queryClient.setQueryData(['chatMessages', user?.id, selectedChatRoom?.id], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    content: oldData.content.filter(msg => !sameChatId(msg.id, messageId))
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
                }, CHAT_DEFAULTS.MARK_READ_DELAY_MS);
            }
        }
    }, [selectedChatRoom, user?.id, leaveRoom, joinRoom, subscribeToChatRoom, unsubscribeFromChatRoom, markAsReadMutation]);

    const sendMessage = useCallback((content) => {
        if (!selectedChatRoom?.id || !user?.id) return;

        const otherParticipant = [...(selectedChatRoom.participantIds || [])].find(
            (id) => !sameChatId(id, user.id)
        );
        if (!otherParticipant) return;

        const messageData = {
            content,
            senderId: user.id,
            recipientId: otherParticipant,
            chatRoomId: selectedChatRoom.id,
            messageType: CHAT_MESSAGE_TYPES.TEXT
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
                if (sameChatId(messageData.senderId, user?.id)) return;
                setMessages(prev => {
                    if (prev.some(msg => sameChatId(msg.id, messageData.id))) return prev;
                    return [...prev, messageData];
                });
            };

            addMessageCallback(handleNewMessage);
            return () => removeMessageCallback(handleNewMessage);
        }
    }, [isConnected, selectedChatRoom?.id, user?.id, addMessageCallback, removeMessageCallback]);

    useEffect(() => {
        setMessages([]);
    }, [selectedChatRoom?.id]);

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
