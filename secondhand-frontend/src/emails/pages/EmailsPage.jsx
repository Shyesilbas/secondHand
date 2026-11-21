import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../services/emailService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { handleError, parseError } from '../../common/errorHandler.js';
import { extractSuccessMessage } from '../../common/successHandler.js';
import EmailListItem from '../components/EmailListItem.jsx';
import { EmailFoldersSidebar, EmailMobileFolderTabs } from '../components/EmailFoldersSidebar.jsx';
import { getEmailFolderLabel } from '../emailConstants.js';
import EmailListToolbar from '../components/EmailListToolbar.jsx';
import { EmailListSkeleton, EmailsPageFeedback } from '../components/EmailListFeedback.jsx';
import EmailReadingPane from '../components/EmailReadingPane.jsx';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { extractEmailPreview } from '../emails.js';
import { EMAIL_DEFAULTS, EMAIL_FILTERS, EMAIL_QUERY_STALE_MS } from '../emailConstants.js';
import { EMAIL_FILTER_TYPE_MAP } from '../emailFilterMap.js';
import { useBadgeCounts } from '../../common/hooks/useBadgeCounts.js';

const EmailsPage = ({ embedded = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthState();

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filterType, setFilterType] = useState(EMAIL_FILTERS.ALL);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
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

  const activeTypes = useMemo(() => EMAIL_FILTER_TYPE_MAP[filterType] || [], [filterType]);

  const {
    data: emailPage,
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['emails', 'my', user?.id, page, filterType],
    queryFn: async () => emailService.getMyEmails(page, pageSize, activeTypes),
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

  const handleMarkAllAsRead = useCallback(async () => {
    const hasUnread = globalUnreadCount > 0 || filteredEmails.some((e) => !e.read && !e.isRead);
    if (!hasUnread) return;

    try {
      setIsMarkingAllRead(true);
      queryClient.setQueryData(['emails', 'my', user?.id, page, filterType], (oldData) => {
        if (!oldData || !oldData.content) return oldData;
        return {
          ...oldData,
          content: oldData.content.map((e) => ({ ...e, isRead: true, read: true }))
        };
      });
      setSelectedEmail((prev) => (prev ? { ...prev, isRead: true, read: true } : prev));
      queryClient.setQueryData(['badgeCounts', user?.id], (old) =>
        old ? { ...old, emailCount: 0 } : old
      );
      await emailService.markAllAsRead();
    } catch (err) {
      handleError(err, notification.showError);
      queryClient.invalidateQueries({ queryKey: ['emails', 'my', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['badgeCounts', user?.id] });
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [globalUnreadCount, filteredEmails, queryClient, user?.id, page, filterType, notification]);

  const selectedFolderLabel = useMemo(() => getEmailFolderLabel(filterType), [filterType]);

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
          queryClient.setQueryData(['badgeCounts', user?.id], (old) =>
            old ? { ...old, emailCount: Math.max(0, (old.emailCount || 1) - 1) } : old
          );
        } catch (err) {
          console.error('Error marking email as read', err);
        }
      }
    },
    [queryClient, user?.id, page, filterType]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

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
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden rounded border border-border-light bg-background-primary shadow-sm'
          : 'flex h-dvh min-h-0 flex-col overflow-hidden bg-background-secondary'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[204px_340px_minmax(0,1fr)] xl:grid-cols-[220px_360px_minmax(0,1fr)]">
        <EmailFoldersSidebar
          embedded={embedded}
          filterType={filterType}
          globalUnreadCount={globalUnreadCount}
          onBack={() => navigate(-1)}
          onSelectFolder={handleFolderSelect}
        />

        <section
          className={`flex min-h-0 w-full min-w-0 flex-col border-r border-border bg-background-primary ${selectedEmail ? 'hidden lg:flex' : 'flex'
            }`}
        >
          <EmailListToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
            onRefresh={() => refetch()}
            isFetching={isFetching}
            onMarkAllRead={handleMarkAllAsRead}
            disableMarkAllRead={
              isMarkingAllRead || (globalUnreadCount === 0 && !filteredEmails.some((e) => !e.read && !e.isRead))
            }
            isMarkingAllRead={isMarkingAllRead}
            onDeleteAll={handleDeleteAllEmails}
            disableDeleteAll={isDeleting || filteredEmails.length === 0}
            selectedFolderLabel={selectedFolderLabel}
            pageInfo={pageInfo}
            onPrevPage={() => setPage((p) => p - 1)}
            onNextPage={() => setPage((p) => p + 1)}
          />

          <EmailMobileFolderTabs
            filterType={filterType}
            onSelectFolder={handleFolderSelect}
          />

          <div className="min-h-0 flex-1 overflow-y-auto" aria-label={t('emails', 'E-postalar')}>
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

        <EmailReadingPane
          selectedEmail={selectedEmail}
          onClearSelection={() => setSelectedEmail(null)}
          onDelete={handleDeleteEmail}
          isDeleting={isDeleting}
          onSelectPrev={handleSelectPrev}
          onSelectNext={handleSelectNext}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < filteredEmails.length - 1}
        />
      </div>
    </div>
  );
};

export default EmailsPage;
