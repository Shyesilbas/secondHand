import { cacheService } from '../../common/services/cacheService.js';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';

export const getAuraChatStorageKey = (userId) =>
 userId != null ? `aura.chat.started.${userId}` : 'aura.chat.started.anonymous';

/** Oturum mesajları — sadece bu tarayıcıda; çoklu “sohbet listesi” için sunucu tarafı gerekir. */
export const getAuraChatMessagesStorageKey = (userId, surface) =>
 userId != null ? `aura.chat.messages.${surface}.${userId}` : `aura.chat.messages.${surface}.anonymous`;

const clearAuraPersistedMessages = (userId, surface) => {
 try {
 cacheService.remove(getAuraChatMessagesStorageKey(userId, surface));
 } catch {
 /* ignore */
 }
};

export const clearAllAuraPersistedMessages = (userId) => {
 clearAuraPersistedMessages(userId, 'page');
 clearAuraPersistedMessages(userId, 'widget');
};

export const createAuraChatId = (prefix) =>
 `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getApiErrorMessage = (error, fallback) =>
 error?.response?.data?.message || error?.message || fallback;

export const createChatMessage = ({ role, content, typing = false, meta = undefined }) => ({
 id: createAuraChatId(role === 'user' ? 'user' : 'aura'),
 role,
 content,
 typing,
 meta,
 createdAt: Date.now(),
});

export const sendAuraRequest = async ({ payload, agentMode, fallbackToChat = false, onLimitExceeded }) => {
 const message = typeof payload === 'object' && payload != null ? payload.message : payload;
 const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
 const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;

 try {
 if (AI_AGENT_MODE_ENABLED && agentMode) {
 try {
 return await aiChatService.agentQuery({
 message,
 context,
 uiContext,
 agentMode: true,
 });
 } catch (agentErr) {
 if (!fallbackToChat) throw agentErr;
 return await aiChatService.chat({
 message,
 context,
 });
 }
 }
 return await aiChatService.chat({
 message,
 context,
 });
 } catch (error) {
 if (error.response?.data?.error === 'AURA_DAILY_LIMIT_EXCEEDED' || error.errorCode === 'AURA_LIMIT_EXCEEDED') {
 onLimitExceeded?.();
 }
 throw error;
 }
};
