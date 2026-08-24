import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  PanelRight,
  PanelRightClose,
  Send,
  UserRound,
  ShieldCheck,
  Tag,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Bot,
  Flame,
  Lightbulb,
  Compass
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
      <div className="space-y-3">
        {before && <p className="whitespace-pre-line leading-relaxed font-normal">{before.trim()}</p>}
        <div className="my-2">
          <AuraPriceAdvisorGauge
            min={min}
            max={max}
            avg={avg}
            current={current}
            currency={currency}
            status={status}
          />
        </div>
        {after && <p className="whitespace-pre-line leading-relaxed font-normal">{after.trim()}</p>}
      </div>
    );
  }

  // Format bullets and bold text cleanly
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed font-normal text-[13px] sm:text-sm">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
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
  const [rightPanelOpen, setRightPanelOpen] = useState(Boolean(listing));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const [showMemoryHub, setShowMemoryHub] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const userId = user?.id ?? null;
  const listingContext = useMemo(() => buildAuraListingSessionContext(listing), [listing]);

  // Keep right panel open if listing is supplied
  useEffect(() => {
    if (listing) {
      setRightPanelOpen(true);
    }
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
            console.warn('Agent query error, falling back directly to chat:', agentErr);
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
        content: listing
          ? `Merhaba! "${listing.title || 'İlan'}" incelemesine hoş geldiniz. Fiyat analizi, satıcı değerlendirmesi veya pazarlık stratejisi hakkında sorularınızı yanıtlayabilirim.`
          : "Merhaba! Ben Aura AI. İkinci el ürün arama, piyasa fiyat analizleri, teklif stratejileri ve güvenli ödeme süreçlerinde sana yardımcı olmak için buradayım. Bugün neyi incelemek istersin?",
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
            ? `Yeni sohbet başlatıldı. "${listing.title}" hakkında ne sormak istersiniz?`
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
      label: '💰 Fiyat Analizi',
      prompt: `Bu ürünün (${listing?.title || 'ilan'}) fiyatı piyasa ortalamasına göre nasıl? Fiyat analizi yapabilir misin?`,
    },
    {
      label: '🛡️ Güvenlik & Satıcı',
      prompt: `Bu satıcıdan alışveriş yaparken nelere dikkat etmeliyim ve güvenli ödeme havuzu nasıl işliyor?`,
    },
    {
      label: '🤝 Pazarlık Tavsiyesi',
      prompt: `Bu ürün için mantıklı ve kabul edilebilir bir pazarlık teklifi sence ne kadar olmalı?`,
    },
    {
      label: '🔍 Artı / Eksi Özellikler',
      prompt: `Bu ürünün teknik özellikleri ve açıklamasına göre öne çıkan avantajları ve olası dezavantajları nelerdir?`,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-68px)] w-full overflow-hidden bg-slate-950/2 text-slate-800 antialiased">
      {/* ── MAIN CHAT AREA ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col h-full min-w-0 min-h-0 bg-white relative">
        
        {/* Top Header Bar */}
        <header className="shrink-0 h-16 border-b border-slate-150/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Aura AI Asistanı
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
                  Gemini 3.1 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Akıllı İlan, Fiyat Analizi ve Güvenli Ticaret Danışmanı
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              title="Yeni Sohbet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Yeni Sohbet</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMemoryHub((prev) => !prev)}
              title="Aura Bellek Profili"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                showMemoryHub
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
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
              className="p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {listing && (
              <button
                type="button"
                onClick={() => setRightPanelOpen((prev) => !prev)}
                title={rightPanelOpen ? 'İlan Panelini Gizle' : 'İlan Panelini Göster'}
                className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
                  rightPanelOpen
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </header>

        {/* Memory Hub Drawer overlay */}
        {showMemoryHub && (
          <div className="absolute inset-x-0 top-16 z-30 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[75vh] overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
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

        {/* ── CONVERSATION STREAM ──────────────────────────────────── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6 space-y-6 custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Active Listing Hero Capsule (When active listing is present) */}
            {listing && (
              <div className="rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/60 via-white to-amber-50/30 p-4 sm:p-5 shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pb-3.5 border-b border-indigo-100/60">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0 shadow-2xs">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Tag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[9px] tracking-wider uppercase">
                          İncelenen İlan
                        </span>
                        {listing.type && (
                          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                            {listingTypeLabel(listing.type)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate mt-1">
                        {listing.title}
                      </h2>
                      <p className="text-xs font-black text-indigo-600 mt-0.5">
                        {formatListingPriceLabel(listing.price, listing.currency)}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={ROUTES.LISTING_DETAIL(listing.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all shrink-0 shadow-2xs hover:text-indigo-600"
                  >
                    <span>İlan Sayfası</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Quick Smart Actions */}
                <div className="mt-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Aura Hızlı Analiz Önerileri:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickListingActions.map((qa) => (
                      <button
                        key={qa.label}
                        type="button"
                        disabled={isSending}
                        onClick={() => sendMessage({ text: qa.prompt })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-600 hover:text-white border border-indigo-100/90 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 sm:gap-4 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  } items-start animate-in fade-in-50 duration-200 group`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-2xs ${
                      isUser
                        ? 'bg-slate-900 text-white'
                        : 'bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 text-white shadow-indigo-500/10'
                    }`}
                  >
                    {isUser ? <UserRound className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
                  </div>

                  {/* Bubble Container */}
                  <div className={`min-w-0 max-w-[85%] sm:max-w-[82%] ${isUser ? 'text-right' : 'text-left'}`}>
                    
                    {/* Header meta */}
                    <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'Siz' : 'Aura AI'}</span>
                      {m.createdAt && (
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Content Card */}
                    <div
                      className={`inline-block rounded-3xl p-4 sm:p-5 text-left transition-all ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs shadow-sm shadow-indigo-500/10'
                          : 'bg-slate-50/70 border border-slate-200/80 text-slate-800 rounded-tl-xs shadow-2xs backdrop-blur-xs'
                      }`}
                    >
                      {m.typing ? (
                        <div className="flex items-center gap-2 py-1 px-1 text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-xs font-semibold ml-1 text-slate-400">Aura düşünüyor...</span>
                        </div>
                      ) : (
                        <>
                          <MessageRenderer content={m.content} />
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60">
                              <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Bottom Actions for Assistant Message */}
                    {!isUser && !m.typing && m.content && (
                      <div className="flex items-center gap-2 mt-1.5 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
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

            {/* Empty State / Suggested Prompts if only 1 message and no listing */}
            {messages.length === 1 && !listing && (
              <div className="mt-6 pt-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 text-center">
                  Hızlı Başlangıç Konuları
                </p>
                <AuraSuggestedPrompts
                  disabled={isSending}
                  onPick={(msg) => sendMessage({ text: msg })}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── FLOATING INPUT BAR ──────────────────────────────────── */}
        <div className="shrink-0 p-4 sm:p-5 bg-gradient-to-t from-white via-white to-white/80 border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-3xl p-2 pl-4 focus-within:border-indigo-500 focus-within:ring-3 focus-within:ring-indigo-100 focus-within:bg-white transition-all shadow-sm">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  listing
                    ? `"${listing.title?.slice(0, 30)}..." hakkında Aura'ya soru sorun...`
                    : "İkinci el ürün ara, fiyat analizi veya pazarlık tavsiyesi iste..."
                }
                rows={1}
                className="flex-1 resize-none bg-transparent py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[40px] max-h-[120px]"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isSending || !input.trim()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-xs disabled:opacity-40 disabled:active:scale-100 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-slate-400 font-medium">
              <span>Enter ↵ ile gönder, Shift + Enter ile yeni satır</span>
              <span className="hidden sm:inline">Güvenli Yapay Zeka Danışmanı</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: LISTING CANVAS ──────────────────────────── */}
      {listing && rightPanelOpen && (
        <aside className="w-80 border-l border-slate-200 bg-white h-full overflow-y-auto hidden lg:flex flex-col p-5 space-y-6 shrink-0 shadow-xs z-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                İlan İnceleme Paneli
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setRightPanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Product Media & Core Info */}
          <div className="space-y-3">
            <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
              {listing.imageUrl ? (
                <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Tag className="w-8 h-8" />
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                {listingTypeLabel(listing.type) || 'Genel İlan'}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                {listing.title}
              </h4>
              <p className="text-base font-black text-indigo-600 mt-1">
                {formatListingPriceLabel(listing.price, listing.currency)}
              </p>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2 text-xs">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              Özet Bilgiler
            </p>
            <div className="flex justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500">Konum</span>
              <span className="font-bold text-slate-800">
                {[listing.district, listing.city].filter(Boolean).join(', ') || 'Belirtilmedi'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/40">
              <span className="text-slate-500">Durum</span>
              <span className="font-bold text-emerald-600">
                {listingStatusLabel(listing.status) || 'Aktif'}
              </span>
            </div>
            {listing.listingNo && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">İlan No</span>
                <span className="font-mono font-bold text-slate-700">{listing.listingNo}</span>
              </div>
            )}
          </div>

          {/* Escrow Protection Info */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Güvenli Havuz Koruması</span>
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed font-medium">
              Ödemeniz, ürünü teslim alıp onaylayana kadar sistem emanetinde (escrow) güvende tutulur.
            </p>
          </div>

          <Link
            to={ROUTES.LISTING_DETAIL(listing.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <span>İlan Detayına Git</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </aside>
      )}

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