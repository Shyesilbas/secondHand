import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '../../common/components/ui/index.js';
import { EMAIL_FILTERS, EMAIL_MESSAGES } from '../emailConstants.js';

export const EmailListSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="divide-y divide-border-light" aria-busy="true" aria-label={t('loading_emails', 'E-postalar yükleniyor')}>
      {[1, 2, 3, 4, 5, 6].map((row) => (
        <div key={row} className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-10" />
          </div>
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3.5 w-full" />
        </div>
      ))}
    </div>
  );
};

export const EmailsPageFeedback = ({ error, emails, filterType, searchTerm, onRetry, onClearSearch }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <ErrorState
        size="compact"
        bordered={false}
        title={EMAIL_MESSAGES.LOAD_ERROR_TITLE}
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (!emails.length) {
    const hasSearch = Boolean(searchTerm?.trim());
    const description = hasSearch
      ? t('no_emails_matching_search', 'Arama kriterlerinize uygun e-posta bulunamadı.')
      : filterType === EMAIL_FILTERS.ALL
        ? EMAIL_MESSAGES.NO_EMAILS_ALL
        : t('no_emails_in_folder', 'Bu kategoride henüz bir e-posta bulunmuyor.');

    return (
      <EmptyState
        icon={Inbox}
        size="compact"
        title={EMAIL_MESSAGES.NO_EMAILS_TITLE}
        description={description}
        className="border-0 py-12"
        primaryAction={
          hasSearch && onClearSearch
            ? { label: t('clear_search', 'Aramayı temizle'), onClick: onClearSearch }
            : undefined
        }
      />
    );
  }

  return null;
};
