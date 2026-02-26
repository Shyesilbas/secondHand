import { useEffect, useRef, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { WS_BASE_URL } from '../../common/constants/apiEndpoints.js';
import logger from '../../common/utils/logger.js';

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export const useNotificationWebSocket = (onNotificationReceived) => {
    const { user } = useAuthState();
    const stompClient = useRef(null);
    const subscription = useRef(null);
    const broadcastSubscription = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempt = useRef(0);

    const connect = useCallback(() => {
        if (!user?.id) {
            return;
        }

        if (stompClient.current?.connected) {
            return;
        }

        const socket = new WebSocket(WS_BASE_URL);
        stompClient.current = Stomp.over(socket);
        stompClient.current.debug = () => {};

        stompClient.current.connect(
            {},
            () => {
                reconnectAttempt.current = 0; // Reset on successful connection

                const destination = `/user/${user.id}/notifications`;
                subscription.current = stompClient.current.subscribe(destination, (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        onNotificationReceived?.(notification);
                    } catch (error) {
                        logger.error('Failed to parse notification message:', error);
                    }
                });

                broadcastSubscription.current = stompClient.current.subscribe('/topic/notifications', (message) => {
                    try {
                        const notification = JSON.parse(message.body);
                        onNotificationReceived?.(notification);
                    } catch (error) {
                        logger.error('Failed to parse broadcast notification message:', error);
                    }
                });
            },
            (error) => {
                logger.error('WebSocket connection error for notifications:', error);

                if (reconnectAttempt.current < MAX_RECONNECT_ATTEMPTS) {
                    const delay = Math.min(
                        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempt.current),
                        MAX_RECONNECT_DELAY
                    );
                    reconnectAttempt.current += 1;
                    console.warn(`Notification WS reconnecting in ${delay}ms (attempt ${reconnectAttempt.current}/${MAX_RECONNECT_ATTEMPTS})`);
                    reconnectTimeoutRef.current = setTimeout(connect, delay);
                } else {
                    logger.error(`Notification WS max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached.`);
                }
            }
        );
    }, [user?.id, onNotificationReceived]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        reconnectAttempt.current = 0;

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

