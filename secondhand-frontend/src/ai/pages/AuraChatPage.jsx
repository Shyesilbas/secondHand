import React, {useMemo} from 'react';
import {useLocation} from 'react-router-dom';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {AI_AGENT_MODE_ENABLED} from '../config/agentConfig.js';
import {aiChatService} from '../services/aiChatService.js';
import {Bot, RotateCcw, Send, Sparkles, Trash2, UserRound, Zap, Shield} from 'lucide-react';
import {useAuraChat} from '../hooks/useAuraChat.js';
import {clearAuraPersistedMessages, createChatMessage, getApiErrorMessage} from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraListingContextCard from '../components/AuraListingContextCard.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import {buildAuraListingSessionContext} from '../utils/auraListingContext.js';

const AuraChatPage = () => {
  const {user} = useAuthState();
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
        return aiChatService.agentQuery({message, context, uiContext, agentMode: true});
      }
      return aiChatService.chat({message, context});
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
          'Merhaba, ben Aura. SecondHand\'de ilan arama, teklif, güvenli ödeme ve vitrin gibi konularda yanındayım. Bugün neye ihtiyacın var?',
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
      setMessages([createChatMessage({role: 'assistant', content: 'Devam etmek için lütfen giriş yap.'})]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: 'Yeni sohbet başladı. Bugün neye bakıyoruz?'})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Yeni sohbet oluşturulamadı.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (userId == null) return;
    if (!window.confirm('Tüm sohbet geçmişin silinsin mi?')) return;
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: 'Geçmiş temizlendi. Aşağıdan yeni bir konuşma başlatabilirsin.'})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Geçmiş silinemedi.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (userId == null) return;
    if (!window.confirm('Bellek ve sohbet geçmişi silinecek. Devam edilsin mi?')) return;
    setIsSending(true);
    try {
      await aiChatService.deleteMemory();
      clearAuraPersistedMessages(userId, 'page');
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({role: 'assistant', content: 'Bellek sıfırlandı. İstersen aşağıdan yeni sohbet başlat.'})]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Bellek silinemedi.');
      setMessages((prev) => [...prev, createChatMessage({role: 'assistant', content: errorMessage})]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 flex flex-col">

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 tracking-tight">Aura</h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-100 rounded-md">
                    Beta
                  </span>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">AI Shopping Assistant</p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              {AI_AGENT_MODE_ENABLED && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={agentMode}
                  onClick={() => setAgentMode((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    agentMode
                      ? 'bg-violet-50 text-violet-700 border border-violet-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Agent {agentMode ? 'ON' : 'OFF'}
                </button>
              )}

              {userId != null ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-700">
                  Giriş yap
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">

        {/* Action bar */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Yeni sohbet
          </button>
          <button
            type="button"
            onClick={handleDeleteHistory}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Geçmiş
          </button>
          <button
            type="button"
            onClick={handleDeleteMemory}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-white text-xs font-medium text-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
          >
            <Shield className="w-3 h-3" />
            Bellek
          </button>
        </div>

        {/* Listing context */}
        {listing ? <AuraListingContextCard listing={listing} /> : null}

        {/* Chat container */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 space-y-5"
            style={{minHeight: 'min(50vh, 400px)', maxHeight: 'min(60vh, 600px)'}}
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isUser
                      ? 'bg-gray-900 text-white'
                      : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm shadow-violet-500/20'
                  }`}>
                    {isUser ? <UserRound className="h-4 w-4" /> : <Sparkles className="h-3.5 w-3.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`min-w-0 max-w-[min(100%,30rem)] ${isUser ? 'text-right' : ''}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed text-left whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-800'
                    }`}>
                      {m.typing ? (
                        <div className="flex items-center gap-1.5 py-1 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '0ms'}} />
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '150ms'}} />
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '300ms'}} />
                        </div>
                      ) : (
                        <>
                          {m.content}
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 ? (
                            <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                          ) : null}
                          {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {m.meta.dataSources.map((source) => (
                                <span
                                  key={`${m.id}-${source.source}`}
                                  className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 border border-gray-200/60"
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

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="shrink-0 border-t border-gray-100 px-5 py-4 sm:px-6">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Önerilen sorular</p>
              <AuraSuggestedPrompts disabled={isSending} onPick={(msg) => sendMessage({text: msg})} />
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Aura'ya yaz… (Enter gönderir, Shift+Enter satır)"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:bg-white min-h-[52px] max-h-[160px] transition-all duration-200"
                  rows={1}
                />
              </div>
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/30 active:scale-95 transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Aura hata yapabilir. Önemli bilgileri doğrulamanız önerilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraChatPage;
