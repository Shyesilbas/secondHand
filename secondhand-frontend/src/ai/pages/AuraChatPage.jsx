import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { aiChatService } from '../services/aiChatService.js';
import { RotateCcw, Send, Sparkles, Trash2 } from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';

const AuraChatPage = () => {
  const { user } = useAuthState();
  const location = useLocation();
  const listing = location?.state?.listing || null;

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
      if (!listingContext) return trimmed;
      return { message: trimmed, context: listingContext };
    };
  }, [listingContext]);

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
    echoUserMessageWhenUnauthed: false,
  });

  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([createChatMessage({ role: 'assistant', content: 'Please log in to continue this chat.' })]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat({ userId });
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
      await aiChatService.deleteHistory({ userId });
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
      await aiChatService.deleteMemory({ userId });
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Aura Assistant</h1>
                <p className="text-sm text-slate-500 tracking-tight">
                  Marketplace focused AI assistant. <br />
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 tracking-tight">User Id</div>
            <div className="text-sm font-semibold text-slate-900 tracking-tight">
              {userId ?? '—'}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-sm font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New chat
            </button>
            <button
              type="button"
              onClick={handleDeleteHistory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 text-slate-900 px-4 py-2.5 text-sm font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete chat history
            </button>
            <button
              type="button"
              onClick={handleDeleteMemory}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 text-red-700 px-4 py-2.5 text-sm font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete memory and chat history
            </button>
          </div>
          <div className="mt-2 text-xs text-slate-500 tracking-tight">
            New chat: clears history,Keeps memory. Delete memory: memory + history will be deleted.
          </div>
        </div>

        {listingContext ? (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700 tracking-tight">Aura sees this listing</span>
            </div>
            <div className="text-sm text-slate-800 tracking-tight whitespace-pre-wrap">{listingContext}</div>
            <p className="mt-2 text-xs text-slate-500 tracking-tight">Replies will be tailored to this item.</p>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div ref={listRef} className="h-[520px] overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 tracking-tight whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message... (Enter sends, Shift+Enter for a new line)"
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300"
                rows={2}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold tracking-tight cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraChatPage;

