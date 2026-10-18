import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft as ArrowLeftIcon,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Inbox,
  MailOpen,
  RefreshCw,
  Search as MagnifyingGlassIcon,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { emailService } from '../services/emailService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { handleError, parseError } from '../../common/errorHandler.js';
import { extractSuccessMessage } from '../../common/successHandler.js';
import EmailListItem from '../components/EmailListItem';
import EmailContent from '../components/EmailContent';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { EMAIL_TYPES, extractEmailPreview } from '../emails.js';
import { EMAIL_DEFAULTS, EMAIL_FILTERS, EMAIL_MESSAGES, EMAIL_QUERY_STALE_MS } from '../emailConstants.js';
import { useBadgeCounts } from '../../common/hooks/useBadgeCounts.js';

const FILTER_TYPE_MAP = {
  [EMAIL_FILTERS.ALL]: [],
  [EMAIL_FILTERS.ORDERS]: [
    EMAIL_TYPES.ORDER_CONFIRMATION,
    EMAIL_TYPES.ORDER_CANCELLED,
    EMAIL_TYPES.ORDER_COMPLETED,
    EMAIL_TYPES.ORDER_REFUNDED,
    EMAIL_TYPES.SALE_NOTIFICATION
  ],
  [EMAIL_FILTERS.PAYMENTS]: [
    EMAIL_TYPES.PAYMENT_SUCCESS,
    EMAIL_TYPES.PAYMENT_RECEIPT,
    EMAIL_TYPES.PAYMENT_VERIFICATION
  ],
  [EMAIL_FILTERS.OFFERS]: [
    EMAIL_TYPES.OFFER_RECEIVED,
    EMAIL_TYPES.OFFER_COUNTER_RECEIVED,
    EMAIL_TYPES.OFFER_ACCEPTED,
    EMAIL_TYPES.OFFER_REJECTED,
    EMAIL_TYPES.OFFER_EXPIRED,
    EMAIL_TYPES.OFFER_COMPLETED
  ],
  [EMAIL_FILTERS.ACCOUNT_SECURITY]: [
    EMAIL_TYPES.VERIFICATION,
    EMAIL_TYPES.VERIFICATION_CODE,
    EMAIL_TYPES.PASSWORD_RESET,
    EMAIL_TYPES.PHONE_UPDATE,
    EMAIL_TYPES.WELCOME
  ],
  [EMAIL_FILTERS.SYSTEM_NOTIFICATIONS]: [
    EMAIL_TYPES.NOTIFICATION,
    EMAIL_TYPES.NEW_LISTING,
    EMAIL_TYPES.NEW_LISTING_NOTIFICATION,
    EMAIL_TYPES.GREAT_SELLER,
    EMAIL_TYPES.MEMBERSHIP_ACTIVATED,
    EMAIL_TYPES.MEMBERSHIP_UPGRADE,
    EMAIL_TYPES.PRICE_CHANGE,
    EMAIL_TYPES.SYSTEM,
    EMAIL_TYPES.AUDIT_ALERT
  ],
  [EMAIL_FILTERS.LEGAL]: [
    EMAIL_TYPES.AGREEMENT_UPDATED,
    EMAIL_TYPES.AGREEMENT_UPDATE
  ],
  [EMAIL_FILTERS.PROMOTIONS]: [
    EMAIL_TYPES.PROMOTIONAL
  ]
};

const EmailListSkeleton = () => (
  <div className="divide-y divide-border-light" aria-busy="true" aria-label="E-postalar yükleniyor">
    {[1, 2, 3, 4, 5, 6].map((row) => (
      <div key={row} className="px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-background-tertiary" />
          <div className="h-3 w-10 animate-pulse rounded-sm bg-background-tertiary" />
        </div>
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded-sm bg-background-tertiary" />
        <div className="mt-1.5 h-3 w-full animate-pulse rounded-sm bg-background-secondary" />
      </div>
    ))}
  </div>
);

