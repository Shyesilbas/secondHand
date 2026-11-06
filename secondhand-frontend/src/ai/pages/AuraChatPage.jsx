import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUp,
  BrainCircuit,
  Check,
  Copy,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  Wand2,
  X
} from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { AI_AGENT_MODE_ENABLED } from '../config/agentConfig.js';
import { aiChatService } from '../services/aiChatService.js';
import { useAuraChat } from '../hooks/useAuraChat.js';
import { clearAllAuraPersistedMessages, createChatMessage, getApiErrorMessage, sendAuraRequest } from '../utils/auraChatUtils.js';
import AuraSuggestedListingChips from '../components/AuraSuggestedListingChips.jsx';
import AuraMessageContent from '../components/AuraMessageContent.jsx';
import AuraMemoryProfileHub from '../components/AuraMemoryProfileHub.jsx';
import { buildAuraListingSessionContext, formatListingPriceLabel, listingTypeLabel } from '../utils/auraListingContext.js';
import { useListingData } from '../../listing/hooks/useListingData.js';
import { usePlan } from '../../common/hooks/usePlan.js';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import Button, { buttonClasses } from '@/common/components/ui/Button';
import Modal from '@/common/components/ui/Modal';
import { cacheService } from '../../common/services/cacheService.js';
import { ROUTES } from '../../common/constants/routes.js';

// Older builds persisted a greeting with this id; it is no longer part of the conversation.
const LEGACY_WELCOME_ID = 'aura-welcome';
const TEXTAREA_MAX_HEIGHT = 160;

const ICON_BUTTON = 'inline-flex h-9 w-9 items-center justify-center rounded text-text-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50';

const buildGeneralPrompts = (t) => [
  {
    id: 'price',
    icon: TrendingDown,
    label: t('aura_prompt_general_price', 'Bir ürünün fiyatı uygun mu?'),
    message: 'İkinci el piyasasında fiyat analizi nasıl yapılır? Bir ürünün gerçek piyasa değerini ve fırsat olup olmadığını nasıl belirleyebilirim?',
  },
  {
    id: 'offer',
    icon: MessageSquare,
    label: t('aura_prompt_general_offer', 'Teklif mesajı nasıl yazılır?'),
    message: 'Bir ilana teklif verirken satıcıyı ikna edecek, piyasaya uygun ve saygılı bir pazarlık mesajı taslağı hazırlar mısın?',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    label: t('aura_prompt_general_safety', 'Güvenli ödeme nasıl çalışır?'),
    message: 'İkinci el alışverişte dolandırıcılıktan korunmak için nelere dikkat etmeliyim? Güvenli ödeme havuzu (Escrow) sistemi nasıl çalışır?',
  },
  {
    id: 'search',
    icon: Search,
    label: t('aura_prompt_general_search', 'Bütçeme uygun ilan bul'),
    message: 'Bütçeme ve kriterlerime en uygun ikinci el ilanları bulmama yardımcı olur musun?',
  },
];

const buildListingPrompts = (t, listing) => [
  {
    id: 'price',
    icon: TrendingDown,
    label: t('aura_prompt_price', 'Fiyatı piyasaya göre değerlendir'),
    message: `Bu ürünün (${listing?.title || 'ilan'}) fiyatı piyasa ortalamasına göre fırsat mı? Fiyat analizi yapabilir misin?`,
  },
  {
    id: 'offer',
    icon: MessageSquare,
    label: t('aura_prompt_offer', 'Pazarlık mesajı yaz'),
    message: 'Bu ürün için satıcıyı ikna edecek nazik ve piyasaya uygun bir pazarlık mesajı taslağı oluşturur musun?',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    label: t('aura_prompt_safety', 'Güvenli alışveriş adımları'),
    message: 'Bu satıcıdan alışveriş yaparken nelere dikkat etmeliyim ve güvenli ödeme havuzu süreci nasıl işler?',
  },
  {
    id: 'pros-cons',
    icon: Wand2,
    label: t('aura_prompt_pros_cons', 'Avantaj ve riskleri çıkar'),
    message: 'Bu ürünün özellikleri ve açıklamasına göre öne çıkan avantajları ve olası riskleri nelerdir?',
  },
];

