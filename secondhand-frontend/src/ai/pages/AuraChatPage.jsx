import { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { useLocation, Link } from 'react-router-dom';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import {
  ArrowUp,
  BrainCircuit,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingDown,
  UserRound,
  Wand2,
  X
} from 'lucide-react';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAllAuraPersistedMessages, createChatMessage, getApiErrorMessage } from '../utils/auraChatUtils.js';
import AuraSuggestedPrompts from '../components/AuraSuggestedPrompts.jsx';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import AuraMessageContent from '../components/AuraMessageContent.jsx';
import AuraMemoryProfileHub from '../components/AuraMemoryProfileHub.jsx';
import { buildAuraListingSessionContext, formatListingPriceLabel, listingTypeLabel } from '../utils/auraListingContext.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import Button from '@/common/components/ui/Button';
import Modal from '@/common/components/ui/Modal';
import { cacheService } from '../../common/services/cacheService.js';
import { ROUTES } from '../../common/constants/routes.js';

// Shared by the sidebar shortcuts and the composer's quick-tools menu.
const AURA_CAPABILITIES = [
  {
    icon: TrendingDown,
    label: 'Piyasa Değerleme & Analiz',
    prompt: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün fırsat olduğunu nasıl anlarım?',
  },
  {
    icon: MessageSquare,
    label: 'Pazarlık & Teklif Asistanı',
    prompt: 'İlan satıcısına gönderilecek nazik, piyasaya uygun ve kabul görme şansı yüksek bir pazarlık mesajı taslağı üretir misin?',
  },
  {
    icon: ShieldCheck,
    label: 'Güvenli Ödeme & Escrow',
    prompt: 'İkinci el alışverişte dolandırıcılıktan nasıl korunabilirim? Escrow güvenli havuz hesabı süreci nasıl çalışır?',
  },
  {
    icon: Search,
    label: 'Akıllı İlan Arama',
    prompt: 'Platformdaki en son fırsat ve öne çıkan ilanları filtreleme konusunda bana yardımcı olur musun?',
  },
];

const DISCOVERY_PROMPTS = [
  'iPhone 14 piyasa fiyatı nedir?',
  'MacBook Air M2 pazarlık payı',
  'Güvenli Havuz (Escrow) nasıl işler?',
  'Kamera alırken nelere bakılmalı?',
];

const ICON_BUTTON = 'inline-flex h-9 w-9 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary disabled:opacity-50';

