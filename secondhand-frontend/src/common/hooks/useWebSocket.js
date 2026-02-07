import { useEffect, useRef, useState, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';

const useWebSocket = (userId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClient = useRef(null);
    const subscriptions = useRef(new Map());
    const messageCallbacks = useRef(new Set());

    // ==================== CONNECTION MANAGEMENT ====================
    
    const connect = useCallback(() => {
        // Prevent multiple connection attempts
        if (stompClient.current?.connected) {
            return;
        }

        const socket = new WebSocket('ws://localhost:8080/ws');
        stompClient.current = Stomp.over(socket);
        
        // Disable debug logs to reduce console noise
        stompClient.current.debug = () => {};
        
        stompClient.current.connect(
            {},
            (frame) => {
                setIsConnected(true);
                
                // Kullanıcıya özel mesajları dinle
                if (userId) {
                    subscribeToUserMessages(userId);
                }
            },
            (error) => {
                console.error('❌ WebSocket connection error:', error);
                setIsConnected(false);
                // 5 saniye sonra tekrar bağlanmayı dene
                setTimeout(connect, 5000);
            }
        );
    }, [userId]);

    const disconnect = useCallback(() => {
        if (stompClient.current) {
            // Tüm subscription'ları temizle
            subscriptions.current.forEach((subscription) => {
                try {
                    subscription.unsubscribe();
                } catch (e) {
                }
            });
            subscriptions.current.clear();
            
            if (stompClient.current.connected) {
                stompClient.current.disconnect();
            }
            setIsConnected(false);
        }
    }, []);

    // ==================== SUBSCRIPTION MANAGEMENT ====================
    
    const subscribeToUserMessages = useCallback((userId) => {
        if (!stompClient.current || !isConnected) return;

        const subscription = stompClient.current.subscribe(
            `/user/${userId}/queue/messages`,
            (message) => {
                const messageData = JSON.parse(message.body);
                setMessages(prev => [...prev, messageData]);
                setUnreadCount(prev => prev + 1);
            }
        );
        
        subscriptions.current.set(`user-${userId}`, subscription);
    }, [isConnected]);

    const subscribeToChatRoom = useCallback((chatRoomId) => {
        if (!stompClient.current || !isConnected) {
            return;
        }

        const subscription = stompClient.current.subscribe(
            `/topic/chat/${chatRoomId}`,
            (message) => {
                const messageData = JSON.parse(message.body);
                setMessages(prev => [...prev, messageData]);
                
                // Tüm callback'leri çağır
                messageCallbacks.current.forEach(callback => {
                    callback(messageData);
                });
            }
        );
        
        subscriptions.current.set(`room-${chatRoomId}`, subscription);
    }, [isConnected]);

    const unsubscribeFromChatRoom = useCallback((chatRoomId) => {
        const subscription = subscriptions.current.get(`room-${chatRoomId}`);
        if (subscription) {
            subscription.unsubscribe();
            subscriptions.current.delete(`room-${chatRoomId}`);
        }
    }, []);

    // ==================== MESSAGE CALLBACK MANAGEMENT ====================
    
    const addMessageCallback = useCallback((callback) => {
        messageCallbacks.current.add(callback);
    }, []);

    const removeMessageCallback = useCallback((callback) => {
        messageCallbacks.current.delete(callback);
    }, []);

    // ==================== MESSAGE ACTIONS ====================
    
    const sendMessage = useCallback((message) => {
        if (stompClient.current && isConnected) {
            stompClient.current.send('/app/chat.sendMessage', {}, JSON.stringify(message));
        }
    }, [isConnected]);

    const joinRoom = useCallback((chatRoomId, senderId) => {
        if (stompClient.current && isConnected) {
            stompClient.current.send('/app/chat.joinRoom', {}, JSON.stringify({
                chatRoomId,
                senderId
            }));
        }
    }, [isConnected]);

    const leaveRoom = useCallback((chatRoomId, senderId) => {
        if (stompClient.current && isConnected) {
            stompClient.current.send('/app/chat.leaveRoom', {}, JSON.stringify({
                chatRoomId,
                senderId
            }));
        }
        unsubscribeFromChatRoom(chatRoomId);
    }, [isConnected, unsubscribeFromChatRoom]);

    const markAsRead = useCallback((chatRoomId, senderId) => {
        if (stompClient.current && isConnected) {
            stompClient.current.send('/app/chat.markAsRead', {}, JSON.stringify({
                chatRoomId,
                senderId
            }));
            setUnreadCount(0);
        }
    }, [isConnected]);

    // ==================== EFFECTS ====================
    
    useEffect(() => {
        connect();
        
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // ==================== RETURN ====================
    
    return {
        isConnected,
        messages,
        unreadCount,
        sendMessage,
        joinRoom,
        leaveRoom,
        markAsRead,
        subscribeToChatRoom,
        unsubscribeFromChatRoom,
        addMessageCallback,
        removeMessageCallback,
        stompClient: stompClient.current
    };
};

export default useWebSocket;