const ListingContextBar = ({ listing, onDetach }) => {
  const { t } = useTranslation();
  return (
    <div className="shrink-0 border-b border-border-light bg-background-secondary">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border-light bg-background-primary">
          {listing.imageUrl ? (
            <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Tag className="h-4 w-4 text-text-muted" strokeWidth={1.5} aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-tertiary">
            {t('aura_discussing_listing', 'Bu ilan hakkında konuşuyorsun')}
            {listing.type ? ` · ${listingTypeLabel(listing.type)}` : ''}
          </p>
          <div className="flex min-w-0 items-baseline gap-2">
            <Link
              to={ROUTES.LISTING_DETAIL(listing.id)}
              className="truncate text-sm font-medium text-text-primary hover:underline"
            >
              {listing.title}
            </Link>
            <span className="shrink-0 text-sm tabular-nums text-text-secondary">
              {formatListingPriceLabel(listing.price, listing.currency)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDetach}
          className={ICON_BUTTON}
          aria-label={t('aura_detach_listing', 'İlan bağlantısını kaldır')}
          title={t('aura_detach_listing', 'İlan bağlantısını kaldır')}
        >
          <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
};

const AssistantMessage = ({ message, copied, onCopy }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-light bg-background-secondary text-text-secondary">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-text-tertiary">Aura</p>
        {message.typing ? (
          <p className="text-sm text-text-tertiary">{t('aura_preparing_answer', 'Yanıt hazırlanıyor…')}</p>
        ) : (
          <>
            <AuraMessageContent content={message.content} />
            {Array.isArray(message.meta?.suggestedListings) && message.meta.suggestedListings.length > 0 && (
              <div className="mt-3">
                <AuraSuggestedListingChips listings={message.meta.suggestedListings} />
              </div>
            )}
            {message.content && (
              <button
                type="button"
                onClick={() => onCopy(message.id, message.content)}
                className="mt-1.5 -ml-2 inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-status-success" strokeWidth={1.5} aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                )}
                {copied ? t('copied', 'Kopyalandı') : t('copy', 'Kopyala')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UserMessage = ({ message }) => (
  <div className="flex justify-end">
    <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-md bg-background-tertiary px-4 py-2.5 text-sm leading-relaxed text-text-primary sm:max-w-[75%]">
      {message.content}
    </p>
  </div>
);

export const AuraChatPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const location = useLocation();
  const userId = user?.id ?? null;

  const listingFromState = location?.state?.listing || null;
  const listingIdFromState = location?.state?.listingId || null;
  const { listing: fetchedListing } = useListingData(listingIdFromState, !listingFromState && !!listingIdFromState);
  const [detachedListingId, setDetachedListingId] = useState(null);
  const sourceListing = listingFromState || fetchedListing || null;
  const activeListing = sourceListing && sourceListing.id !== detachedListingId ? sourceListing : null;

  const { dailyAuraUsage, dailyAuraLimit, isPremium, isLoading: planLoading } = usePlan({ enabled: userId != null });
  const remainingQuestions = Math.max(0, dailyAuraLimit - dailyAuraUsage);
  const quotaKnown = userId != null && !planLoading;
  const quotaExhausted = quotaKnown && remainingQuestions === 0;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMemoryHub, setShowMemoryHub] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const textareaRef = useRef(null);

  const listingContext = useMemo(() => buildAuraListingSessionContext(activeListing), [activeListing]);

  const buildPayload = useMemo(() => (text) => ({
    message: text.trim(),
    context: listingContext || undefined,
    agentMode: AI_AGENT_MODE_ENABLED,
    uiContext: {
      currentPage: 'AuraChatPage',
      route: location.pathname,
      listingId: activeListing?.id ? String(activeListing.id) : undefined,
    },
  }), [activeListing?.id, listingContext, location.pathname]);

  const sendApi = useMemo(() => (payload) => sendAuraRequest({
    payload,
    agentMode: AI_AGENT_MODE_ENABLED,
    onLimitExceeded: () => setShowUpgradeModal(true),
  }), []);

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
  } = useAuraChat({
    userId,
    isAuthenticated: userId != null,
    initialMessages: [],
    withTyping: true,
    buildPayload,
    sendApi,
    persistMessagesSurface: 'page',
  });

  const conversation = useMemo(() => messages.filter((m) => m.id !== LEGACY_WELCOME_ID), [messages]);
  const hasUserMessages = conversation.some((m) => m.role === 'user');
  const prompts = useMemo(
    () => (activeListing ? buildListingPrompts(t, activeListing) : buildGeneralPrompts(t)),
    [t, activeListing]
  );

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [input]);

  useEffect(() => {
    if (!copiedId) return undefined;
    const timer = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedId]);

  const copyToClipboard = (id, text) => {
    navigator.clipboard?.writeText(text).then(() => setCopiedId(id)).catch(() => {});
  };

  const send = (text) => sendMessage({ text });

  const resetConversation = () => {
    clearAllAuraPersistedMessages(userId);
    cacheService.remove(storageKey);
    setMessages([]);
  };

  const appendError = (error, fallback) => {
    setMessages((prev) => [...prev, createChatMessage({ role: 'assistant', content: getApiErrorMessage(error, fallback) })]);
  };

  const handleNewChat = async () => {
    if (userId == null) return;
    setIsSending(true);
    try {
      await aiChatService.newChat();
      resetConversation();
    } catch (e) {
      appendError(e, t('aura_new_chat_failed', 'Yeni sohbet başlatılamadı.'));
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = async () => {
    setConfirmClear(false);
    if (userId == null) return;
    setIsSending(true);
    try {
      await aiChatService.deleteHistory();
      resetConversation();
    } catch (e) {
      appendError(e, t('aura_clear_failed', 'Sohbet geçmişi silinemedi.'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background-primary text-text-primary">
      <header className="shrink-0 border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden />
            <h1 className="truncate text-base font-semibold text-text-primary">Aura</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowMemoryHub(true)} disabled={userId == null}>
              <BrainCircuit className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span className="hidden sm:inline">{t('aura_memory', 'Hafıza')}</span>
            </Button>
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={isSending || userId == null || conversation.length === 0}
              className={ICON_BUTTON}
              aria-label={t('aura_clear_history', 'Sohbet geçmişini temizle')}
              title={t('aura_clear_history', 'Sohbet geçmişini temizle')}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
            <Button variant="secondary" size="sm" onClick={handleNewChat} disabled={isSending || userId == null || conversation.length === 0}>
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              <span>{t('aura_new_chat', 'Yeni sohbet')}</span>
            </Button>
          </div>
        </div>
      </header>

      {activeListing && <ListingContextBar listing={activeListing} onDetach={() => setDetachedListingId(activeListing.id)} />}

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {!hasUserMessages && (
            <section className="pb-4 pt-2 sm:pt-8">
              <h2 className="text-xl font-semibold text-text-primary sm:text-2xl">
                {activeListing
                  ? t('aura_listing_intro_title', 'Bu ilan hakkında ne öğrenmek istersin?')
                  : t('aura_intro_title', 'Nasıl yardımcı olabilirim?')}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
                {activeListing
                  ? t('aura_listing_intro_text', 'Fiyatı değerlendirebilir, satıcıya gönderebileceğin bir teklif yazabilir veya dikkat etmen gerekenleri sıralayabilirim.')
                  : t('aura_intro_text', 'İlan arama, fiyat değerlendirme, pazarlık ve güvenli ödeme konularında sorularını yanıtlayabilirim.')}
              </p>
              <ul className="mt-5 divide-y divide-border-light rounded border border-border">
                {prompts.map(({ id, icon: Icon, label, message }) => (
                  <li key={id}>
                    <button
                      type="button"
                      disabled={isSending}
                      onClick={() => send(message)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-text-primary transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      <ArrowUp className="h-3.5 w-3.5 shrink-0 rotate-45 text-text-muted" strokeWidth={1.5} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {conversation.length > 0 && (
            <div className={`space-y-6 ${hasUserMessages ? '' : 'border-t border-border-light pt-6'}`} aria-live="polite">
              {conversation.map((m) => (m.role === 'user'
                ? <UserMessage key={m.id} message={m} />
                : <AssistantMessage key={m.id} message={m} copied={copiedId === m.id} onCopy={copyToClipboard} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-background-primary">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          {quotaExhausted && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-status-warning-border bg-status-warning-bg px-3 py-2 text-sm text-status-warning-text">
              <span>{t('aura_quota_exhausted', 'Bugünkü Aura hakkın doldu. Yarın yenilenir.')}</span>
              {!isPremium && (
                <button type="button" onClick={() => setShowUpgradeModal(true)} className="font-medium underline-offset-2 hover:underline">
                  {t('aura_upgrade_for_more', 'Daha fazla hak için Premium')}
                </button>
              )}
            </div>
          )}
          <div className="flex items-end gap-2 rounded border border-border bg-background-primary p-2 transition-colors focus-within:border-border-focus">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              aria-label={t('aura_message_label', "Aura'ya mesaj")}
              placeholder={activeListing
                ? t('aura_listing_placeholder', 'Bu ilan hakkında bir soru sor')
                : t('aura_placeholder', "Aura'ya bir soru sor")}
              className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={isSending || !input.trim()}
              aria-label={t('send', 'Gönder')}
              className={`${buttonClasses('primary', 'sm')} w-9 shrink-0 !px-0`}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-text-tertiary">
            <span>{t('aura_disclaimer', 'Aura hata yapabilir; ödeme öncesi ilan ve satıcı bilgilerini kontrol et.')}</span>
            {quotaKnown && (
              <span className="tabular-nums">
                {t('aura_quota_remaining', {
                  defaultValue: 'Bugün kalan: {{remaining}}/{{limit}}',
                  remaining: remainingQuestions,
                  limit: dailyAuraLimit,
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureHint={t('aura_daily_limit_exceeded', 'Günlük Aura AI limitinize ulaştınız.')}
      />

      <Modal
        isOpen={showMemoryHub}
        onClose={() => setShowMemoryHub(false)}
        title={t('aura_memory_title', 'Aura hafızası')}
        description={t('aura_memory_description', 'Aura, yanıtlarını kişiselleştirmek için bu tercihleri hatırlar.')}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setShowMemoryHub(false)}>{t('close', 'Kapat')}</Button>}
      >
        <AuraMemoryProfileHub />
      </Modal>

      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title={t('aura_clear_history', 'Sohbet geçmişini temizle')}
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmClear(false)}>{t('cancel', 'İptal')}</Button>
          <Button variant="danger" onClick={handleClearHistory}>{t('clear', 'Temizle')}</Button>
        </>}
      >
        <p className="text-sm text-text-secondary">
          {t('aura_clear_history_confirm', 'Aura ile tüm sohbet geçmişin silinecek. Bu işlem geri alınamaz.')}
        </p>
      </Modal>
    </div>
  );
};

export default AuraChatPage;
