import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft as ArrowLeftIcon, 
  Bell, 
  CreditCard, 
  MailOpen, 
  ShoppingBag, 
  RefreshCw, 
  Search as MagnifyingGlassIcon, 
  ShieldCheck, 
  Tag, 
  Trash2, 
  Inbox,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
      <div className="flex flex-col items-center text-slate-400 gap-3">
        <MailOpen className="w-8 h-8 animate-pulse text-indigo-600" />
        <span className="text-xs font-semibold">{t("loading_mailbox", "Posta kutusu yükleniyor...")}</span>
      </div>
    </div>
  );
};

const EmailsPageFeedback = ({ error, emails, filterType }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="m-4 bg-rose-50 border border-rose-200 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-rose-900">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {EMAIL_MESSAGES.NO_EMAILS_TITLE}
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
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
      <div className="p-16 text-center text-sm text-slate-400">
        <MailOpen className="w-8 h-8 animate-pulse text-indigo-600 mx-auto mb-2" />
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
          ? 'min-h-0 h-full w-full bg-white border border-slate-200/90 rounded-3xl flex flex-col overflow-hidden shadow-xs'
          : 'min-h-0 h-[min(100dvh,100vh)] flex flex-col bg-slate-50 overflow-hidden'
      }
    >
      {/* Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {!embedded && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label={t("back", "Geri")}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              {t("mailbox", "Posta Kutusu")}
            </h1>
            {globalUnreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
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
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] })}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title={t("refresh", "Yenile")}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteAllEmails}
            disabled={isDeleting || filteredEmails.length === 0}
            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 transition-colors"
            title={t("delete_all", "Tümünü Sil")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 3-Column Superhuman / Modern Layout: Folders | Messages | Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[240px_minmax(300px,420px)_minmax(0,1fr)]">
        
        {/* 1. Folders Sidebar */}
        <aside className="hidden min-h-0 w-full min-w-0 flex-col border-r border-slate-200/90 bg-slate-50/50 lg:flex">
          <div className="flex-1 space-y-1 overflow-y-auto p-3">
            {folderItems.map((item) => {
              const Icon = item.icon;
              const active = filterType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-xs transition-all ${
                    active
                      ? 'bg-slate-900 font-bold text-white shadow-xs'
                      : 'text-slate-600 font-medium hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 2. Message List */}
        <section
          className={`flex min-h-0 w-full min-w-0 flex-col border-r border-slate-200/90 bg-white ${
            selectedEmail ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Subheader: Folder Title & Pagination */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
              {selectedFolderLabel}
            </h2>

            <div className="flex shrink-0 items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={pageInfo.page === 0}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/60 disabled:opacity-30"
                aria-label="Önceki Sayfa"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[11px] font-bold tabular-nums text-slate-500">
                {pageInfo.page + 1} / {Math.max(pageInfo.totalPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={pageInfo.page + 1 >= pageInfo.totalPages}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/60 disabled:opacity-30"
                aria-label="Sonraki Sayfa"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Folder Chips Scroll */}
          <div className="lg:hidden shrink-0 border-b border-slate-200/80 bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {folderItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFolderSelect(item.id)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    filterType === item.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-700'
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
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-slate-50 px-4 py-2.5 lg:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600"
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
            <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                <MailOpen className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {t("select_an_item_to_read", "Okumak İçin Bir E-Posta Seçin")}
              </h3>
              <p className="max-w-xs text-xs text-slate-500">
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