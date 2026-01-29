import React, { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { aiChatService } from '../services/aiChatService.js';
import { Send, Sparkles } from 'lucide-react';

const AuraChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const listing = location?.state?.listing || null;

  const [messages, setMessages] = useState(() => [
    {
      id: 'aura-welcome',
      role: 'assistant',
      content: 'Merhaba, ben Aura. SecondHand üzerinde doğru ürünü bulmana veya güvenli ticaret yapmana yardımcı olabilirim. Hangi kategoride neye bakıyorsun?',
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);

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

  const buildOutgoingMessage = (text) => {
    const trimmed = text.trim();
    if (!listingContext) return trimmed;
    return `${trimmed}\n\nListingContext: ${listingContext}`;
  };

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (userId == null) {
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-error-${Date.now()}`,
          role: 'assistant',
          content: 'Oturum bilgisi bulunamadı. Lütfen giriş yapıp tekrar dene.',
          createdAt: Date.now(),
        },
      ]);
      setInput('');
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    queueMicrotask(scrollToBottom);

    try {
      const payload = buildOutgoingMessage(trimmed);
      const response = await aiChatService.chat({ userId, message: payload });
      const answer = response?.answer || response?.message || 'Cevap alınamadı.';

      setMessages((prev) => [
        ...prev,
        {
          id: `aura-${Date.now()}`,
          role: 'assistant',
          content: answer,
          createdAt: Date.now(),
        },
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        'İstek sırasında hata oluştu.';
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-error-${Date.now()}`,
          role: 'assistant',
          content: errorMessage,
          createdAt: Date.now(),
        },
      ]);
      queueMicrotask(scrollToBottom);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
                  Marketplace odaklı öneriler, güvenlik kontrolleri ve doğru sorular
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 tracking-tight">UserId</div>
            <div className="text-sm font-semibold text-slate-900 tracking-tight">
              {userId ?? '—'}
            </div>
          </div>
        </div>

        {listingContext ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 tracking-tight mb-2">Selected listing context</div>
            <div className="text-sm text-slate-800 tracking-tight whitespace-pre-wrap">{listingContext}</div>
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
                placeholder="Mesajını yaz... (Enter gönderir, Shift+Enter yeni satır)"
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-300"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold tracking-tight disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
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

