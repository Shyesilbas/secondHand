import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { useLocation, Link } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import {
  Sparkles,
  RotateCcw,
  Trash2,
  BrainCircuit,
  Send,
  UserRound,
  ExternalLink,
  Copy,
  Check,
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Info,
  ChevronRight,
  ArrowRight,
  Bot
} from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAllAuraPersistedMessages, createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import AuraPriceAdvisorGauge from '../components/AuraPriceAdvisorGauge.jsx';
import AuraMemoryProfileHub from '../components/AuraMemoryProfileHub.jsx';
import { buildAuraListingSessionContext, formatListingPriceLabel, listingStatusLabel, listingTypeLabel } from '../utils/auraListingContext.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import { cacheService } from '../../common/services/cacheService.js';
import { ROUTES } from '../../common/constants/routes.js';

const MessageRenderer = ({ content }) => {
  if (typeof content !== 'string') return content;

  const gaugeRegex = /<PriceAdvisorGauge\s+([^>]+)\s*\/?>/i;
  const match = content.match(gaugeRegex);

  if (match) {
    const rawAttrs = match[1];
    const getAttr = (name) => {
      const regex = new RegExp(`${name}="([^"]+)"`, 'i');
      const attrMatch = rawAttrs.match(regex);
      return attrMatch ? attrMatch[1] : null;
    };

    const min = getAttr('min');
    const max = getAttr('max');
    const avg = getAttr('avg');
    const current = getAttr('current');
    const currency = getAttr('currency') || 'TRY';
    const status = getAttr('status') || 'Good Deal';

    const index = content.indexOf(match[0]);
    const before = content.substring(0, index);
    const after = content.substring(index + match[0].length);

    return (
      <div className="space-y-4">
        {before && <p className="whitespace-pre-line leading-relaxed">{before.trim()}</p>}
        <div className="my-3">
          <AuraPriceAdvisorGauge
            min={min}
            max={max}
            avg={avg}
            current={current}
            currency={currency}
            status={status}
          />
        </div>
        {after && <p className="whitespace-pre-line leading-relaxed">{after.trim()}</p>}
      </div>
    );
  }

  const lines = content.split('\n');
  return (
    <div className="space-y-2 leading-relaxed text-sm sm:text-[15px] font-normal text-slate-800">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2.5 pl-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
              <span>{trimmed.substring(2)}</span>
            </div>
          );
        }

        return <p key={i} className="whitespace-pre-wrap">{line}</p>;
      })}
    </div>
  );
};

