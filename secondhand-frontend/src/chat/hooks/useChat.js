import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import useWebSocket from '../../common/hooks/useWebSocket.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useChat = (userId) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // WebSocket hook'u
    const {
        isConnected,
        sendMessage: sendWebSocketMessage,
        joinRoom,
        leaveRoom,
        markAsRead: markAsReadWebSocket,
        subscribeToChatRoom,
        unsubscribeFromChatRoom,
        addMessageCallback,
        removeMessageCallback,
        stompClient
    } = useWebSocket(user?.id);

    // ==================== QUERIES ====================
    
    // Chat room'ları getir
    const {
        data: chatRooms = [],
        isLoading: isLoadingRooms,
        error: roomsError,
        refetch: refetchRooms
    } = useQuery({
        queryKey: ['chatRooms', userId],
        queryFn: () => {
            console.log('Fetching chat rooms for user:', userId);
            return chatService.getUserChatRooms(userId);
        },
        enabled: !!userId,
        refetchInterval: 30000 // 30 saniyede bir güncelle
    });

    // Seçili chat room'ın mesajlarını getir
    const {
        data: chatMessages,
        isLoading: isLoadingMessages,
        error: messagesError,
        refetch: refetchMessages
    } = useQuery({
        queryKey: ['chatMessages', selectedChatRoom?.id],
        queryFn: () => {
            console.log('Fetching messages for chat room:', selectedChatRoom.id);
            return chatService.getChatMessages(selectedChatRoom.id);
        },
        enabled: !!selectedChatRoom?.id,
        refetchInterval: 10000 // 10 saniyede bir güncelle
    });

    // ==================== MUTATIONS ====================
    
    // Mesaj gönderme mutation'ı
    const sendMessageMutation = useMutation({
        mutationFn: (messageData) => {
            console.log('Mutation function called with:', messageData);
            return chatService.sendMessage(messageData);
        },
        onSuccess: (data) => {
            console.log('Message sent successfully via HTTP:', data);
            // Mesajı local state'e ekle (gönderen kullanıcı için)
            setMessages(prev => {
                if (prev.some(msg => msg.id === data.id)) {
                    return prev;
                }
                return [...prev, data];
            });
            // Mesajları güncelle
            queryClient.invalidateQueries(['chatMessages', selectedChatRoom?.id]);
            queryClient.invalidateQueries(['chatRooms', userId]);
        },
        onError: (error) => {
            console.error('Error sending message:', error);
            console.error('Error details:', error.response?.data);
        }
    });

    // Mesajları okundu olarak işaretleme mutation'ı
    const markAsReadMutation = useMutation({
        mutationFn: ({ chatRoomId, userId }) => 
            chatService.markMessagesAsRead(chatRoomId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', selectedChatRoom?.id]);
            queryClient.invalidateQueries(['chatRooms', userId]);
        }
    });

    // ==================== ACTIONS ====================
    
    // Chat room seçme
    const selectChatRoom = useCallback((chatRoom) => {
        console.log('selectChatRoom called with:', chatRoom);
        
        if (selectedChatRoom?.id) {
            // Önceki room'dan çık
            leaveRoom(selectedChatRoom.id, user?.id);
            unsubscribeFromChatRoom(selectedChatRoom.id);
        }

        setSelectedChatRoom(chatRoom);
        
        if (chatRoom?.id) {
            // Yeni room'a katıl
            joinRoom(chatRoom.id, user?.id);
            subscribeToChatRoom(chatRoom.id);
            
            // Mesajları okundu olarak işaretle
            markAsReadMutation.mutate({
                chatRoomId: chatRoom.id,
                userId: user?.id
            });
        }
    }, [selectedChatRoom, user?.id, leaveRoom, joinRoom, subscribeToChatRoom, unsubscribeFromChatRoom, markAsReadMutation]);

    // Mesaj gönderme
    const sendMessage = useCallback((content) => {
        if (!selectedChatRoom?.id || !user?.id) return;

        console.log('Selected chat room participants:', selectedChatRoom.participantIds);
        console.log('Current user ID:', user.id);

        // Chat room'daki diğer kullanıcıyı bul (recipient)
        const otherParticipant = selectedChatRoom.participantIds.find(id => id !== user.id);
        if (!otherParticipant) {
            console.error('No other participant found in chat room');
            console.error('Chat room participants:', selectedChatRoom.participantIds);
            console.error('Current user ID:', user.id);
            return;
        }

        const messageData = {
            content,
            senderId: user.id,
            recipientId: otherParticipant,
            chatRoomId: selectedChatRoom.id,
            messageType: 'TEXT'
        };

        console.log('Sending message via HTTP:', messageData);
        sendMessageMutation.mutate(messageData);
    }, [selectedChatRoom?.id, user?.id, sendMessageMutation]);

    // Direct chat oluşturma/getirme
    const createDirectChat = useCallback(async (otherUserId) => {
        try {
            const chatRoom = await chatService.createOrGetDirectChat(userId, otherUserId);
            setSelectedChatRoom(chatRoom);
            return chatRoom;
        } catch (error) {
            console.error('Error creating direct chat:', error);
            throw error;
        }
    }, [userId]);

    // Listing chat oluşturma/getirme
    const createListingChat = useCallback(async (listingId, listingTitle) => {
        try {
            console.log('createListingChat called with:', listingId, listingTitle);
            const chatRoom = await chatService.createOrGetListingChat(userId, listingId, listingTitle);
            console.log('Chat room returned from service:', chatRoom);
            setSelectedChatRoom(chatRoom);
            return chatRoom;
        } catch (error) {
            console.error('Error creating listing chat:', error);
            throw error;
        }
    }, [userId]);

    // ==================== EFFECTS ====================
    
    // WebSocket'ten gelen mesajları dinle
    useEffect(() => {
        if (isConnected && selectedChatRoom?.id) {
            const handleNewMessage = (messageData) => {
                console.log('New message received via WebSocket in useChat:', messageData);
                console.log('Current user ID:', user?.id);
                console.log('Message sender ID:', messageData.senderId);
                
                // Mesaj gönderen kullanıcının kendi mesajını tekrar almaması için kontrol
                if (messageData.senderId === user?.id) {
                    console.log('Skipping own message from WebSocket');
                    return;
                }
                
                setMessages(prev => {
                    if (prev.some(msg => msg.id === messageData.id)) {
                        return prev;
                    }
                    return [...prev, messageData];
                });
            };

            // Callback'i ekle
            addMessageCallback(handleNewMessage);

            return () => {
                // Callback'i kaldır
                removeMessageCallback(handleNewMessage);
            };
        }
    }, [isConnected, selectedChatRoom?.id, user?.id, addMessageCallback, removeMessageCallback]);

    // Chat messages değişikliklerini dinle
    useEffect(() => {
        console.log('chatMessages changed:', chatMessages);
        
        if (chatMessages?.content) {
            // Page objesi geldiğinde content field'ından mesajları al
            // Backend'ten DESC sırada geliyor, frontend'te ASC sırada göstermek için ters çevir
            const sortedMessages = [...chatMessages.content].reverse();
            console.log('Setting messages (sorted):', sortedMessages);
            setMessages(sortedMessages);
        }
    }, [chatMessages]);

    // ==================== RETURN ====================
    
    return {
        // State
        chatRooms: chatRooms || [],
        selectedChatRoom,
        messages,
        isConnected,
        
        // Loading states
        isLoadingRooms,
        isLoadingMessages,
        isSendingMessage: sendMessageMutation.isPending,
        
        // Errors
        roomsError,
        messagesError,
        
        // Actions
        selectChatRoom,
        sendMessage,
        createDirectChat,
        createListingChat,
        markAsRead: markAsReadMutation.mutate,
        
        // Refetch functions
        refetchRooms,
        refetchMessages
    };
};
