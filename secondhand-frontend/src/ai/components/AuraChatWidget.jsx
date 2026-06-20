import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import { Bot, MessageCircle, Send, Sparkles, UserRound, X } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import { buildAuraWidgetUiContext } from '../utils/auraWidgetContext.js';
import AuraSuggestedPrompts from './AuraSuggestedPrompts.jsx';
import AuraSuggestedListingChips from './AuraSuggestedListingChips.jsx';
import { cacheService } from '../../common/services/cacheService.js';
const AuraChatWidget = () => {
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
  const [isGreeting, setIsGreeting] = useState(false);
  const [agentMode, setAgentMode] = useState(AI_AGENT_MODE_ENABLED);
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
    if (AI_AGENT_MODE_ENABLED && agentMode) {
      return aiChatService.agentQuery({
        message,
        context,
        uiContext,
        agentMode: true
      });
    }
    return aiChatService.chat({
      message,
      context
    });
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
  const hasUserTurn = useMemo(() => messages.some(m => m.role === 'user'), [messages]);
  const showQuickPrompts = !hasUserTurn && !isGreeting && !isSending;
  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(scrollToBottom);
  }, [isOpen, messages.length, scrollToBottom]);
  const ensureGreeting = useCallback(async () => {
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
    setIsGreeting(true);
    try {
      const response = AI_AGENT_MODE_ENABLED && agentMode ? await aiChatService.agentQuery({
        message: 'Hello, introduce yourself briefly and tell me how you can help today.',
        agentMode: true,
        uiContext: buildAuraWidgetUiContext()
      }) : await aiChatService.chat({
        message: 'Hello, introduce yourself briefly and tell me how you can help today.'
      });
      const answer = response?.answer || "Hi, I'm Aura. I'm here to help you with listings, offers, and secure shopping on SecondHand. What are you looking for?";
      const hasUserMessage = messagesRef.current.some(m => m.role === 'user');
      if (!hasUserMessage) {
        setMessages(prev => [...prev, createChatMessage({
          role: 'assistant',
          content: answer
        })]);
      }
      cacheService.set(storageKey, '1');
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Could not start chat. Please try again in a moment.');
      setMessages(prev => [...prev, {
        id: `aura-error-${Date.now()}`,
        role: 'assistant',
        content: errorMessage,
        createdAt: Date.now()
      }]);
    } finally {
      setIsGreeting(false);
    }
  }, [agentMode, isAuthenticated, messagesRef, setMessages, storageKey, userId]);
  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;
    ensureGreeting();
  }, [ensureGreeting, isOpen, messages.length]);
  return <div className="fixed bottom-5 right-5 z-[120]">
      <div className={`absolute bottom-16 right-0 origin-bottom-right transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="w-[380px] max-w-[calc(100vw-1.5rem)] h-[min(580px,calc(100vh-6rem))] rounded-2xl border border-border-light/90 bg-background-primary shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
            <button type="button" onClick={() => {
            setIsOpen(false);
            navigate(ROUTES.AURA_CHAT);
          }} className="flex items-center gap-3 min-w-0 text-left group">
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-2xl bg-primary/40 blur-md" aria-hidden />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg ring-1 ring-white/20">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-semibold tracking-tight truncate">{t("aura")}</div>
                <div className="text-caption text-primary/90 truncate">{t("your_marketplace_assistant")}</div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              {AI_AGENT_MODE_ENABLED ? <button type="button" role="switch" aria-checked={agentMode} onClick={() => setAgentMode(v => !v)} className={`rounded-full px-2.5 py-1 text-caption font-semibold uppercase tracking-wide transition ${agentMode ? 'bg-background-primary/15 text-white ring-1 ring-white/25' : 'bg-background-primary/5 text-primary/80 hover:bg-background-primary/10'}`}>{t("agent")}</button> : null}
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-background-primary/10 text-white/80 hover:text-white transition-colors" aria-label={t("close")}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-50/90 to-white">
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map(m => {
              const isUser = m.role === 'user';
              return <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${isUser ? 'border-border-light bg-background-primary text-slate-600 shadow-sm' : 'border-primary/80 bg-gradient-to-br from-indigo-50 to-violet-50 text-primary'}`}>
                      {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`min-w-0 max-w-[88%] ${isUser ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed text-left whitespace-pre-wrap ${isUser ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md' : 'border border-border-light/80 bg-background-primary text-slate-800 shadow-sm'}`}>
                        {m.typing ? <div className="flex items-center gap-1.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{
                        animationDelay: '0ms'
                      }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{
                        animationDelay: '120ms'
                      }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{
                        animationDelay: '240ms'
                      }} />
                          </div> : <>
                            {m.content}
                            {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? <AuraSuggestedListingChips listings={m.meta.suggestedListings} dense /> : null}
                            {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? <div className="mt-2 flex flex-wrap gap-1.5">
                                {m.meta.dataSources.map(source => <span key={`${m.id}-${source.source}`} className="rounded-full border border-border-light bg-slate-50 px-2 py-0.5 text-caption leading-4 text-slate-600">
                                    {source.source}:{source.status}
                                  </span>)}
                              </div> : null}
                          </>}
                      </div>
                    </div>
                  </div>;
            })}
            </div>

            {showQuickPrompts && isAuthenticated && userId != null ? <div className="shrink-0 px-4 pb-2 border-t border-slate-100/80 bg-background-primary/60">
                <p className="text-caption font-medium text-slate-500 uppercase tracking-wider mb-2">{t("quick_start")}</p>
                <AuraSuggestedPrompts dense disabled={isSending} onPick={msg => sendMessage({
              text: msg
            })} />
              </div> : null}

            <div className="shrink-0 border-t border-border-light/90 bg-background-primary/95 backdrop-blur-md p-3">
              <div className="flex items-end gap-2">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={t("write_to_aura_enter_to_send")} className="flex-1 resize-none rounded-2xl border border-border-light bg-slate-50/80 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-primary focus:bg-background-primary" rows={2} />
                <button type="button" onClick={() => sendMessage()} disabled={isSending || !input.trim()} className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-violet-500 transition-all" aria-label={t("send")}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {isGreeting ? <div className="mt-2 text-caption text-slate-400 tracking-tight">{t("aura_is_preparing")}</div> : <p className="mt-2 text-caption text-slate-400 leading-snug">{t("your_last_conversation_is_stored_on_this")}</p>}
            </div>
          </div>
        </div>
      </div>

      <button type="button" onClick={() => setIsOpen(v => !v)} className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl shadow-indigo-900/25 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center cursor-pointer ring-2 ring-white/20" aria-label={isOpen ? 'Close Aura chat' : 'Open Aura chat'} aria-expanded={isOpen}>
        {!isOpen ? <span className="absolute inset-0 rounded-full bg-primary/25 blur-md scale-110 pointer-events-none" aria-hidden /> : null}
        {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 relative z-10" />}
      </button>
    </div>;
};
export default AuraChatWidget;