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

// Sidebar capability shortcuts
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
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
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
      label: 'Fiyat Değerlemesi',
      prompt: `Bu ürünün (${activeListing?.title || 'ilan'}) fiyatı piyasa ortalamasına göre fırsat mı? Fiyat analizi yapabilir misin?`,
    },
    {
      icon: MessageSquare,
      label: 'Pazarlık Teklifi',
      prompt: `Bu ürün için satıcıyı ikna edecek nazik ve piyasaya uygun bir pazarlık mesajı taslağı oluşturur musun?`,
    },
    {
      icon: ShieldCheck,
      label: 'Güvenli Alışveriş (Escrow)',
      prompt: `Bu satıcıdan alışveriş yaparken nelere dikkat etmeliyim ve güvenli ödeme havuzu süreci nasıl işler?`,
    },
    {
      icon: Wand2,
      label: 'Avantaj & Risk Analizi',
      prompt: `Bu ürünün özellikleri ve açıklamasına göre öne çıkan avantajları ve olası riskleri nelerdir?`,
    },
  ];

  const textareaRef = useRef(null);

  // Auto-grow textarea up to 120px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const send = (text) => sendMessage({ text });

  // A chat is fresh if the user hasn't asked anything yet
  const hasUserMessages = useMemo(() => messages.some((m) => m.role === 'user'), [messages]);

  return (
    <div className="flex h-[calc(100dvh-70px)] w-full overflow-hidden bg-background-secondary text-text-primary">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-background-primary transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-72 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden p-3">
          <div className="flex items-center gap-2 border-b border-border-light pb-3">
            <Button
              variant="secondary"
              className="flex-1 justify-start"
              onClick={() => {
                handleNewChat();
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              disabled={isSending}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>Yeni Sohbet</span>
            </Button>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Paneli Kapat"
              className={ICON_BUTTON}
            >
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {activeListing && (
            <div className="mt-3 rounded border border-border-light bg-background-secondary p-3">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-text-tertiary font-medium">Aktif İlan</span>
                <button
                  type="button"
                  onClick={() => setDetachedListingId(activeListing.id)}
                  className="text-text-muted transition-colors hover:text-status-error text-xs"
                >
                  Kaldır
                </button>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-primary">
                  {activeListing.imageUrl ? (
                    <img src={activeListing.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Tag className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-text-primary">{activeListing.title}</p>
                  <p className="text-xs tabular-nums text-text-secondary">
                    {formatListingPriceLabel(activeListing.price, activeListing.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
            <p className="px-2 pb-1 text-xs font-medium text-text-tertiary">Önerilen Konular</p>
            {AURA_CAPABILITIES.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                disabled={isSending}
                onClick={() => {
                  send(prompt);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-50"
              >
                <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1 border-t border-border-light pt-3">
            <button
              type="button"
              onClick={() => {
                setShowMemoryHub(true);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
            >
              <BrainCircuit className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              <span>Aura Hafıza Profili</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={isSending || userId == null}
              className="flex w-full items-center gap-2.5 rounded px-2.5 py-2 text-sm text-text-tertiary transition-colors hover:bg-background-secondary hover:text-status-error disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>Sohbet Geçmişini Temizle</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Conversation Column */}
      <main className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background-primary">
        {/* Header */}
        <header className="z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background-primary px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? "Paneli Kapat" : "Paneli Aç"}
              className={ICON_BUTTON}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary">Aura AI</h1>
                <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeListing && (
              <div className="hidden md:flex items-center gap-1.5 rounded border border-border bg-background-secondary px-2.5 py-1 text-xs">
                <Tag className="h-3.5 w-3.5 text-text-muted shrink-0" strokeWidth={1.5} aria-hidden />
                <Link
                  to={ROUTES.LISTING_DETAIL(activeListing.id)}
                  className="max-w-[180px] truncate font-medium text-text-primary hover:underline"
                >
                  {activeListing.title}
                </Link>
                <span className="tabular-nums text-text-tertiary">
                  ({formatListingPriceLabel(activeListing.price, activeListing.currency)})
                </span>
                <button
                  type="button"
                  onClick={() => setDetachedListingId(activeListing.id)}
                  title="Bağlantıyı kaldır"
                  aria-label="İlan bağlantısını kaldır"
                  className="ml-1 text-text-muted hover:text-status-error transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowMemoryHub(true)}>
              <BrainCircuit className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span className="hidden sm:inline">Hafıza</span>
            </Button>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={isSending}
              aria-label="Yeni Sohbet"
              title="Yeni Sohbet"
              className={ICON_BUTTON}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div ref={listRef} className="w-full flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Tranquil Empty / Hero State */}
            {!hasUserMessages && (
              <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-lg text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background-secondary text-text-secondary">
                    <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
                    Nasıl yardımcı olabilirim?
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                    İkinci el ürün değerlemesi, satıcı pazarlık stratejileri ve güvenli Escrow süreci hakkında sorularınızı yanıtlayabilirim.
                  </p>
                </div>

                {activeListing ? (
                  <div className="mt-8 rounded border border-border bg-background-primary p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 border-b border-border-light pb-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-background-secondary">
                          {activeListing.imageUrl ? (
                            <img src={activeListing.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Tag className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-x-2 text-xs text-text-tertiary">
                            <span>İncelenen İlan</span>
                            {activeListing.type && <span>· {listingTypeLabel(activeListing.type)}</span>}
                          </p>
                          <h3 className="truncate text-sm font-semibold text-text-primary">
                            {activeListing.title}
                          </h3>
                          <p className="text-sm font-medium tabular-nums text-text-secondary">
                            {formatListingPriceLabel(activeListing.price, activeListing.currency)}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={ROUTES.LISTING_DETAIL(activeListing.id)}
                        className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-card-border-hover hover:text-text-primary transition-colors shrink-0"
                      >
                        <span>İlanı İncele</span>
                        <ExternalLink className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
                      </Link>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickListingActions.map(({ icon: Icon, label, prompt }) => (
                        <button
                          key={label}
                          type="button"
                          disabled={isSending}
                          onClick={() => send(prompt)}
                          className="flex items-center gap-2.5 rounded border border-border bg-background-primary p-3 text-left transition-colors duration-150 ease-out hover:border-card-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-50"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
                          <span className="text-sm font-medium text-text-primary truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <AuraSuggestedPrompts disabled={isSending} onPick={send} />
                  </div>
                )}
              </div>
            )}

            {/* Active Conversation Messages */}
            {hasUserMessages &&
              messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`group flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium border mt-0.5 ${
                        isUser
                          ? 'border-border bg-background-tertiary text-text-secondary'
                          : 'border-border bg-background-primary text-text-secondary'
                      }`}
                    >
                      {isUser ? (
                        <UserRound className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      ) : (
                        <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                      )}
                    </div>

                    <div className={`min-w-0 max-w-[85%] sm:max-w-xl ${isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`mb-1 flex items-center gap-2 text-xs text-text-tertiary ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-medium text-text-secondary">{isUser ? 'Siz' : 'Aura AI'}</span>
                        {m.createdAt && (
                          <span className="tabular-nums">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded p-4 text-left ${
                          isUser
                            ? 'bg-background-tertiary border border-border-light text-text-primary'
                            : 'border border-border bg-background-primary text-text-primary'
                        }`}
                      >
                        {m.typing ? (
                          <p className="text-sm text-text-secondary motion-safe:animate-pulse">
                            Aura piyasa verilerini ve ilan geçmişini analiz ediyor...
                          </p>
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
                        <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(m.id, m.content)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={1.5} aria-hidden />
                            ) : (
                              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                            )}
                            <span>{copiedId === m.id ? 'Kopyalandı' : 'Kopyala'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(m.id, 'up')}
                            aria-pressed={feedbackGiven[m.id] === 'up'}
                            aria-label="Faydalı Yanıt"
                            className={`rounded p-1 transition-colors hover:bg-background-secondary ${
                              feedbackGiven[m.id] === 'up' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(m.id, 'down')}
                            aria-pressed={feedbackGiven[m.id] === 'down'}
                            aria-label="Yetersiz Yanıt"
                            className={`rounded p-1 transition-colors hover:bg-background-secondary ${
                              feedbackGiven[m.id] === 'down' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 bg-background-primary p-3 sm:p-4 border-t border-border">
          <div className="mx-auto max-w-3xl">
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
                    : "İkinci el piyasası, fiyat analizi veya ürünler hakkında soru sorun..."
                }
                rows={1}
                className="w-full resize-none bg-transparent px-2.5 py-1.5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between border-t border-border-light px-1 pt-1.5">
                <div className="min-w-0 flex items-center gap-2">
                  {activeListing && (
                    <span className="inline-flex items-center gap-1 text-xs text-text-tertiary px-1.5 py-0.5 rounded-sm bg-background-secondary border border-border-light max-w-[200px] sm:max-w-xs truncate">
                      <Tag className="h-3 w-3 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
                      <span className="truncate">{activeListing.title}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-text-muted sm:inline">Enter ile gönder</span>
                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={isSending || !input.trim()}
                    aria-label="Gönder"
                    className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors shrink-0"
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-text-muted">
              Aura AI hata yapabilir. Önemli alışveriş ve ödeme adımlarında satıcı ve ilan detaylarını teyit ediniz.
            </p>
          </div>
        </div>
      </main>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} featureHint={upgradeHint} />

      {/* Memory Profile Modal */}
      <Modal
        isOpen={showMemoryHub}
        onClose={() => setShowMemoryHub(false)}
        title="Aura AI Hafıza & Tercih Profili"
        description="Aura, sohbetlerinizde kişiselleştirilmiş yanıtlar vermek için bu tercihleri hatırlar."
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setShowMemoryHub(false)}>
            Kapat
          </Button>
        }
      >
        <AuraMemoryProfileHub />
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Sohbet Geçmişini Temizle"
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>{t("cancel", "İptal")}</Button>
          <Button variant="danger" onClick={handleClearHistory}>Temizle</Button>
        </>}
      >
        <p className="text-sm text-text-secondary">Tüm sohbet geçmişiniz silinecek. Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
};

export default AuraChatPage;
