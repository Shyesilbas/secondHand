import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import { Bot, RotateCcw, Send, Sparkles, Trash2, UserRound } from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAuraPersistedMessages, createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraListingContextCard from '../components/AuraListingContextCard.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import { buildAuraListingSessionContext } from '../utils/auraListingContext.js';

const AuraChatPage = () => {
  const { user } = useAuthState();
  const location = useLocation();
  const listing = location?.state?.listing || null;
  const [agentMode, setAgentMode] = React.useState(AI_AGENT_MODE_ENABLED);

  const userId = user?.id ?? null;

  const listingContext = useMemo(() => buildAuraListingSessionContext(listing), [listing]);

  const buildPayload = useMemo(() => {
    return (text) => {
      const trimmed = text.trim();
      return {
        message: trimmed,
        context: listingContext || undefined,
        agentMode,
        uiContext: {
          currentPage: 'AuraChatPage',
          route: location.pathname,
          listingId: listing?.id ? String(listing.id) : undefined,
        },
      };
    };
  }, [agentMode, listing?.id, listingContext, location.pathname]);

  const sendApi = useMemo(() => {
    return async (payload) => {
      const message = typeof payload === 'object' && payload != null ? payload.message : payload;
      const context = typeof payload === 'object' && payload != null ? payload.context : undefined;
      const uiContext = typeof payload === 'object' && payload != null ? payload.uiContext : undefined;

      if (AI_AGENT_MODE_ENABLED && agentMode) {
        return aiChatService.agentQuery({ message, context, uiContext, agentMode: true });
      }
      return aiChatService.chat({ message, context });
    };
  }, [agentMode]);

  const {
    storageKey,
    messages,
    setMessages,
    input,
    setInput,
    isSending,
    setIsSending,
    listRef,
    sendMessage,
    onKeyDown,
    scrollToBottom,
  } = useAuraChat({
    userId,
    isAuthenticated: userId != null,
    initialMessages: [
      {
        id: 'aura-welcome',
        role: 'assistant',
        content:
          'Merhaba, ben Aura. SecondHand’de ilan arama, teklif, güvenli ödeme ve vitrin gibi konularda yanındayım. Bugün neye ihtiyacın var?',
        createdAt: Date.now(),
      },
    ],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: false,
    persistMessagesSurface: 'page',
  });

  const hasUserTurn = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);
  const showQuickPrompts = userId != null && !hasUserTurn && !isSending;

  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Devam etmek için lütfen giriş yap.',
        }),
      ]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Yeni sohbet başladı. Bugün neye bakıyoruz?',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Yeni sohbet oluşturulamadı.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (userId == null) {
      return;
    }
    if (!window.confirm('Tüm sohbet geçmişin silinsin mi?')) {
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Geçmiş temizlendi. Aşağıdan yeni bir konuşma başlatabilirsin.',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Geçmiş silinemedi.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (userId == null) {
      return;
    }
    if (!window.confirm('Bellek ve sohbet geçmişi silinecek. Devam edilsin mi?')) {
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.deleteMemory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Bellek sıfırlandı. İstersen aşağıdan yeni sohbet başlat.',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Bellek silinemedi.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.12),transparent)] bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col min-h-[calc(100vh-0px)]">
        <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/30 blur-xl scale-110" aria-hidden />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-600 to-indigo-700 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <Sparkles className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Aura</h1>
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-600/90 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5">
                  Önizleme
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-slate-600 max-w-xl leading-relaxed">
                İkinci el alışverişinde yol gösteren asistanın. İlan, teklif, ödeme ve güvenlik sorularında buradayım.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                <span className="font-medium text-slate-600">Eski sohbetler:</span> Bu sayfadaki son konuşman tarayıcıda saklanır;
                cihazlar arası senkron veya sohbet listesi için sunucu tarafı oturumlar gerekir — şimdilik tek akış üzerinden
                ilerliyoruz.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            {userId != null ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-xs text-emerald-900 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Oturum açık
              </span>
            ) : (
              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5">
                Tam deneyim için giriş yap
              </span>
            )}
            {AI_AGENT_MODE_ENABLED ? (
              <button
                type="button"
                role="switch"
                aria-checked={agentMode}
                onClick={() => setAgentMode((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition shadow-sm ${
                  agentMode
                    ? 'border-indigo-200 bg-white text-indigo-900 ring-1 ring-indigo-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Agent modu {agentMode ? 'açık' : 'kapalı'}
              </button>
            ) : null}
          </div>
        </header>

        <div className="mb-5 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm p-4 shadow-sm shadow-slate-900/5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Yeni sohbet
            </button>
            <button
              type="button"
              onClick={handleDeleteHistory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 opacity-80" />
              Geçmişi temizle
            </button>
            <button
              type="button"
              onClick={handleDeleteMemory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Belleği sıfırla
            </button>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            <span className="text-slate-700 font-medium">Yeni sohbet</span> mesajları sıfırlar; öğrenilen tercihler (bellek)
            kalır. <span className="text-slate-700 font-medium">Belleği sıfırla</span> hem bellek hem sunucudaki sohbet
            geçmişini temizler.
          </p>
        </div>

        {listing ? <AuraListingContextCard listing={listing} /> : null}

        <div className="flex-1 flex flex-col min-h-0 rounded-[1.25rem] border border-slate-200/90 bg-white shadow-xl shadow-slate-900/5 overflow-hidden ring-1 ring-slate-900/5">
          <div
            ref={listRef}
            className="flex-1 min-h-[min(52vh,440px)] max-h-[min(58vh,560px)] overflow-y-auto px-4 py-5 sm:px-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white"
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                      isUser
                        ? 'border-slate-200 bg-white text-slate-700 shadow-sm'
                        : 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700'
                    }`}
                  >
                    {isUser ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`min-w-0 max-w-[min(100%,32rem)] ${isUser ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed text-left whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20'
                          : 'border border-slate-200/90 bg-white text-slate-900 shadow-sm'
                      }`}
                    >
                      {m.typing ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <span
                            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                            style={{ animationDelay: '120ms' }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                            style={{ animationDelay: '240ms' }}
                          />
                        </div>
                      ) : (
                        <>
                          {m.content}
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? (
                            <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
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

          {showQuickPrompts ? (
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Önerilen sorular</p>
              <AuraSuggestedPrompts disabled={isSending} onPick={(msg) => sendMessage({ text: msg })} />
            </div>
          ) : null}

          <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Aura’ya yaz… (Enter gönderir, Shift+Enter satır)"
                className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white min-h-[88px]"
                rows={2}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex h-12 sm:h-[88px] sm:w-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-violet-500 transition-all sm:flex-col sm:py-0 px-5 sm:px-0"
              >
                <Send className="w-5 h-5" />
                <span className="sm:hidden text-sm">Gönder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraChatPage;
