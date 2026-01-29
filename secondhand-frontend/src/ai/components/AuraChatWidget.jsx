import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { aiChatService } from '../services/aiChatService.js';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';

const AuraChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id ?? null;

  const storageKey = useMemo(() => (userId != null ? `aura.chat.started.${userId}` : 'aura.chat.started.anonymous'), [userId]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(scrollToBottom);
  }, [isOpen, messages.length]);

  const addTyping = () => {
    const id = `typing-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: 'assistant',
        content: '',
        typing: true,
        createdAt: Date.now(),
      },
    ]);
    return id;
  };

  const replaceTypingWith = (typingId, content) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === typingId);
      const without = idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
      return [
        ...without,
        {
          id: `aura-${Date.now()}`,
          role: 'assistant',
          content,
          createdAt: Date.now(),
        },
      ];
    });
  };

  const removeTyping = (typingId) => {
    if (!typingId) {
      setMessages((prev) => prev.filter((m) => !m.typing));
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== typingId));
  };

  const ensureGreeting = async () => {
    const started = localStorage.getItem(storageKey) === '1';
    if (started) return;
    if (!isAuthenticated || userId == null) {
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-auth-${Date.now()}`,
          role: 'assistant',
          content: 'Merhaba, ben Aura. Sohbeti başlatmak için lütfen giriş yap.',
          createdAt: Date.now(),
        },
      ]);
      localStorage.setItem(storageKey, '1');
      return;
    }

    setIsGreeting(true);
    const typingId = addTyping();
    try {
      const response = await aiChatService.chat({ userId, message: 'Merhaba' });
      const answer = response?.answer || 'Merhaba, ben Aura. Hangi kategoride neye bakıyorsun?';
      const hasUserMessage = messagesRef.current.some((m) => m.role === 'user');
      if (hasUserMessage) {
        removeTyping(typingId);
      } else {
        replaceTypingWith(typingId, answer);
      }
      localStorage.setItem(storageKey, '1');
    } catch (e) {
      removeTyping(typingId);
      const errorMessage = e?.response?.data?.message || e?.message || 'Sohbet başlatılamadı.';
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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (!isAuthenticated || userId == null) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: trimmed,
          createdAt: Date.now(),
        },
        {
          id: `aura-auth-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Sohbeti devam ettirmek için lütfen giriş yap.',
          createdAt: Date.now() + 1,
        },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      },
    ]);
    setInput('');
    setIsSending(true);
    const typingId = addTyping();

    try {
      const response = await aiChatService.chat({ userId, message: trimmed });
      const answer = response?.answer || 'Cevap alınamadı.';
      replaceTypingWith(typingId, answer);
    } catch (e) {
      removeTyping(typingId);
      const errorMessage = e?.response?.data?.message || e?.message || 'İstek sırasında hata oluştu.';
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
      setIsSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
                  placeholder="Mesajını yaz... (Enter gönderir)"
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300"
                  rows={2}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !input.trim()}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {isGreeting ? (
                <div className="mt-2 text-[11px] text-slate-400 tracking-tight">
                  Aura hazırlanıyor...
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

