import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon, Bell, CreditCard, MailOpen, ShoppingBag, RefreshCw, Search as MagnifyingGlassIcon, ShieldCheck, Tag, Trash2, Inbox, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { emailService } from '../services/emailService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { handleError, parseError } from '../../common/errorHandler.js';
import { extractSuccessMessage } from '../../common/successHandler.js';
import EmailListItem from '../components/EmailListItem';
import EmailContent from '../components/EmailContent';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { EMAIL_TYPES } from '../emails.js';
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

const EmailsPageLoader = () => {
  const { t } = useTranslation();
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center text-text-muted gap-3">
        <MailOpen className="w-8 h-8 animate-pulse text-text-primary" />
        <span className="text-xs font-semibold">{t("loading_mailbox", "Posta kutusu yükleniyor...")}</span>
      </div>
    </div>
  );
};

const EmailsPageFeedback = ({ error, emails, filterType }) => {

  if (error) {
    return (
      <div className="m-4 bg-background-secondary border border-border rounded-md p-4">
        <h3 className="text-xs font-semibold text-status-error-text">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
        <p className="text-xs text-status-error-text mt-1">{error}</p>
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-72">
        <Inbox className="mb-3 h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          {EMAIL_MESSAGES.NO_EMAILS_TITLE}
        </h3>
        <p className="text-xs text-text-tertiary max-w-xs">
          {filterType === EMAIL_FILTERS.ALL
            ? EMAIL_MESSAGES.NO_EMAILS_ALL
            : 'Bu klasörde henüz bir e-posta bulunmuyor.'}
        </p>
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
    error
  } = useQuery({
    queryKey: ['emails', 'my', user?.id, page, filterType],
    queryFn: async () => {
      return await emailService.getMyEmails(page, pageSize, activeTypes);
    },
    enabled: !!(isAuthenticated && user?.id),
    keepPreviousData: true,
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

  const handleDelete = async ({ title, deleteFunc, onSuccess }) => {
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
  };

  const handleDeleteEmail = (emailId, subject) => {
    if (!emailId) return;
    handleDelete({
      title: subject || 'E-Posta',
      deleteFunc: () => emailService.deleteEmail(emailId),
      onSuccess: () => {
        if (selectedEmail?.id === emailId) {
          setSelectedEmail(null);
        }
        queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['badgeCounts', user?.id] });
      }
    });
  };

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
    return emails.filter(
      (e) =>
        e.subject?.toLowerCase().includes(q) ||
        e.senderEmail?.toLowerCase().includes(q) ||
        e.recipientEmail?.toLowerCase().includes(q) ||
        e.content?.toLowerCase().includes(q)
    );
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
      setSelectedEmail(email);

      // Anında Okundu Olarak İşaretle (Instant UX)
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

  if (isLoading) {
    return embedded ? (
      <div className="p-16 text-center text-sm text-text-muted">
        <MailOpen className="w-8 h-8 animate-pulse text-text-primary mx-auto mb-2" />
        <span>{t("loading_mail", "E-postalar yükleniyor...")}</span>
      </div>
    ) : (
      <EmailsPageLoader />
    );
  }

  return (
    <div
      className={
        embedded
          ? 'min-h-0 h-full w-full bg-white border border-border/90 rounded-md flex flex-col overflow-hidden'
          : 'min-h-0 h-dvh flex flex-col bg-background-secondary overflow-hidden'
      }
    >
      {/* Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/90 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="shrink-0 rounded p-2 text-text-tertiary hover:bg-background-tertiary hover:text-text-primary transition-colors"
              aria-label={t("back", "Geri")}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-text-primary tracking-tight">
              {t("mailbox", "Posta Kutusu")}
            </h1>
            {globalUnreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-sm bg-background-secondary text-text-primary text-xs font-semibold border border-border">
                {globalUnreadCount} okunmamış
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="min-w-0 flex-1 max-w-md px-2">
          <div className="relative">
            <input
              id="mail-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search_mail", "E-postalarda ara...")}
              className="h-9 w-full rounded border border-border bg-background-secondary/70 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] })}
            className="rounded p-2 text-text-muted hover:bg-background-tertiary hover:text-text-primary transition-colors"
            title={t("refresh", "Yenile")}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteAllEmails}
            disabled={isDeleting || filteredEmails.length === 0}
            className="rounded p-2 text-text-muted hover:bg-background-secondary hover:text-status-error-text disabled:opacity-30 transition-colors"
            title={t("delete_all", "Tümünü Sil")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 3-Column Superhuman / Modern Layout: Folders | Messages | Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[240px_minmax(300px,420px)_minmax(0,1fr)]">
        
        {/* 1. Folders Sidebar */}
        <aside className="hidden min-h-0 w-full min-w-0 flex-col border-r border-border/90 bg-background-secondary/50 lg:flex">
          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {folderItems.map((item) => {
              const Icon = item.icon;
              const active = filterType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-md px-3.5 py-2.5 text-left text-xs transition-all ${
                    active
                      ? 'bg-primary font-semibold text-white'
                      : 'text-text-secondary font-medium hover:bg-background-tertiary/80 hover:text-text-primary'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-text-muted'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 2. Message List */}
        <section
          className={`flex min-h-0 w-full min-w-0 flex-col border-r border-border/90 bg-white ${
            selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subheader: Folder Title & Pagination */}
          <div className="flex shrink-0 items-center justify-between border-b border-border-light bg-background-secondary/60 px-4 py-2.5">
            <h2 className="text-xs font-semibold text-text-primary truncate">
              {selectedFolderLabel}
            </h2>

            <div className="flex shrink-0 items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={pageInfo.page === 0}
                className="rounded p-1 text-text-tertiary hover:bg-secondary-200/60 disabled:opacity-30"
                aria-label="Önceki Sayfa"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-xs font-semibold tabular-nums text-text-tertiary">
                {pageInfo.page + 1} / {Math.max(pageInfo.totalPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                className="rounded p-1 text-text-tertiary hover:bg-secondary-200/60 disabled:opacity-30"
                aria-label="Sonraki Sayfa"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Folder Chips Scroll */}
          <div className="lg:hidden shrink-0 border-b border-border/80 bg-background-secondary px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {folderItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`shrink-0 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterType === item.id
                      ? 'bg-primary text-white'
                      : 'border border-border bg-white text-text-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Email Items */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EmailsPageFeedback
              error={error ? parseError(error).message : null}
              emails={filteredEmails}
              filterType={filterType}
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
          </div>
        </section>

        {/* 3. Reading Pane */}
        <section
          className={`flex min-h-0 min-w-0 flex-1 flex-col bg-white ${
            !selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {selectedEmail ? (
            <>
              {/* Mobile Back to List Button */}
              <div className="flex shrink-0 items-center justify-between border-b border-border/80 bg-background-secondary px-4 py-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-primary"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>{t("list", "Mesaj Listesine Dön")}</span>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <EmailContent
                  email={selectedEmail}
                  onDelete={handleDeleteEmail}
                  isDeleting={isDeleting}
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-text-muted">
              <MailOpen className="h-5 w-5 shrink-0 text-secondary-300" strokeWidth={1.5} aria-hidden />
              <h3 className="text-sm font-semibold text-text-primary">
                {t("select_an_item_to_read", "Okumak İçin Bir E-Posta Seçin")}
              </h3>
              <p className="max-w-xs text-xs text-text-tertiary">
                {t("nothing_is_selected_choose_a_message_in_", "Sol taraftaki listeden görüntülemek istediğiniz e-postaya tıklayın.")}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmailsPage;