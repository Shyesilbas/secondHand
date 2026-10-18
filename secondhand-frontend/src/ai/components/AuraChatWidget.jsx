import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import { Bot, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { createChatMessage } from '../utils/auraChatUtils.js';
import { buildAuraWidgetUiContext } from '../utils/auraWidgetContext.js';

import AuraSuggestedListingChips from './AuraSuggestedListingChips.jsx';
import { cacheService } from '../../common/services/cacheService.js';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
// The full-page chat replaces the widget; a separate component keeps hook order stable across routes.
const AuraChatWidget = () => {
 const location = useLocation();
 if (location.pathname === ROUTES.AURA_CHAT) return null;
 return <AuraChatWidgetPanel />;
};

const AuraChatWidgetPanel = () => {
 const {
 t
 } = useTranslation();
 const {
 user,
 isAuthenticated
 } = useAuthState();
 const navigate = useNavigate();
 const userId = user?.id ?? null;
 const [isOpen, setIsOpen] = useState(false);
 const [agentMode, setAgentMode] = useState(AI_AGENT_MODE_ENABLED);
 const [showUpgradeModal, setShowUpgradeModal] = useState(false);
 const [upgradeHint, setUpgradeHint] = useState('');
 const buildPayload = text => ({
 message: text,
 context: undefined,
 agentMode,
 uiContext: buildAuraWidgetUiContext()
 });
 const sendApi = async payload => {
 const message = typeof payload === 'object' && payload != null ? payload.message : payload;
 const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
 const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;
 try {
 if (AI_AGENT_MODE_ENABLED && agentMode) {
 return await aiChatService.agentQuery({
 message,
 context,
 uiContext,
 agentMode: true
 });
 }
 return await aiChatService.chat({
 message,
 context
 });
 } catch (error) {
 if (error.response?.data?.error === 'AURA_DAILY_LIMIT_EXCEEDED') {
 setShowUpgradeModal(true);
 setUpgradeHint(t("aura_daily_limit_exceeded") || 'Günlük Aura AI limitinize ulaştınız.');
 throw error;
 }
 throw error;
 }
 };
 const {
 storageKey,
 messages,
 setMessages,
 messagesRef,
 input,
 setInput,
 isSending,
 listRef,
 scrollToBottom,
 sendMessage,
 onKeyDown
 } = useAuraChat({
 userId,
 isAuthenticated,
 initialMessages: [],
 withTyping: true,
 buildPayload,
 sendApi,
 echoUserMessageWhenUnauthed: true,
 persistMessagesSurface: 'widget'
 });


 useEffect(() => {
 if (!isOpen) return;
 queueMicrotask(scrollToBottom);
 }, [isOpen, messages.length, scrollToBottom]);
 const ensureGreeting = useCallback(() => {
 const started = cacheService.get(storageKey) === '1';
 if (started) return;
 if (!isAuthenticated || userId == null) {
 setMessages(prev => [...prev, {
 id: `aura-auth-${Date.now()}`,
 role: 'assistant',
 content: "Hi, I'm Aura. You need to log in to chat; with your account, I can offer personalized recommendations.",
 createdAt: Date.now()
 }]);
 cacheService.set(storageKey, '1');
 return;
 }
 const randomIdx = Math.floor(Math.random() * 6) + 1;
 const answer = t(`aura_greeting_${randomIdx}`);
 const hasUserMessage = messagesRef.current.some(m => m.role === 'user');
 if (!hasUserMessage) {
 setMessages(prev => [...prev, createChatMessage({
 role: 'assistant',
 content: answer
 })]);
 }
 cacheService.set(storageKey, '1');
 }, [isAuthenticated, messagesRef, setMessages, storageKey, userId, t]);
 useEffect(() => {
 if (!isOpen) return;
 if (messages.length > 0) return;
 ensureGreeting();
 }, [ensureGreeting, isOpen, messages.length]);
 return <div className="fixed bottom-5 right-5 z-modal">
 <div className={`absolute bottom-16 right-0 origin-bottom-right transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
 <div className="w-96 max-w-[calc(100vw-1.5rem)] h-[min(580px,calc(100vh-6rem))] rounded-md border border-border-light/90 bg-background-primary overflow-hidden flex flex-col">
 {/* Header */}
 <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-border-light bg-primary text-white">
 <button type="button" onClick={() => {
 setIsOpen(false);
 const uiContext = buildAuraWidgetUiContext();
 navigate(ROUTES.AURA_CHAT, {
 state: uiContext?.listingId ? { listingId: uiContext.listingId } : undefined
 });
 }} className="flex items-center gap-3 min-w-0 text-left group">
 <div className="relative shrink-0">
 <div className="relative flex h-10 w-10 items-center justify-center">
 <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
 </div>
 </div>
 <div className="leading-tight min-w-0">
 <div className="text-sm font-semibold tracking-tight truncate">{t("aura")}</div>
 <div className="text-xs text-primary/90 truncate">{t("your_marketplace_assistant")}</div>
 </div>
 </button>
 <div className="flex items-center gap-1.5 shrink-0">
 {AI_AGENT_MODE_ENABLED ? <button type="button" role="switch" aria-checked={agentMode} onClick={() => setAgentMode(v => !v)} className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition ${agentMode ? 'bg-background-primary/15 text-white ring-1 ring-white/25' : 'bg-background-primary/5 text-primary/80 hover:bg-background-primary/10'}`}>{t("agent")}</button> : null}
 <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded hover:bg-background-primary/10 text-white/80 hover:text-white transition-colors" aria-label={t("close")}>
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 min-h-0 flex flex-col bg-background-secondary/90">
 <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
 {messages.map(m => {
 const isUser = m.role === 'user';
 return <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
 <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${isUser ? 'border-border-light bg-background-primary text-text-secondary' : 'border-border-light bg-background-secondary text-primary'}`}>
 {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
 </div>
 <div className={`min-w-0 max-w-[88%] ${isUser ? 'text-right' : ''}`}>
 <div className={`inline-block rounded-md px-3.5 py-2.5 text-sm leading-relaxed text-left whitespace-pre-wrap ${isUser ? 'bg-primary text-white rounded-tr-sm' : 'border border-border/50 bg-background-tertiary/30 text-text-primary rounded-tl-sm'}`}>
 {m.typing ? <div className="flex items-center gap-1.5 py-0.5">
 <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{
 animationDelay: '0ms'
 }} />
 <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{
 animationDelay: '120ms'
 }} />
 <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{
 animationDelay: '240ms'
 }} />
 </div> : <>
 {m.content}
 {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? <AuraSuggestedListingChips listings={m.meta.suggestedListings} dense /> : null}
 {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? <div className="mt-2 flex flex-wrap gap-1.5">
 {m.meta.dataSources.map(source => <span key={`${m.id}-${source.source}`} className="rounded-sm border border-border-light bg-background-secondary px-2 py-0.5 text-xs leading-4 text-text-secondary">
 {source.source}:{source.status}
 </span>)}
 </div> : null}
 </>}
 </div>
 </div>
 </div>;
 })}
 </div>



 <div className="shrink-0 border-t border-border-light/90 bg-background-primary p-3">
 <div className="flex items-end gap-2">
 <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={t("write_to_aura_enter_to_send")} className="flex-1 resize-none rounded-md border border-border-light bg-background-secondary/80 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-background-primary" rows={2} />
 <button type="button" onClick={() => sendMessage()} disabled={isSending || !input.trim()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 w-11" aria-label={t("send")}>
 <Send className="w-4 h-4" />
 </button>
 </div>
 <p className="mt-2 text-xs text-text-muted leading-snug">{t("your_last_conversation_is_stored_on_this")}</p>
 </div>
 </div>
 </div>
 </div>

 <button type="button" onClick={() => setIsOpen(v => !v)} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 relative w-14" aria-label={isOpen ? 'Close Aura chat' : 'Open Aura chat'} aria-expanded={isOpen}>
 {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 relative z-10" />}
 </button>

 <PremiumUpgradeModal
 isOpen={showUpgradeModal}
 onClose={() => setShowUpgradeModal(false)}
 featureHint={upgradeHint}
 />
 </div>;
};
export default AuraChatWidget;