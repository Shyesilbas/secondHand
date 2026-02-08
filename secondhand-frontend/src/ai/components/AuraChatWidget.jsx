import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { aiChatService } from '../services/aiChatService.js';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';

const AuraChatWidget = () => {
  const { user, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const userId = user?.id ?? null;

  const [isOpen, setIsOpen] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const {
    storageKey,
    messages,
    setMessages,
    messagesRef,
    input,
    setInput,
    isSending,
    setIsSending,
    listRef,
    scrollToBottom,
    sendMessage,
    onKeyDown,
  } = useAuraChat({
    userId,
    isAuthenticated,
    initialMessages: [],
    withTyping: true,
    buildPayload: (text) => text,
    echoUserMessageWhenUnauthed: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(scrollToBottom);
  }, [isOpen, messages.length]);

  const ensureGreeting = async () => {
    const started = localStorage.getItem(storageKey) === '1';
    if (started) return;
    if (!isAuthenticated || userId == null) {
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-auth-${Date.now()}`,
          role: 'assistant',
          content: 'Hi, I’m Aura. Please log in to start chatting.',
          createdAt: Date.now(),
        },
      ]);
      localStorage.setItem(storageKey, '1');
      return;
    }

    setIsGreeting(true);
    try {
      const response = await aiChatService.chat({ userId, message: 'Hello' });
      const answer = response?.answer || "Hi, I'm Aura. What are you looking for today?";
      const hasUserMessage = messagesRef.current.some((m) => m.role === 'user');
      if (!hasUserMessage) {
        setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: answer })]);
      }
      localStorage.setItem(storageKey, '1');
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Chat could not be started.');
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
  };

  useEffect(() => {
    if (!isOpen) return;
    if (messages.length > 0) return;
    ensureGreeting();
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      <div
        className={`absolute bottom-16 right-0 origin-bottom-right transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="w-[360px] max-w-[400px] h-[560px] max-h-[600px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(ROUTES.AURA_CHAT);
              }}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">Aura - Asistanın</div>
                <div className="text-xs text-slate-500 tracking-tight">Ayarlar ve geçmiş</div>
              </div>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col h-[calc(560px-64px)]">
            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 tracking-tight whitespace-pre-wrap ${
                      m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    {m.typing ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message... (Enter sends)"
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300"
                  rows={2}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isSending || !input.trim()}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {isGreeting ? (
                <div className="mt-2 text-[11px] text-slate-400 tracking-tight">
                  Aura is getting ready...
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all duration-200 flex items-center justify-center cursor-pointer"
        aria-label="Open Aura chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AuraChatWidget;