export const AuraChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const location = useLocation();

  const listingFromState = location?.state?.listing || null;
  const listingIdFromState = location?.state?.listingId || null;
  const { listing: fetchedListing } = useListingData(listingIdFromState, !listingFromState && !!listingIdFromState);
  const [detachedListingId, setDetachedListingId] = useState(null);
  const sourceListing = listingFromState || fetchedListing || null;
  const activeListing = sourceListing && sourceListing.id !== detachedListingId ? sourceListing : null;

  const [agentMode] = useState(AI_AGENT_MODE_ENABLED);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeHint, setUpgradeHint] = useState('');
  const [showMemoryHub, setShowMemoryHub] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showQuickTools, setShowQuickTools] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [confirmClear, setConfirmClear] = useState(false);

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
    setConfirmClear(false);
    if (userId == null) return;
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

  const textareaRef = useRef(null);

  // Grow the composer with its content, up to five lines.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const isHeroState = messages.length <= 1;
  const send = (text) => sendMessage({ text });

  return (
    <div className="flex h-[calc(100dvh-70px)] w-full overflow-hidden bg-background-secondary text-text-primary">
      <aside className={`z-20 flex shrink-0 flex-col border-r border-border bg-background-primary ${sidebarOpen ? 'w-72 sm:w-80' : 'hidden'}`}>
        <div className="flex h-full flex-col overflow-hidden p-3">
          <div className="flex items-center gap-2 border-b border-border-light pb-3">
            <Button className="flex-1 justify-start" onClick={handleNewChat} disabled={isSending}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>Yeni Sohbet</span>
            </Button>
            <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Paneli Kapat" className={ICON_BUTTON}>
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {activeListing && (
            <div className="mt-3 rounded border border-border-light p-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-text-tertiary">Aktif İlan Bağlantısı</span>
                <button type="button" onClick={() => setDetachedListingId(activeListing.id)} className="text-text-secondary transition-colors hover:text-status-error-text">
                  Kaldır
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
                  {activeListing.imageUrl ? <img src={activeListing.imageUrl} alt="" className="h-full w-full object-cover" /> : <Tag className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{activeListing.title}</p>
                  <p className="text-sm tabular-nums text-text-secondary">{formatListingPriceLabel(activeListing.price, activeListing.currency)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
            <p className="px-2 pb-1 text-sm text-text-tertiary">Aura Yetenekleri</p>
            {AURA_CAPABILITIES.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                disabled={isSending}
                onClick={() => send(prompt)}
                className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-50"
              >
                <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1 border-t border-border-light pt-3">
            <button
              type="button"
              onClick={() => setShowMemoryHub(prev => !prev)}
              aria-expanded={showMemoryHub}
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
            >
              <BrainCircuit className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span>Aura Hafıza Profili</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={isSending || userId == null}
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-sm text-text-tertiary transition-colors hover:bg-background-secondary hover:text-status-error-text disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>Sohbet Geçmişini Temizle</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background-primary">
        <header className="z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {!sidebarOpen && (
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Paneli Aç" className={ICON_BUTTON}>
                <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-text-primary">Aura AI</h1>
              <p className="hidden truncate text-sm text-text-tertiary sm:block">İkinci El Alışveriş & Analiz Motoru</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeListing && (
              <Link
                to={ROUTES.LISTING_DETAIL(activeListing.id)}
                className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3 hidden md:inline-flex"
              >
                <span className="max-w-xs truncate">{activeListing.title}</span>
                <ExternalLink className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
              </Link>
            )}
            <Button variant={showMemoryHub ? 'primary' : 'secondary'} size="sm" onClick={() => setShowMemoryHub(prev => !prev)} aria-expanded={showMemoryHub}>
              <BrainCircuit className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span className="hidden sm:inline">Hafıza</span>
            </Button>
            <button type="button" onClick={handleNewChat} disabled={isSending} aria-label="Yeni Oturum" className={ICON_BUTTON}>
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {showMemoryHub && (
          <div className="absolute inset-x-0 top-14 z-30 max-h-[80vh] overflow-y-auto border-b border-border bg-background-primary p-4 shadow-sm sm:p-6">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 flex items-start justify-between gap-4 border-b border-border-light pb-3">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Aura AI Bellek & Tercih Paneli</h2>
                  <p className="mt-1 text-sm text-text-secondary">Aura bu bilgileri sohbetlerinizde kişiselleştirilmiş yanıtlar için hatırlar.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowMemoryHub(false)}>Kapat</Button>
              </div>
              <AuraMemoryProfileHub />
            </div>
          </div>
        )}

        <div ref={listRef} className="w-full flex-1 overflow-y-auto px-3 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {isHeroState && (
              <div className="flex flex-col items-center py-6 text-center sm:py-10">
                <h2 className="text-2xl font-semibold text-text-primary">Nasıl yardımcı olabilirim?</h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
                  Piyasa fiyat değerlemesi, pazarlık teklif metinleri, satıcı güvenlik kontrolleri veya aradığınız ilanlar için hazırım.
                </p>
                <div className="mt-6 w-full text-left">
                  <AuraSuggestedPrompts disabled={isSending} onPick={send} />
                </div>
                <div className="mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2">
                  {DISCOVERY_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isSending}
                      onClick={() => send(prompt)}
                      className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeListing && (
              <div className="rounded border border-border p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border-light pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-secondary">
                      {activeListing.imageUrl ? <img src={activeListing.imageUrl} alt="" className="h-full w-full object-cover" /> : <Tag className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />}
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm text-text-tertiary">
                        <span>İncelenen İlan</span>
                        {activeListing.type && <span>{listingTypeLabel(activeListing.type)}</span>}
                        <span className="tabular-nums text-text-secondary">{formatListingPriceLabel(activeListing.price, activeListing.currency)}</span>
                      </p>
                      <h3 className="mt-0.5 truncate text-sm font-medium text-text-primary">{activeListing.title}</h3>
                    </div>
                  </div>
                  <Link
                    to={ROUTES.LISTING_DETAIL(activeListing.id)}
                    className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3 shrink-0"
                  >
                    <span>İlan Sayfası</span>
                    <ExternalLink className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                  </Link>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {quickListingActions.map(({ icon: Icon, label, prompt }) => (
                    <button
                      key={label}
                      type="button"
                      disabled={isSending}
                      onClick={() => send(prompt)}
                      className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3"
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                      <span className="truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`group flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-primary text-white' : 'border border-border bg-background-secondary text-text-secondary'}`}>
                    {isUser ? <UserRound className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                  </div>
                  <div className={`min-w-0 max-w-full sm:max-w-xl ${isUser ? 'text-right' : 'text-left'}`}>
                    <div className={`mb-1 flex items-center gap-2 text-sm text-text-tertiary ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-text-secondary">{isUser ? 'Siz' : 'Aura AI'}</span>
                      {m.createdAt && (
                        <span className="tabular-nums">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                    <div className={`rounded-md p-4 text-left ${isUser ? 'bg-primary text-white' : 'border border-border bg-background-primary text-text-primary'}`}>
                      {m.typing ? (
                        <p className="text-sm text-text-secondary motion-safe:animate-pulse">Aura piyasa verilerini ve ilan geçmişini analiz ediyor...</p>
                      ) : (
                        <>
                          <AuraMessageContent content={m.content} isUser={isUser} />
                          {Array.isArray(m.meta?.suggestedListings) && m.meta.suggestedListings.length > 0 && (
                            <div className="mt-4 border-t border-border-light pt-3">
                              <AuraSuggestedListingChips listings={m.meta.suggestedListings} />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!isUser && !m.typing && m.content && (
                      <div className="mt-1.5 flex items-center gap-1 pl-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(m.id, m.content)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
                        >
                          {copiedId === m.id ? <Check className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden /> : <Copy className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                          <span>{copiedId === m.id ? 'Kopyalandı' : 'Kopyala'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(m.id, 'up')}
                          aria-pressed={feedbackGiven[m.id] === 'up'}
                          aria-label="Faydalı Yanıt"
                          className={`rounded p-1.5 transition-colors hover:bg-background-secondary ${feedbackGiven[m.id] === 'up' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                          <ThumbsUp className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(m.id, 'down')}
                          aria-pressed={feedbackGiven[m.id] === 'down'}
                          aria-label="Yetersiz Yanıt"
                          className={`rounded p-1.5 transition-colors hover:bg-background-secondary ${feedbackGiven[m.id] === 'down' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                          <ThumbsDown className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 bg-background-primary p-3 sm:p-5">
          <div className="relative mx-auto max-w-3xl">
            {showQuickTools && (
              <div className="absolute bottom-full left-0 right-0 z-30 mb-3 rounded border border-border bg-background-primary p-2 shadow-sm sm:right-auto sm:w-96">
                <div className="mb-1 flex items-center justify-between border-b border-border-light px-2 pb-2">
                  <span className="text-sm text-text-tertiary">Hızlı Yapay Zeka Araçları</span>
                  <button type="button" onClick={() => setShowQuickTools(false)} aria-label="Kapat" className="rounded p-1 text-text-muted transition-colors hover:text-text-primary">
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                {AURA_CAPABILITIES.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      send(prompt);
                      setShowQuickTools(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-sm text-text-primary transition-colors hover:bg-background-secondary"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                    <span className="flex-1 truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col rounded border border-border bg-background-primary p-2 transition-colors focus-within:border-border-focus">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Aura'ya mesaj"
                placeholder={
                  activeListing
                    ? `"${activeListing.title?.slice(0, 30)}..." hakkında fiyat, pazarlık veya güvenlik sorusu sorun...`
                    : "Aura'ya ikinci el piyasası, fiyat analizi veya ürünler hakkında soru sorun..."
                }
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between border-t border-border-light px-1 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickTools(prev => !prev)}
                  aria-expanded={showQuickTools}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-text-secondary transition-colors hover:bg-background-secondary"
                >
                  <Wand2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  <span>Hızlı Araçlar</span>
                  <ChevronDown className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                </button>
                <div className="flex items-center gap-2">
                  <span className="hidden text-sm text-text-muted sm:inline">Enter ile gönderin</span>
                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={isSending || !input.trim()}
                    aria-label="Gönder"
                    className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 w-9 shrink-0"
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-text-muted">
              Aura AI hata yapabilir. Önemli alışveriş ve ödeme adımlarında ilan ve satıcı detaylarını teyit ediniz.
            </p>
          </div>
        </div>
      </main>

      <PremiumUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} featureHint={upgradeHint} />

      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Sohbet Geçmişini Temizle"
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>{t("cancel")}</Button>
          <Button variant="danger" onClick={handleClearHistory}>Temizle</Button>
        </>}
      >
        <p className="text-sm text-text-secondary">Tüm sohbet geçmişiniz silinecek. Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
};

export default AuraChatPage;
