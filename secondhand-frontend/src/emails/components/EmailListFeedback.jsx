import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import { Button, EmptyState, Skeleton } from '../../common/components/ui/index.js';
import { EMAIL_FILTERS, EMAIL_MESSAGES } from '../emailConstants.js';

export const EmailListSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="divide-y divide-border-light" aria-busy="true" aria-label={t('loading_emails', 'E-postalar yükleniyor')}>
      {[1, 2, 3, 4, 5, 6].map((row) => (
        <div key={row} className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1.5 h-3 w-full" />
        </div>
      ))}
    </div>
  );
};

export const EmailsPageFeedback = ({ error, emails, filterType, searchTerm, onRetry, onClearSearch }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="m-4 rounded border border-border bg-background-secondary p-4">
        <h3 className="text-sm font-semibold text-status-error">{EMAIL_MESSAGES.LOAD_ERROR_TITLE}</h3>
        <p className="mt-1 text-sm text-text-secondary">{error}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
            {t('retry', 'Tekrar dene')}
          </Button>
        )}
      </div>
    );
  }

  if (!emails.length) {
    const description = searchTerm?.trim()
      ? t('no_emails_matching_search', 'Arama kriterlerinize uygun e-posta bulunamadı.')
      : filterType === EMAIL_FILTERS.ALL
        ? EMAIL_MESSAGES.NO_EMAILS_ALL
        : t('no_emails_in_folder', 'Bu klasörde henüz bir e-posta bulunmuyor.');

    return (
      <EmptyState
        icon={Inbox}
        title={EMAIL_MESSAGES.NO_EMAILS_TITLE}
        description={description}
        className="min-h-72 flex-1"
        action={
          searchTerm?.trim() && onClearSearch ? (
            <Button variant="secondary" size="sm" onClick={onClearSearch}>
              {t('clear_search', 'Aramayı temizle')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return null;
};
