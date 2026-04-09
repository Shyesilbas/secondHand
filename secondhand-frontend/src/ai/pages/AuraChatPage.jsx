import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import {
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';

const AuraChatPage = () => {
  const { user } = useAuthState();
  const location = useLocation();
  const listing = location?.state?.listing || null;
  const [agentMode, setAgentMode] = React.useState(AI_AGENT_MODE_ENABLED);

  const userId = user?.id ?? null;

  const listingContext = useMemo(() => {
    if (!listing) return null;
    const parts = [
      `ListingId: ${listing.id}`,
      listing.title ? `Title: ${listing.title}` : null,
      listing.type ? `Category: ${listing.type}` : null,
      listing.price != null ? `Price: ${listing.price}` : null,
      listing.currency ? `Currency: ${listing.currency}` : null,
      listing.city ? `City: ${listing.city}` : null,
      listing.district ? `District: ${listing.district}` : null,
      listing.status ? `Status: ${listing.status}` : null,
    ].filter(Boolean);
    return parts.join(' | ');
  }, [listing]);

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
          "Hi, I'm Aura! I'm here to help you find what you're looking for on SecondHand and keep your trades secure. What are we looking for today?",
        createdAt: Date.now(),
      },
    ],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: false,
  });

  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([createChatMessage({ role: 'assistant', content: 'Please log in to continue this chat.' })]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      localStorage.removeItem(storageKey);
      setMessages([createChatMessage({ role: 'assistant', content: 'New chat created. What are we looking for today?' })]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'A new chat could not be created.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (userId == null) {
      return;
    }
    if (!window.confirm('Are you sure you want to delete all your chat history?')) {
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      localStorage.removeItem(storageKey);
      setMessages([
        createChatMessage({ role: 'assistant', content: 'History deleted. You can start a new chat with the button above.' }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Deleting chat history failed.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (userId == null) {
      return;
    }
    if (!window.confirm('Memory and chat history will be deleted. Are you sure you want to continue?')) {
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.deleteMemory();
      localStorage.removeItem(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Memory deleted. You can start a new chat with the button above.',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Deleting memory failed.');
      setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: errorMessage })]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[calc(100vh-0px)]">
        {/* Header — sayfa zemini slate-50; vurgular kart/ikon içinde */}
        <header className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-indigo-400/25 blur-md" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 ring-1 ring-slate-900/5">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Aura Assistant</h1>
              <p className="text-sm text-slate-500 mt-0.5 max-w-md">
                Your marketplace copilot — search, compare, and stay safe while you trade.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            {userId != null ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Signed in
              </span>
            ) : (
              <span className="text-xs text-amber-700">Sign in for full chat history</span>
            )}
            {AI_AGENT_MODE_ENABLED ? (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/40"
                  checked={agentMode}
                  onChange={(e) => setAgentMode(e.target.checked)}
                />
                Agent mode
              </label>
            ) : null}
          </div>
        </header>

        {/* Actions */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New chat
            </button>
            <button
              type="button"
              onClick={handleDeleteHistory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 opacity-80" />
              Clear history
            </button>
            <button
              type="button"
              onClick={handleDeleteMemory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Reset memory
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
            <span className="text-slate-600 font-medium">New chat</span> clears the conversation but keeps memory.{' '}
            <span className="text-slate-600 font-medium">Reset memory</span> removes memory and chat history.
          </p>
        </div>

        {listingContext ? (
          <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">Listing context</span>
            </div>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{listingContext}</p>
            <p className="mt-2 text-[11px] text-slate-500">Replies are tailored to this listing.</p>
          </div>
        ) : null}

        {/* Chat shell */}
        <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div
            ref={listRef}
            className="flex-1 min-h-[min(56vh,420px)] max-h-[min(60vh,560px)] overflow-y-auto px-4 py-5 sm:px-6 space-y-5"
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
                  <div className={`min-w-0 max-w-[min(100%,28rem)] ${isUser ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed text-left whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                          : 'border border-slate-200 bg-slate-50 text-slate-900'
                      }`}
                    >
                      {m.content}
                      {Array.isArray(m.meta?.dataSources) && m.meta.dataSources.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.meta.dataSources.map((source) => (
                            <span
                              key={`${m.id}-${source.source}`}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] leading-4 text-slate-600"
                            >
                              {source.source}:{source.status}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message Aura… (Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 min-h-[88px]"
                rows={2}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex h-12 sm:h-[88px] sm:w-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-600 hover:to-violet-600 transition-all sm:flex-col sm:py-0 px-5 sm:px-0"
              >
                <Send className="w-5 h-5" />
                <span className="sm:hidden">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraChatPage;