export const AuraChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const location = useLocation();

  const listingFromState = location?.state?.listing || null;
  const listingIdFromState = location?.state?.listingId || null;
  const { listing: fetchedListing } = useListingData(listingIdFromState, !listingFromState && !!listingIdFromState);
  const listing = listingFromState || fetchedListing;

  const [agentMode] = useState(AI_AGENT_MODE_ENABLED);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const [showMemoryHub, setShowMemoryHub] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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

      try {
        if (AI_AGENT_MODE_ENABLED && agentMode) {
          try {
            return await aiChatService.agentQuery({
              message,
              context,
              uiContext,
              agentMode: true,
            });
          } catch (agentErr) {
            console.warn('Agent query fallback to direct chat:', agentErr);
            return await aiChatService.chat({
              message,
              context,
            });
          }
        }
        return await aiChatService.chat({
          message,
          context,
        });
      } catch (error) {
        if (error.response?.data?.error === 'AURA_DAILY_LIMIT_EXCEEDED' || error.errorCode === 'AURA_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          setUpgradeHint(t("aura_daily_limit_exceeded", "Günlük Aura AI limitinize ulaştınız."));
          throw error;
        }
        throw error;
      }
    };
  }, [agentMode, t]);

  const initialGreeting = useMemo(() => {
    if (listing) {
      return `Merhaba! "${listing.title || 'İlan'}" hakkında detaylı analiz, fiyat doğrulaması ve pazarlık tavsiyesi için hazırım. Aşağıdaki hızlı seçeneklerden birini seçebilir veya doğrudan sorunuzu yazabilirsiniz.`;
    }
    return "Merhaba! Ben Aura AI. İkinci el ürün arama, piyasa fiyat analizleri, teklif stratejileri ve güvenli ödeme süreçlerinde sana yardımcı olmak için buradayım. Bugün nasıl yardımcı olabilirim?";
  }, [listing]);

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
        content: initialGreeting,
        createdAt: Date.now(),
      },
    ],
    withTyping: true,
    buildPayload,
    sendApi,
    echoUserMessageWhenUnauthed: false,
    persistMessagesSurface: 'page',
  });

  const copyToClipboard = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleNewChat = async () => {
    if (userId == null) {
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Sohbet geçmişinizi kaydetmek için lütfen giriş yapınız.',
        }),
      ]);
      return;
    }
    setIsSending(true);
    try {
      await aiChatService.newChat();
      clearAllAuraPersistedMessages(userId);
      cacheService.remove(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: listing
            ? `Yeni oturum başlatıldı. "${listing.title}" hakkında ne öğrenmek istersiniz?`
            : 'Yeni sohbet başlatıldı. Bugün hangi ürünü veya konuyu incelemek istersiniz?',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Yeni sohbet oluşturulamadı.');
      setMessages((prev) => [
        ...prev,
        createChatMessage({ role: 'assistant', content: errorMessage }),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (userId == null) return;
    if (!window.confirm('Tüm sohbet geçmişiniz silinecek. Onaylıyor musunuz?')) return;
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      clearAllAuraPersistedMessages(userId);
      cacheService.remove(storageKey);
      setMessages([
        createChatMessage({
          role: 'assistant',
          content: 'Sohbet geçmişiniz temizlendi.',
        }),
      ]);
      queueMicrotask(scrollToBottom);
    } catch (e) {
      const errorMessage = getApiErrorMessage(e, 'Geçmiş silinemedi.');
      setMessages((prev) => [
        ...prev,
        createChatMessage({ role: 'assistant', content: errorMessage }),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickListingActions = [
    {
      icon: TrendingDown,
      label: 'Fiyat Analizi',
      desc: 'Piyasa ortalaması',
      prompt: `Bu ürünün (${listing?.title || 'ilan'}) fiyatı piyasa ortalamasına göre nasıl? Fiyat analizi yapabilir misin?`,
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/60 text-emerald-800 hover:bg-emerald-50',
    },
    {
      icon: DollarSign,
      label: 'Pazarlık Tavsiyesi',
      desc: 'Makul teklif aralığı',
      prompt: `Bu ürün için mantıklı ve satıcının kabul edebileceği bir pazarlık teklifi sence ne kadar olmalı?`,
      gradient: 'from-indigo-500/10 to-violet-500/10 border-indigo-200/60 text-indigo-800 hover:bg-indigo-50',
    },
    {
      icon: ShieldCheck,
      label: 'Güvenlik & Havuz',
      desc: 'Dolandırıcılık koruması',
      prompt: `Bu satıcıdan alışveriş yaparken nelere dikkat etmeliyim ve güvenli ödeme havuzu nasıl işliyor?`,
      gradient: 'from-amber-500/10 to-orange-500/10 border-amber-200/60 text-amber-800 hover:bg-amber-50',
    },
    {
      icon: Info,
      label: 'Artı & Eksi Analizi',
      desc: 'Özellik dökümü',
      prompt: `Bu ürünün teknik özellikleri ve açıklamasına göre öne çıkan avantajları ve olası dezavantajları nelerdir?`,
      gradient: 'from-rose-500/10 to-pink-500/10 border-rose-200/60 text-rose-800 hover:bg-rose-50',
    },
  ];

  return (
    <div className="flex h-[calc(100vh-68px)] w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      
      {/* ── CENTRAL CONVERSATION LANE ─────────────────────────────── */}
      <main className="flex flex-1 flex-col h-full min-w-0 min-h-0 bg-white relative shadow-xs">
        
        {/* Modern Minimal Header */}
        <header className="shrink-0 h-16 border-b border-slate-100 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 shadow-md shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  Aura AI
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/80 rounded-full">
                  Gemini 3.1 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Pazar Yeri Danışmanı & Fiyat İstihbaratı
              </p>
            </div>
          </div>

          {/* Action pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Yeni Oturum</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMemoryHub((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                showMemoryHub
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-500/20'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bellek</span>
            </button>

            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isSending}
              title="Geçmişi Temizle"
              className="p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Memory Hub Drawer Overlay */}
        {showMemoryHub && (
          <div className="absolute inset-x-0 top-16 z-30 p-6 bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[75vh] overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Aura AI Akıllı Bellek Profili</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMemoryHub(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  ✕ Kapat
                </button>
              </div>
              <AuraMemoryProfileHub />
            </div>
          </div>
        )}

        {/* ── CHAT THREAD ──────────────────────────────────────────── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto w-full px-4 sm:px-8 py-6 space-y-6 custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Compact, Premium Listing Context Capsule */}
            {listing && (
              <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-white p-5 shadow-xs transition-all">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-150/70">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Tag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-black text-[9px] tracking-wider uppercase">
                          Aktif İlan
                        </span>
                        {listing.type && (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {listingTypeLabel(listing.type)}
                          </span>
                        )}
                        {listing.city && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            📍 {listing.city} {listing.district ? `· ${listing.district}` : ''}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 truncate mt-1">
                        {listing.title}
                      </h2>
                      <p className="text-sm font-black text-indigo-600 mt-0.5">
                        {formatListingPriceLabel(listing.price, listing.currency)}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={ROUTES.LISTING_DETAIL(listing.id)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 transition-all shrink-0 shadow-2xs hover:text-indigo-600"
                  >
                    <span>İlan Sayfası</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 4 Interactive Smart Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                  {quickListingActions.map((qa) => {
                    const Icon = qa.icon;
                    return (
                      <button
                        key={qa.label}
                        type="button"
                        disabled={isSending}
                        onClick={() => sendMessage({ text: qa.prompt })}
                        className={`flex flex-col text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 disabled:opacity-50 bg-white ${qa.gradient}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-extrabold">{qa.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 font-medium line-clamp-1">
                          {qa.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversation Flow */}
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3.5 sm:gap-4 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  } items-start animate-in fade-in-50 duration-200 group`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-indigo-500/10'
                    }`}
                  >
                    {isUser ? <UserRound className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
                  </div>

                  {/* Message Bubble Card */}
                  <div className={`min-w-0 max-w-[88%] sm:max-w-[82%] ${isUser ? 'text-right' : 'text-left'}`}>
                    
                    {/* Author & Timestamp */}
                    <div className={`flex items-center gap-2 mb-1.5 text-[11px] font-bold text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'Siz' : 'Aura AI'}</span>
                      {m.createdAt && (
                        <span className="font-normal text-slate-400">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`inline-block rounded-3xl p-5 text-left transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-md shadow-indigo-500/10 font-medium'
                          : 'bg-[#F8FAFC] border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {m.typing ? (
                        <div className="flex items-center gap-2.5 py-1 px-1 text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-xs font-semibold ml-1.5 text-slate-400">Aura inceliyor...</span>
                        </div>
                      ) : (
                        <>
                          <MessageRenderer content={m.content} />
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-200/70">
                              <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action Bar below Assistant Bubble */}
                    {!isUser && !m.typing && m.content && (
                      <div className="flex items-center gap-3 mt-1.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* General Discovery Topics when no listing is selected */}
            {messages.length === 1 && !listing && (
              <div className="mt-8 pt-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center">
                  Örnek Başlangıç Konuları
                </p>
                <AuraSuggestedPrompts
                  disabled={isSending}
                  onPick={(msg) => sendMessage({ text: msg })}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── FLOATING COMMAND DOCK ────────────────────────────────── */}
        <div className="shrink-0 p-4 sm:p-6 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-3xl p-2.5 pl-5 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:bg-white transition-all shadow-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  listing
                    ? `"${listing.title?.slice(0, 32)}..." hakkında soru sorun...`
                    : "Ürün ara, piyasa fiyatı sor veya teklif tavsiyesi iste..."
                }
                rows={1}
                className="flex-1 resize-none bg-transparent py-1.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[38px] max-h-[120px]"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-40 disabled:active:scale-100 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2.5 px-3 text-[11px] text-slate-400 font-medium">
              <span>Göndermek için <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-mono">Enter ↵</kbd>, yeni satır için <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-mono">Shift + Enter</kbd></span>
              <span className="hidden sm:inline text-indigo-600/70 font-semibold">Gemini Flash Akıllı Ticaret Modeli</span>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureHint={upgradeHint}
      />
    </div>
  );
};

export default AuraChatPage;