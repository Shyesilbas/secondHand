import {useCallback, useEffect, useRef, useState} from 'react';
import {Stomp} from '@stomp/stompjs';
import {WS_BASE_URL} from '../constants/apiEndpoints.js';

import logger from '../utils/logger.js';

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000; // 1s
const MAX_RECONNECT_DELAY = 30000; // 30s
/** A connection counts as healthy (backoff reset) after staying up this long. */
const STABLE_CONNECTION_MS = 10000;
/** Bellek/render: uzun oturumlarda mesaj dizisini sınırla */
const MAX_MESSAGES_BUFFER = 200;

const appendLimited = (prev, item) => {
 const next = [...prev, item];
 return next.length > MAX_MESSAGES_BUFFER ? next.slice(-MAX_MESSAGES_BUFFER) : next;
};

const useWebSocket = (userId, options = {}) => {
 const enabled = options.enabled ?? true;
 const [isConnected, setIsConnected] = useState(false);
 const [messages, setMessages] = useState([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const stompClient = useRef(null);
 const subscriptions = useRef(new Map());
 const messageCallbacks = useRef(new Set());
 const reconnectAttempt = useRef(0);
 const reconnectTimer = useRef(null);
 const stableTimer = useRef(null);

 // ==================== CONNECTION MANAGEMENT ====================
 
 const connect = useCallback(() => {
 // Without a user there is nothing to subscribe to; the cookie may already belong to someone else.
 if (!userId || stompClient.current) {
 return;
 }

 const socket = new WebSocket(WS_BASE_URL);
 const client = Stomp.over(socket);
 stompClient.current = client;
 // A client that was replaced or disconnected (logout, account switch) must not act anymore.
 const isCurrent = () => stompClient.current === client;

 // Disable debug logs to reduce console noise
 client.debug = () => {};

 client.connect(
 {},
 () => {
 if (!isCurrent()) {
 return;
 }
 setIsConnected(true);
 // Reset the backoff only once the connection stays up; a CONNECT that is followed
 // by a rejected SUBSCRIBE must keep backing off instead of retrying every second.
 clearTimeout(stableTimer.current);
 stableTimer.current = setTimeout(() => {
 if (isCurrent()) {
 reconnectAttempt.current = 0;
 }
 }, STABLE_CONNECTION_MS);

 const userSub = client.subscribe(
 `/user/${userId}/queue/messages`,
 (message) => {
 const messageData = JSON.parse(message.body);
 setMessages((prev) => appendLimited(prev, messageData));
 setUnreadCount((prev) => prev + 1);
 }
 );
 subscriptions.current.set(`user-${userId}`, userSub);
 },
 (error) => {
 if (!isCurrent()) {
 return;
 }
 logger.error('WebSocket connection error:', error);
 clearTimeout(stableTimer.current);
 setIsConnected(false);
 subscriptions.current.clear();
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
 console.warn(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempt.current}/${MAX_RECONNECT_ATTEMPTS})`);
 reconnectTimer.current = setTimeout(connect, delay);
 } else {
 logger.error(`WebSocket max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Giving up.`);
 }
 }
 );
 }, [userId]);

 const disconnect = useCallback(() => {
 clearTimeout(reconnectTimer.current);
 reconnectTimer.current = null;
 clearTimeout(stableTimer.current);
 stableTimer.current = null;
 reconnectAttempt.current = 0;

 const client = stompClient.current;
 // Clearing the ref first makes every late callback of this client a no-op.
 stompClient.current = null;
 if (client) {
 subscriptions.current.forEach((subscription) => {
 try {
 subscription.unsubscribe();
 } catch {
 // Ignore
 }
 });
 subscriptions.current.clear();

 // Use deactivate() to ensure cleanup even if still in 'connecting' state
 try {
 client.deactivate();
 } catch {
 if (client.connected) {
 client.disconnect();
 }
 }
 }
 setIsConnected(false);
 }, []);

 // ==================== SUBSCRIPTION MANAGEMENT ====================
 


 const subscribeToChatRoom = useCallback((chatRoomId) => {
 if (!stompClient.current?.connected || !chatRoomId) {
 return;
 }

 const subscription = stompClient.current.subscribe(
 `/topic/chat/${chatRoomId}`,
 (message) => {
 const messageData = JSON.parse(message.body);
 setMessages(prev => appendLimited(prev, messageData));

 // Tüm callback'leri çağır
 messageCallbacks.current.forEach(callback => {
 callback(messageData);
 });
 }
 );
 
 subscriptions.current.set(`room-${chatRoomId}`, subscription);
 }, []);

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
 if (stompClient.current?.connected) {
 stompClient.current.send('/app/chat.sendMessage', {}, JSON.stringify(message));
 }
 }, []);

 const joinRoom = useCallback((chatRoomId, senderId) => {
 if (stompClient.current?.connected) {
 stompClient.current.send('/app/chat.joinRoom', {}, JSON.stringify({
 chatRoomId,
 senderId
 }));
 }
 }, []);

 const leaveRoom = useCallback((chatRoomId, senderId) => {
 if (stompClient.current?.connected) {
 stompClient.current.send('/app/chat.leaveRoom', {}, JSON.stringify({
 chatRoomId,
 senderId
 }));
 }
 unsubscribeFromChatRoom(chatRoomId);
 }, [unsubscribeFromChatRoom]);

 const markAsRead = useCallback((chatRoomId, senderId) => {
 if (stompClient.current?.connected) {
 stompClient.current.send('/app/chat.markAsRead', {}, JSON.stringify({
 chatRoomId,
 senderId
 }));
 setUnreadCount(0);
 }
 }, []);

 // ==================== EFFECTS ====================
 
 useEffect(() => {
 if (enabled) {
 connect();
 }
 
 return () => {
 disconnect();
 };
 }, [connect, disconnect, enabled]);

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
