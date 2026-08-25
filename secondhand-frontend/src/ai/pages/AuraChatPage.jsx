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
  Send,
  UserRound,
  ExternalLink,
  Copy,
  Check,
  TrendingDown,
  ShieldCheck,
  Tag,
  Info,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ArrowUp,
  MessageSquare,
  Search,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Wand2,
  ChevronDown,
  CheckCircle2,
  Bot,
  Layers,
  Flame
} from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAllAuraPersistedMessages, createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import AuraPriceAdvisorGauge from '../components/AuraPriceAdvisorGauge.jsx';
import AuraMemoryProfileHub from '../components/AuraMemoryProfileHub.jsx';
import { buildAuraListingSessionContext, formatListingPriceLabel, listingTypeLabel } from '../utils/auraListingContext.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import { cacheService } from '../../common/services/cacheService.js';
import { ROUTES } from '../../common/constants/routes.js';

// Enhanced Message Renderer supporting Markdown-like formatting, Price Gauges, and Quotes
const MessageRenderer = ({ content, isUser }) => {
  if (typeof content !== 'string') return content;

  // Check for embedded Price Advisor Gauge
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
        {before && <FormattedText text={before.trim()} isUser={isUser} />}
        <AuraPriceAdvisorGauge
          min={min}
          max={max}
          avg={avg}
          current={current}
          currency={currency}
          status={status}
        />
        {after && <FormattedText text={after.trim()} isUser={isUser} />}
      </div>
    );
  }

  return <FormattedText text={content} isUser={isUser} />;
};

const FormattedText = ({ text, isUser }) => {
  const lines = text.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed text-[13px] sm:text-[14px] ${isUser ? 'text-white' : 'text-zinc-800'}`}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className={`font-bold text-sm sm:text-base mt-2.5 mb-1 ${isUser ? 'text-white' : 'text-zinc-950'}`}>
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        // Header ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className={`font-extrabold text-base sm:text-lg mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-zinc-950'}`}>
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isUser ? 'bg-white' : 'bg-zinc-700'}`} />
              <span className="flex-1">
                <InlineBoldText text={bulletText} />
              </span>
            </div>
          );
        }

        // Numbered list (e.g. "1. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
              <span className={`text-[11px] font-bold mt-0.5 shrink-0 px-1.5 py-0.2 rounded ${isUser ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
                {numMatch[1]}
              </span>
              <span className="flex-1">
                <InlineBoldText text={numMatch[2]} />
              </span>
            </div>
          );
        }

        // Blockquote >
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={i} className={`border-l-2 pl-3 py-1 my-1 italic rounded-r-md ${isUser ? 'border-white/40 bg-white/10 text-white/90' : 'border-zinc-300 bg-zinc-50 text-zinc-600'}`}>
              <InlineBoldText text={trimmed.substring(2)} />
            </blockquote>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            <InlineBoldText text={line} />
          </p>
        );
      })}
    </div>
  );
};

const InlineBoldText = ({ text }) => {
  // Parse **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-zinc-950 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-xs border border-zinc-200">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
};