const EmailsPageFeedback = ({ error, emails, filterType, searchTerm, onRetry, onClearSearch }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="m-4 rounded border border-border bg-background-secondary p-4">
        <h3 className="text-xs font-semibold text-status-error">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
        <p className="mt-1 text-xs text-text-secondary">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-8 items-center rounded border border-border bg-background-primary px-3 text-xs font-semibold text-text-primary transition-colors hover:border-card-border-hover hover:bg-background-tertiary"
          >
            {t('retry', 'Tekrar dene')}
          </button>
        )}
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex min-h-72 flex-1 flex-col items-center justify-center p-8 text-center">
        <Inbox className="mb-3 h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="mb-1 text-sm font-semibold text-text-primary">
          {EMAIL_MESSAGES.NO_EMAILS_TITLE}
        </h3>
        <p className="max-w-xs text-xs text-text-tertiary">
          {searchTerm?.trim()
            ? t('no_emails_matching_search', 'Arama kriterlerinize uygun e-posta bulunamadı.')
            : filterType === EMAIL_FILTERS.ALL
            ? EMAIL_MESSAGES.NO_EMAILS_ALL
            : t('no_emails_in_folder', 'Bu klasörde henüz bir e-posta bulunmuyor.')}
        </p>
        {searchTerm?.trim() && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-3 inline-flex h-8 items-center rounded border border-border bg-background-primary px-3 text-xs font-semibold text-text-primary transition-colors hover:border-card-border-hover hover:bg-background-secondary"
          >
            {t('clear_search', 'Aramayı temizle')}
          </button>
        )}
      </div>
    );
  }

  return null;
};

const EmailsPage = ({ embedded = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthState();

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterType, setFilterType] = useState(EMAIL_FILTERS.ALL);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(EMAIL_DEFAULTS.PAGE);
  const pageSize = EMAIL_DEFAULTS.PAGE_SIZE;

  const { emailCount: globalUnreadCount } = useBadgeCounts({ userId: user?.id });

  useEffect(() => {
    setSelectedEmail(null);
    setFilterType(EMAIL_FILTERS.ALL);
    setSearchTerm('');
    setPage(EMAIL_DEFAULTS.PAGE);
  }, [user?.id]);

  const activeTypes = useMemo(() => FILTER_TYPE_MAP[filterType] || [], [filterType]);

  const {
    data: emailPage,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['emails', 'my', user?.id, page, filterType],
    queryFn: async () => {
      return await emailService.getMyEmails(page, pageSize, activeTypes);
    },
    enabled: !!(isAuthenticated && user?.id),
    placeholderData: (previousData) => previousData,
    staleTime: EMAIL_QUERY_STALE_MS,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false
  });

  const emails = useMemo(() => emailPage?.content ?? [], [emailPage?.content]);
  const pageInfo = {
    page: emailPage?.number ?? page,
    size: emailPage?.size ?? pageSize,
    totalPages: emailPage?.totalPages ?? 0,
    totalElements: emailPage?.totalElements ?? emails.length
  };

  const handleDelete = useCallback(
    async ({ title, deleteFunc, onSuccess }) => {
      notification.showConfirmation(
        `${title} Sil`,
        `"${title}" öğesini silmek istediğinize emin misiniz?`,
        async () => {
          try {
            setIsDeleting(true);
            const res = await deleteFunc();
            const msg = typeof res === 'string' ? res : extractSuccessMessage(res);
            if (msg) {
              notification.showSuccess(null, msg);
            }
            onSuccess?.();
          } catch (err) {
            handleError(err, notification.showError);
          } finally {
            setIsDeleting(false);
          }
        }
      );
    },
    [notification]
  );

  const handleDeleteEmail = useCallback(
    (emailId, subject) => {
      if (!emailId) return;
      handleDelete({
        title: subject || 'E-Posta',
        deleteFunc: () => emailService.deleteEmail(emailId),
        onSuccess: () => {
          setSelectedEmail((prev) => (prev?.id === emailId ? null : prev));
          queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['badgeCounts', user?.id] });
        }
      });
    },
    [handleDelete, queryClient, user?.id]
  );

  const handleDeleteAllEmails = () =>
    handleDelete({
      title: 'Tüm E-Postalar',
      deleteFunc: () => emailService.deleteAll(),
      onSuccess: () => {
        setSelectedEmail(null);
        queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['badgeCounts', user?.id] });
      }
    });

  const filteredEmails = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return emails;
    const q = searchTerm.toLowerCase().trim();
    return emails.filter((e) => {
      const preview = extractEmailPreview(e.content, e.subject).toLowerCase();
      return (
        e.subject?.toLowerCase().includes(q) ||
        e.senderEmail?.toLowerCase().includes(q) ||
        e.recipientEmail?.toLowerCase().includes(q) ||
        preview.includes(q)
      );
    });
  }, [emails, searchTerm]);

  const folderItems = useMemo(
    () => [
      { id: EMAIL_FILTERS.ALL, label: 'Tüm E-Postalar', icon: Inbox },
      { id: EMAIL_FILTERS.ORDERS, label: 'Siparişler & Satışlar', icon: ShoppingBag },
      { id: EMAIL_FILTERS.PAYMENTS, label: 'Ödemeler & Makbuzlar', icon: CreditCard },
      { id: EMAIL_FILTERS.OFFERS, label: 'Pazarlık & Teklifler', icon: Tag },
      { id: EMAIL_FILTERS.ACCOUNT_SECURITY, label: 'Hesap & Güvenlik', icon: ShieldCheck },
      { id: EMAIL_FILTERS.SYSTEM_NOTIFICATIONS, label: 'Sistem & Bildirimler', icon: Bell },
      { id: EMAIL_FILTERS.LEGAL, label: 'Sözleşmeler', icon: FileText }
    ],
    []
  );

  const selectedFolderLabel = useMemo(
    () => folderItems.find((item) => item.id === filterType)?.label || 'Gelen Kutusu',
    [folderItems, filterType]
  );

  const handleFolderSelect = useCallback((folderId) => {
    setFilterType(folderId);
    setSelectedEmail(null);
    setPage(0);
  }, []);

  const onSelectEmail = useCallback(
    async (email) => {
      if (!email) return;
      setSelectedEmail(email);

      if (!email.read && !email.isRead) {
        queryClient.setQueryData(['emails', 'my', user?.id, page, filterType], (oldData) => {
          if (!oldData || !oldData.content) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((e) =>
              e.id === email.id ? { ...e, isRead: true, read: true } : e
            )
          };
        });

        try {
          await emailService.markAsRead(email.id);
          queryClient.invalidateQueries({ queryKey: ['badgeCounts', user?.id] });
        } catch (err) {
          console.error('Error marking email as read', err);
        }
      }
    },
    [queryClient, user?.id, page, filterType]
  );

  // Auto-select first email on desktop when list updates and current selection is absent
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) return;

    if (filteredEmails.length > 0) {
      const stillInList = selectedEmail && filteredEmails.some((e) => e.id === selectedEmail.id);
      if (!stillInList) {
        onSelectEmail(filteredEmails[0]);
      }
    } else if (selectedEmail) {
      setSelectedEmail(null);
    }
  }, [filteredEmails, selectedEmail, onSelectEmail]);

  const selectedIndex = useMemo(
    () => (selectedEmail ? filteredEmails.findIndex((e) => e.id === selectedEmail.id) : -1),
    [filteredEmails, selectedEmail]
  );

  const handleSelectPrev = useCallback(() => {
    if (selectedIndex > 0) {
      onSelectEmail(filteredEmails[selectedIndex - 1]);
    }
  }, [selectedIndex, filteredEmails, onSelectEmail]);

  const handleSelectNext = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < filteredEmails.length - 1) {
      onSelectEmail(filteredEmails[selectedIndex + 1]);
    }
  }, [selectedIndex, filteredEmails, onSelectEmail]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        if (selectedIndex >= 0 && selectedIndex < filteredEmails.length - 1) {
          e.preventDefault();
          handleSelectNext();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        if (selectedIndex > 0) {
          e.preventDefault();
          handleSelectPrev();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredEmails.length, handleSelectNext, handleSelectPrev]);

  return (
    <div
      className={
        embedded
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border bg-background-primary'
          : 'flex h-dvh min-h-0 flex-col overflow-hidden bg-background-secondary'
      }
    >
      {/* Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background-primary px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="shrink-0 rounded p-2 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary"
              aria-label={t('back', 'Geri')}
            >
              <ArrowLeftIcon className="h-5 w-5" strokeWidth={1.5} />
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-semibold tracking-tight text-text-primary">
              {t('mailbox', 'Posta Kutusu')}
            </h1>
            {globalUnreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary tabular-nums">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                {globalUnreadCount} {t('unread_lower', 'okunmamış')}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="min-w-0 max-w-md flex-1 px-2">
          <div className="relative">
            <input
              id="mail-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('search_mail', 'Konu veya içerikte ara...')}
              className="h-9 w-full rounded border border-border bg-background-secondary pl-9 pr-8 text-xs text-text-primary transition-colors placeholder:text-text-muted focus:border-border-focus focus:bg-background-primary focus:outline-none focus:ring-2 focus:ring-border-focus/20"
            />
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
              strokeWidth={1.5}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text-primary"
                aria-label={t('clear_search', 'Aramayı temizle')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded p-2 text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-40"
            title={t('refresh', 'Yenile')}
            aria-label={t('refresh', 'Yenile')}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleDeleteAllEmails}
            disabled={isDeleting || filteredEmails.length === 0}
            className="rounded p-2 text-text-secondary transition-colors hover:bg-background-secondary hover:text-status-error disabled:opacity-30"
            title={t('delete_all', 'Tümünü Sil')}
            aria-label={t('delete_all', 'Tümünü Sil')}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* 3-Column Editorial Layout: Folders | Messages | Reading Pane */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[204px_340px_minmax(0,1fr)] xl:grid-cols-[220px_360px_minmax(0,1fr)]">
        {/* 1. Folders Sidebar */}
        <aside className="hidden min-h-0 w-full min-w-0 flex-col border-r border-border bg-background-secondary/40 lg:flex">
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5" aria-label={t('mail_folders', 'E-posta klasörleri')}>
            {folderItems.map((item) => {
              const Icon = item.icon;
              const active = filterType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded px-3 py-2 text-left text-xs transition-colors ${
                    active
                      ? 'bg-primary font-semibold text-white'
                      : 'font-medium text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-text-muted'}`}
                      strokeWidth={1.5}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 2. Message List */}
        <section
          className={`flex min-h-0 w-full min-w-0 flex-col border-r border-border bg-background-primary ${
            selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subheader: Folder Title & Pagination */}
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border-light bg-background-secondary/50 px-4">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-xs font-semibold text-text-primary">
                {selectedFolderLabel}
              </h2>
              <span className="text-xs text-text-muted tabular-nums">
                ({pageInfo.totalElements})
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={pageInfo.page === 0}
                className="rounded p-1 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary disabled:opacity-30"
                aria-label="Önceki Sayfa"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <span className="px-1 text-xs font-medium tabular-nums text-text-secondary">
                {pageInfo.page + 1} / {Math.max(pageInfo.totalPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                className="rounded p-1 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary disabled:opacity-30"
                aria-label="Sonraki Sayfa"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Mobile Folder Tabs */}
          <div className="shrink-0 border-b border-border bg-background-secondary px-3 py-2 lg:hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {folderItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`shrink-0 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filterType === item.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-background-primary text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Email Items */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading && !emails.length ? (
              <EmailListSkeleton />
            ) : (
              <>
                <EmailsPageFeedback
                  error={error ? parseError(error).message : null}
                  emails={filteredEmails}
                  filterType={filterType}
                  searchTerm={searchTerm}
                  onRetry={() => refetch()}
                  onClearSearch={() => setSearchTerm('')}
                />
                {filteredEmails.map((email) => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={selectedEmail?.id === email.id}
                    onSelect={onSelectEmail}
                    onDelete={handleDeleteEmail}
                    isDeleting={isDeleting}
                  />
                ))}
              </>
            )}
          </div>
        </section>

        {/* 3. Reading Pane */}
        <section
          className={`flex min-h-0 min-w-0 flex-1 flex-col bg-background-primary ${
            !selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {selectedEmail ? (
            <>
              {/* Mobile Back to List Button */}
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-background-secondary px-4 py-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4" strokeWidth={1.5} />
                  <span>{t('list', 'Mesaj Listesine Dön')}</span>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <EmailContent
                  email={selectedEmail}
                  onDelete={handleDeleteEmail}
                  isDeleting={isDeleting}
                  onSelectPrev={handleSelectPrev}
                  onSelectNext={handleSelectNext}
                  hasPrev={selectedIndex > 0}
                  hasNext={selectedIndex >= 0 && selectedIndex < filteredEmails.length - 1}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-text-muted">
              <MailOpen className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="text-sm font-semibold text-text-primary">
                {t('select_an_item_to_read', 'Okumak İçin Bir E-Posta Seçin')}
              </h3>
              <p className="max-w-xs text-xs text-text-tertiary">
                {t(
                  'nothing_is_selected_choose_a_message_in_',
                  'Sol taraftaki listeden görüntülemek istediğiniz e-postaya tıklayın.'
                )}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmailsPage;