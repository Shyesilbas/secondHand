import {useCallback, useEffect, useRef} from 'react';
import {Stomp} from '@stomp/stompjs';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {WS_BASE_URL} from '../../common/constants/apiEndpoints.js';

import logger from '../../common/utils/logger.js';

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
/** A connection counts as healthy (backoff reset) after staying up this long. */
const STABLE_CONNECTION_MS = 10000;

export const useNotificationWebSocket = (onNotificationReceived) => {
 const { user } = useAuthState();
 const stompClient = useRef(null);
 const subscription = useRef(null);
 const broadcastSubscription = useRef(null);
 const reconnectTimeoutRef = useRef(null);
 const reconnectAttempt = useRef(0);
 const stableTimer = useRef(null);

 const connect = useCallback(() => {
 if (!user?.id || stompClient.current) {
 return;
 }

 const userId = user.id;
 const socket = new WebSocket(WS_BASE_URL);
 const client = Stomp.over(socket);
 stompClient.current = client;
 // A client that was replaced or disconnected (logout, account switch) must not act anymore.
 const isCurrent = () => stompClient.current === client;
 client.debug = () => {};

 client.connect(
 {},
 () => {
 if (!isCurrent()) {
 return;
 }
 // Reset the backoff only once the connection stays up; a CONNECT that is followed
 // by a rejected SUBSCRIBE must keep backing off instead of retrying every second.
 clearTimeout(stableTimer.current);
 stableTimer.current = setTimeout(() => {
 if (isCurrent()) {
 reconnectAttempt.current = 0;
 }
 }, STABLE_CONNECTION_MS);

 const destination = `/user/${userId}/notifications`;
 subscription.current = client.subscribe(destination, (message) => {
 try {
 const notification = JSON.parse(message.body);
 onNotificationReceived?.(notification);
 } catch (error) {
 logger.error('Failed to parse notification message:', error);
 }
 });

 broadcastSubscription.current = client.subscribe('/topic/notifications', (message) => {
 try {
 const notification = JSON.parse(message.body);
 onNotificationReceived?.(notification);
 } catch (error) {
 logger.error('Failed to parse broadcast notification message:', error);
 }
 });
 },
 (error) => {
 if (!isCurrent()) {
 return;
 }
 logger.error('WebSocket connection error for notifications:', error);
 clearTimeout(stableTimer.current);
 subscription.current = null;
 broadcastSubscription.current = null;
 stompClient.current = null;
 try {
 client.deactivate();
 } catch {
 // Ignore
 }

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
 clearTimeout(reconnectTimeoutRef.current);
 reconnectTimeoutRef.current = null;
 clearTimeout(stableTimer.current);
 stableTimer.current = null;
 reconnectAttempt.current = 0;

 const client = stompClient.current;
 // Clearing the ref first makes every late callback of this client a no-op.
 stompClient.current = null;
 [subscription, broadcastSubscription].forEach((ref) => {
 try {
 ref.current?.unsubscribe();
 } catch {
 // Ignore
 }
 ref.current = null;
 });

 if (client) {
 try {
 client.deactivate();
 } catch {
 if (client.connected) {
 client.disconnect();
 }
 }
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