export const AuraChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const location = useLocation();

  const listingFromState = location?.state?.listing || null;
  const listingIdFromState = location?.state?.listingId || null;
  const { listing: fetchedListing } = useListingData(listingIdFromState, !listingFromState && !!listingIdFromState);
  const [activeListing, setActiveListing] = useState(listingFromState || fetchedListing);

  useEffect(() => {
    if (listingFromState || fetchedListing) {
      setActiveListing(listingFromState || fetchedListing);
    }
  }, [listingFromState, fetchedListing]);

  const [agentMode, setAgentMode] = useState(AI_AGENT_MODE_ENABLED);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const [showMemoryHub, setShowMemoryHub] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuickTools, setShowQuickTools] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const userId = user?.id ?? null;
  const listingContext = useMemo(() => buildAuraListingSessionContext(activeListing), [activeListing]);

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
          listingId: activeListing?.id ? String(activeListing.id) : undefined,
        },
      };
    };
  }, [agentMode, activeListing?.id, listingContext, location.pathname]);

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

  const initialGreeting = useMemo(() => {
    if (activeListing) {
      return `Merhaba! **${activeListing.title || 'İlan'}** (${formatListingPriceLabel(activeListing.price, activeListing.currency)}) hakkında piyasa değerlemesi, pazarlık teklifleri ve güvenli alışveriş adımlarında yardımcı olmaya hazırım.`;
    }
    return "Merhaba! Ben **Aura AI**. İkinci el ürün arama, piyasa fiyat analizleri, pazarlık stratejileri ve güvenli ödeme havuzu süreçlerinde size rehberlik etmek için buradayım.";
  }, [activeListing]);

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

  // Copy to clipboard
  const copyToClipboard = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Handle Feedback
  const handleFeedback = (id, type) => {
    setFeedbackGiven(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  // New Chat
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
          content: activeListing
            ? `Yeni oturum başlatıldı. **${activeListing.title}** hakkında ne öğrenmek istersiniz?`
            : 'Yeni sohbet başlatıldı. Hangi konuda analiz yapmak veya ürün incelemek istersiniz?',
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

  // Clear History
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
          content: 'Sohbet geçmişiniz tamamen temizlendi.',
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

  // Quick Listing Action Prompts
  const quickListingActions = [
    {
      icon: TrendingDown,
      label: 'Fiyat Analizi',
      prompt: `Bu ürünün (${activeListing?.title || 'ilan'}) fiyatı piyasa ortalamasına göre nasıl? Fiyat analizi yapabilir misin?`,
    },
    {
      icon: MessageSquare,
      label: 'Pazarlık Teklifi',
      prompt: `Bu ürün için satıcıyı ikna edecek nazik ve gerçekçi bir pazarlık mesajı taslağı oluşturur musun?`,
    },
    {
      icon: ShieldCheck,
      label: 'Güvenlik & Escrow',
      prompt: `Bu satıcıdan alışveriş yaparken nelere dikkat etmeliyim ve güvenli ödeme havuzu nasıl işliyor?`,
    },
    {
      icon: Wand2,
      label: 'Artı & Eksi Analizi',
      prompt: `Bu ürünün teknik özellikleri ve açıklamasına göre öne çıkan avantajları ve olası riskleri nelerdir?`,
    },
  ];

  // Quick Tools Menu (Inside Omnibar)
  const quickTools = [
    {
      icon: TrendingDown,
      title: 'Piyasa Fiyat Analizi İste',
      prompt: 'Bir ürünün ikinci el piyasa değerini ve fırsat olup olmadığını analiz etmeni istiyorum.',
    },
    {
      icon: MessageSquare,
      title: 'Pazarlık Teklifi Oluştur',
      prompt: 'Satıcıya göndermek için etkili ve profesyonel bir pazarlık teklifi metni hazırla.',
    },
    {
      icon: ShieldCheck,
      title: 'Güvenlik & Dolandırıcılık Kontrolü',
      prompt: 'İkinci el alışverişte dolandırıcılıktan korunma yöntemleri ve Escrow güvencesini açıkla.',
    },
    {
      icon: Search,
      title: 'Fırsat İlanlarını Tara',
      prompt: 'Platformdaki öne çıkan fırsat ilanları ve bütçe dostu seçenekler hakkında bilgi ver.',
    }
  ];

  // Quick Trend Pills for New Conversation
  const quickDiscoveryPills = [
    "📱 iPhone 14 piyasa fiyatı nedir?",
    "💻 MacBook Air M2 pazarlık payı",
    "🛡️ Güvenli Havuz (Escrow) nasıl işler?",
    "📸 Kamera alırken nelere bakılmalı?"
  ];

  const textareaRef = useRef(null);

  // Auto adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const isHeroState = messages.length <= 1;

  return (
    <div className="flex h-[calc(100dvh-70px)] max-h-[calc(100dvh-70px)] w-full bg-zinc-50 text-zinc-900 overflow-hidden font-sans select-text">
      
      {/* ── 1. COLLAPSIBLE MODERN AI SIDEBAR ───────────────────────── */}
      <aside 
        className={`shrink-0 border-r border-zinc-200/80 bg-white transition-all duration-300 flex flex-col justify-between z-20 ${
          sidebarOpen ? 'w-72 sm:w-80' : 'w-0 -translate-x-full overflow-hidden opacity-0 border-none'
        }`}
      >
        <div className="p-3.5 flex flex-col h-full overflow-hidden">
          
          {/* Top New Chat Action */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-300" />
                <span>Yeni Sohbet</span>
              </div>
              <kbd className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              title="Paneli Kapat"
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Attached Listing Context Strip in Sidebar */}
          {activeListing && (
            <div className="mt-3 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-zinc-600" />
                  <span>Aktif İlan Bağlantısı</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveListing(null)}
                  className="text-[10px] text-zinc-400 hover:text-rose-600 font-medium transition-colors"
                >
                  Kaldır
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-zinc-200 overflow-hidden shrink-0 border border-zinc-200">
                  {activeListing.imageUrl ? (
                    <img src={activeListing.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {activeListing.title}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600">
                    {formatListingPriceLabel(activeListing.price, activeListing.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick AI Capabilities Deck */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-1.5 pr-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1">
              Aura Yetenekleri
            </p>

            <button
              type="button"
              disabled={isSending}
              onClick={() => sendMessage({ text: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün fırsat olduğunu nasıl anlarım?' })}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors group cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 group-hover:bg-emerald-100">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Piyasa Değerleme & Analiz</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={() => sendMessage({ text: 'İlan satıcısına gönderilecek nazik, piyasaya uygun ve kabul görme şansı yüksek bir pazarlık mesajı taslağı üretir misin?' })}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors group cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 group-hover:bg-blue-100">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Pazarlık & Teklif Asistanı</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={() => sendMessage({ text: 'İkinci el alışverişte dolandırıcılıktan nasıl korunabilirim? Escrow güvenli havuz hesabı süreci nasıl çalışır?' })}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors group cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 group-hover:bg-amber-100">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Güvenli Ödeme & Escrow</span>
            </button>

            <button
              type="button"
              disabled={isSending}
              onClick={() => sendMessage({ text: 'Platformdaki en son fırsat ve öne çıkan ilanları filtreleme konusunda bana yardımcı olur musun?' })}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-colors group cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60 group-hover:bg-purple-100">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Akıllı İlan Arama</span>
            </button>
          </div>

          {/* Bottom Sidebar Footer */}
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            {/* Memory Profile Button */}
            <button
              type="button"
              onClick={() => setShowMemoryHub(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-zinc-700" />
                <span>Aura Hafıza Profili</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                Aktif
              </span>
            </button>

            {/* Clear history */}
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isSending}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Sohbet Geçmişini Temizle</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ── 2. CENTRAL CONVERSATION STAGE ─────────────────────────── */}
      <main className="flex flex-1 flex-col h-full min-w-0 min-h-0 bg-white relative">
        
        {/* Top Header Floating Ribbon */}
        <header className="shrink-0 h-13 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Paneli Aç"
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-sm font-extrabold text-zinc-950 tracking-tight">
                    Aura AI
                  </h1>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200/80 rounded-full">
                    3.1 Reasoning Agent
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">
                  İkinci El Alışveriş & Analiz Motoru
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {activeListing && (
              <Link
                to={ROUTES.LISTING_DETAIL(activeListing.id)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 transition-colors"
              >
                <span className="truncate max-w-[140px]">{activeListing.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setShowMemoryHub(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                showMemoryHub
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 border border-zinc-200/80 text-zinc-800 hover:bg-zinc-200/70'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hafıza</span>
            </button>

            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              title="Yeni Oturum"
              className="p-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Memory Hub Drawer Overlay */}
        {showMemoryHub && (
          <div className="absolute inset-x-0 top-13 z-30 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xl animate-in slide-in-from-top-3 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900">Aura AI Bellek & Tercih Paneli</h3>
                    <p className="text-[11px] text-zinc-500">Aura bu bilgileri sohbetlerinizde kişiselleştirilmiş yanıtlar için hatırlar.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMemoryHub(false)}
                  className="px-2.5 py-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
              <AuraMemoryProfileHub />
            </div>
          </div>
        )}

        {/* ── CHAT SCROLL AREA ──────────────────────────────────────── */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto w-full px-3 sm:px-6 py-6 space-y-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Ambient Hero Greeting (When starting new chat or 1 message) */}
            {isHeroState && (
              <div className="flex flex-col items-center text-center py-6 sm:py-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Glowing Aura Orb */}
                <div className="relative mb-5">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-xl border border-zinc-800">
                    <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                  Nasıl yardımcı olabilirim?
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-lg leading-relaxed font-normal">
                  Piyasa fiyat değerlemesi, pazarlık teklif metinleri, satıcı güvenlik kontrolleri veya aradığınız ilanlar için hazırım.
                </p>

                {/* 4 Interactive Feature Capability Cards */}
                <div className="w-full mt-6 text-left">
                  <AuraSuggestedPrompts
                    disabled={isSending}
                    onPick={(msg) => sendMessage({ text: msg })}
                  />
                </div>

                {/* Quick Discovery Pills */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-xl">
                  {quickDiscoveryPills.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSending}
                      onClick={() => sendMessage({ text: pill })}
                      className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:border-zinc-900 hover:bg-zinc-50 text-[11px] font-medium text-zinc-700 hover:text-zinc-950 shadow-2xs transition-all cursor-pointer disabled:opacity-40"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Listing Context Ribbon (Attached to current thread) */}
            {activeListing && (
              <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-r from-zinc-50 via-white to-zinc-50 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                      {activeListing.imageUrl ? (
                        <img src={activeListing.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Tag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.2 rounded-md bg-zinc-900 text-white font-extrabold text-[9px] uppercase tracking-wider">
                          İncelenen İlan
                        </span>
                        {activeListing.type && (
                          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.2 rounded-md">
                            {listingTypeLabel(activeListing.type)}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                          {formatListingPriceLabel(activeListing.price, activeListing.currency)}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate mt-0.5">
                        {activeListing.title}
                      </h3>
                    </div>
                  </div>

                  <Link
                    to={ROUTES.LISTING_DETAIL(activeListing.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-800 transition-colors shrink-0 shadow-2xs"
                  >
                    <span>İlan Sayfası</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </Link>
                </div>

                {/* 4 Instant Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {quickListingActions.map((qa) => {
                    const ActionIcon = qa.icon;
                    return (
                      <button
                        key={qa.label}
                        type="button"
                        disabled={isSending}
                        onClick={() => sendMessage({ text: qa.prompt })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-900 hover:text-white hover:border-zinc-900 text-zinc-700 text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-40 shadow-2xs"
                      >
                        <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{qa.label}</span>
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
                  className={`flex gap-3 sm:gap-4 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  } items-start animate-in fade-in slide-in-from-bottom-2 duration-200 group`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs transition-all ${
                      isUser
                        ? 'bg-zinc-900 text-white'
                        : 'bg-gradient-to-br from-zinc-950 to-zinc-800 text-white'
                    }`}
                  >
                    {isUser ? <UserRound className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`min-w-0 max-w-[92%] sm:max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
                    
                    {/* Header Label & Timestamp */}
                    <div className={`flex items-center gap-2 mb-1 text-[11px] font-semibold text-zinc-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-zinc-700 font-bold">{isUser ? 'Siz' : 'Aura AI'}</span>
                      {!isUser && (
                        <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-[9px] font-bold text-zinc-500 border border-zinc-200/60">
                          Model
                        </span>
                      )}
                      {m.createdAt && (
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Message Card */}
                    <div
                      className={`rounded-2xl p-4 sm:p-5 text-left transition-all ${
                        isUser
                          ? 'bg-zinc-900 text-white rounded-tr-xs shadow-md'
                          : 'bg-white border border-zinc-200/90 text-zinc-900 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {m.typing ? (
                        <div className="flex items-center gap-3 py-1 text-zinc-500">
                          <div className="flex gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs font-semibold text-zinc-600">
                            Aura piyasa verilerini ve ilan geçmişini analiz ediyor...
                          </span>
                        </div>
                      ) : (
                        <>
                          <MessageRenderer content={m.content} isUser={isUser} />
                          
                          {/* Embedded Suggested Listings */}
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-zinc-100">
                              <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action Bar (Assistant Only) */}
                    {!isUser && !m.typing && m.content && (
                      <div className="flex items-center gap-1.5 mt-1.5 pl-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-100 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>

                        {/* Thumbs Up */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(m.id, 'up')}
                          className={`p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
                            feedbackGiven[m.id] === 'up' ? 'text-emerald-600 font-bold' : 'text-zinc-400 hover:text-zinc-700'
                          }`}
                          title="Faydalı Yanıt"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs Down */}
                        <button
                          type="button"
                          onClick={() => handleFeedback(m.id, 'down')}
                          className={`p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer ${
                            feedbackGiven[m.id] === 'down' ? 'text-rose-600 font-bold' : 'text-zinc-400 hover:text-zinc-700'
                          }`}
                          title="Yetersiz Yanıt"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. FLOATING OMNIBAR PROMPT DOCK ──────────────────────── */}
        <div className="shrink-0 p-3 sm:p-5 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Quick Tools Dropdown */}
            {showQuickTools && (
              <div className="absolute bottom-full mb-3 left-0 right-0 sm:right-auto sm:w-96 rounded-2xl border border-zinc-200 bg-white/95 backdrop-blur-md shadow-2xl p-3 z-30 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Hızlı Yapay Zeka Araçları
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickTools(false)}
                    className="text-xs text-zinc-400 hover:text-zinc-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1">
                  {quickTools.map((tool, idx) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sendMessage({ text: tool.prompt });
                          setShowQuickTools(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-zinc-100 text-xs font-semibold text-zinc-800 transition-colors group cursor-pointer"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 truncate">{tool.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Omnibar Input Box */}
            <div className="relative flex flex-col rounded-2xl border border-zinc-300/90 bg-white p-2 shadow-lg shadow-zinc-200/50 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 transition-all">
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  activeListing
                    ? `"${activeListing.title?.slice(0, 30)}..." hakkında fiyat, pazarlık veya güvenlik sorusu sorun...`
                    : "Aura'ya ikinci el piyasası, fiyat analizi veya ürünler hakkında soru sorun..."
                }
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none min-h-[38px] max-h-[120px] leading-relaxed"
              />

              {/* Bottom Dock Controls */}
              <div className="flex items-center justify-between pt-1 px-1 border-t border-zinc-100/60 mt-1">
                {/* Left quick actions toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickTools(prev => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Hızlı Araçlar</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  {activeListing && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <Tag className="w-2.5 h-2.5" />
                      <span>İlan Aktif</span>
                    </span>
                  )}
                </div>

                {/* Right Send Button */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block text-[10px] text-zinc-400 font-medium">
                    Enter ↵ gönderir
                  </span>

                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={isSending || !input.trim()}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 cursor-pointer shadow-xs"
                  >
                    {isSending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-[10px] text-zinc-400 mt-2 font-normal">
              Aura AI hata yapabilir. Önemli alışveriş ve ödeme adımlarında ilan ve satıcı detaylarını teyit ediniz.
            </p>
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