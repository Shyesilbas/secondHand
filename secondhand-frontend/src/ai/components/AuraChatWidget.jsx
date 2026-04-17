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

const AuraChatWidget = () => {
  const { user, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const userId = user?.id ?? null;

  const [isOpen, setIsOpen] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [agentMode, setAgentMode] = useState(AI_AGENT_MODE_ENABLED);

  const buildPayload = (text) => ({
    message: text,
    context: undefined,
    agentMode,
    uiContext: buildAuraWidgetUiContext(),
  });

  const sendApi = async (payload) => {
    const message = typeof payload === 'object' && payload != null ? payload.message : payload;
    const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
    const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;
    if (AI_AGENT_MODE_ENABLED && agentMode) {
      return aiChatService.agentQuery({ message, context, uiContext, agentMode: true });
    }
    return aiChatService.chat({ message, context });
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
    onKeyDown,
  } = useAuraChat({
    userId,
    isAuthenticated,
    initialMessages: [],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: true,
    persistMessagesSurface: 'widget',
  });

  const hasUserTurn = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const showQuickPrompts = !hasUserTurn && !isGreeting && !isSending;

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(scrollToBottom);
  }, [isOpen, messages.length, scrollToBottom]);

  const ensureGreeting = useCallback(async () => {
    const started = localStorage.getItem(storageKey) === '1';
    if (started) return;
    if (!isAuthenticated || userId == null) {
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-auth-${Date.now()}`,
          role: 'assistant',
          content:
            'Merhaba, ben Aura. Sohbet etmek için giriş yapman gerekiyor; hesabınla birlikte sana özel öneriler sunabilirim.',
          createdAt: Date.now(),
        },
      ]);
      localStorage.setItem(storageKey, '1');
      return;
    }

    setIsGreeting(true);
    try {
      const response =
        AI_AGENT_MODE_ENABLED && agentMode
          ? await aiChatService.agentQuery({
              message: 'Merhaba, kısaca kendini tanıt ve bugün nasıl yardımcı olabileceğini söyle.',
              agentMode: true,
              uiContext: buildAuraWidgetUiContext(),
            })
          : await aiChatService.chat({
              message: 'Merhaba, kısaca kendini tanıt ve bugün nasıl yardımcı olabileceğini söyle.',
            });
      const answer =
        response?.answer ||
        'Merhaba, ben Aura. SecondHand’de ilan, teklif ve güvenli alışveriş konularında yanındayım. Ne arıyorsun?';
      const hasUserMessage = messagesRef.current.some((m) => m.role === 'user');
      if (!hasUserMessage) {
        setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: answer })]);
      }
      localStorage.setItem(storageKey, '1');
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Sohbet başlatılamadı. Biraz sonra tekrar dene.');
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-error-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsGreeting(false);
    }
  }, [agentMode, isAuthenticated, messagesRef, setMessages, storageKey, userId]);

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;
    ensureGreeting();
  }, [ensureGreeting, isOpen, messages.length]);

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      <div
        className={`absolute bottom-16 right-0 origin-bottom-right transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-[380px] max-w-[calc(100vw-1.5rem)] h-[min(580px,calc(100vh-6rem))] rounded-[1.35rem] border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.AURA_CHAT);
              }}
              className="flex items-center gap-3 min-w-0 text-left group"
            >
              <div className="relative shrink-0">
                <span className="absolute inset-0 rounded-2xl bg-indigo-400/40 blur-md" aria-hidden />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg ring-1 ring-white/20">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-semibold tracking-tight truncate">Aura</div>
                <div className="text-[11px] text-indigo-200/90 truncate">Pazar yeri asistanın</div>
              </div>
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              {AI_AGENT_MODE_ENABLED ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={agentMode}
                  onClick={() => setAgentMode((v) => !v)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition ${
                    agentMode
                      ? 'bg-white/15 text-white ring-1 ring-white/25'
                      : 'bg-white/5 text-indigo-200/80 hover:bg-white/10'
                  }`}
                >
                  Agent
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-b from-slate-50/90 to-white">
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                        isUser
                          ? 'border-slate-200 bg-white text-slate-600 shadow-sm'
                          : 'border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700'
                      }`}
                    >
                      {isUser ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`min-w-0 max-w-[88%] ${isUser ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed text-left whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md'
                            : 'border border-slate-200/80 bg-white text-slate-800 shadow-sm'
                        }`}
                      >
                        {m.typing ? (
                          <div className="flex items-center gap-1.5 py-0.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                              style={{ animationDelay: '120ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                              style={{ animationDelay: '240ms' }}
                            />
                          </div>
                        ) : (
                          <>
                            {m.content}
                            {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? (
                              <AuraSuggestedListingChips listings={m.meta.suggestedListings} dense />
                            ) : null}
                            {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {m.meta.dataSources.map((source) => (
                                  <span
                                    key={`${m.id}-${source.source}`}
                                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] leading-4 text-slate-600"
                                  >
                                    {source.source}:{source.status}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {showQuickPrompts && isAuthenticated && userId != null ? (
              <div className="shrink-0 px-4 pb-2 border-t border-slate-100/80 bg-white/60">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Hızlı başla</p>
                <AuraSuggestedPrompts
                  dense
                  disabled={isSending}
                  onPick={(msg) => sendMessage({ text: msg })}
                />
              </div>
            ) : null}

            <div className="shrink-0 border-t border-slate-200/90 bg-white/95 backdrop-blur-md p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Aura’ya yaz… (Enter gönderir)"
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-300 focus:bg-white"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isSending || !input.trim()}
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-violet-500 transition-all"
                  aria-label="Gönder"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {isGreeting ? (
                <div className="mt-2 text-[10px] text-slate-400 tracking-tight">Aura hazırlanıyor…</div>
              ) : (
                <p className="mt-2 text-[10px] text-slate-400 leading-snug">
                  Bu cihazda son konuşman saklanır. Tam ekran ve geçmiş ayarları için üstteki Aura’ya tıkla.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl shadow-indigo-900/25 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center cursor-pointer ring-2 ring-white/20"
        aria-label={isOpen ? 'Aura sohbetini kapat' : 'Aura sohbetini aç'}
        aria-expanded={isOpen}
      >
        {!isOpen ? (
          <span
            className="absolute inset-0 rounded-full bg-indigo-400/25 blur-md scale-110 pointer-events-none"
            aria-hidden
          />
        ) : null}
        {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 relative z-10" />}
      </button>
    </div>
  );
};

export default AuraChatWidget;
