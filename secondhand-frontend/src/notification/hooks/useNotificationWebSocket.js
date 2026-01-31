import { useEffect, useRef, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useNotificationWebSocket = (onNotificationReceived) => {
    const { user } = useAuth();
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const broadcastSubscription = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        if (!user?.id) {
            return;
        }

        if (stompClient.current?.connected) {
            return;
        }

        const socket = new WebSocket('ws://localhost:8080/ws');
        stompClient.current = Stomp.over(socket);
        stompClient.current.debug = () => {};

        stompClient.current.connect(
            {},
            () => {
                const destination = `/user/${user.id}/notifications`;
                subscription.current = stompClient.current.subscribe(destination, (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        onNotificationReceived?.(notification);
                    } catch (error) {
                        console.error('Failed to parse notification message:', error);
                    }
                });

                broadcastSubscription.current = stompClient.current.subscribe('/topic/notifications', (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        onNotificationReceived?.(notification);
                    } catch (error) {
                        console.error('Failed to parse broadcast notification message:', error);
                    }
                });
            },
            (error) => {
                console.error('WebSocket connection error for notifications:', error);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 5000);
            }
        );
    }, [user?.id, onNotificationReceived]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (subscription.current) {
            subscription.current.unsubscribe();
            subscription.current = null;
        }

        if (broadcastSubscription.current) {
            broadcastSubscription.current.unsubscribe();
            broadcastSubscription.current = null;
        }

        if (stompClient.current?.connected) {
            stompClient.current.disconnect();
        }
    }, []);

    useEffect(() => {
        if (user?.id) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [user?.id, connect, disconnect]);

    return {
        isConnected: stompClient.current?.connected || false,
        disconnect
    };
};

