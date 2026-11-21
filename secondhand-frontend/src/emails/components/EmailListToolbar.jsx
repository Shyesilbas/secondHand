import { useTranslation } from 'react-i18next';
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';

const EmailListToolbar = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onRefresh,
  isFetching,
  onMarkAllRead,
  disableMarkAllRead,
  isMarkingAllRead,
  onDeleteAll,
  disableDeleteAll,
  selectedFolderLabel,
  pageInfo,
  onPrevPage,
  onNextPage
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-border-light bg-background-primary px-3">
        <div className="relative min-w-0 flex-1">
          <input
            id="mail-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search_mail', 'E-postalarda ara...')}
            className="h-8 w-full rounded border border-border bg-background-secondary pl-8 pr-7 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:border-border-focus focus:bg-background-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
          />
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
            strokeWidth={1.5}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted hover:text-text-primary"
              aria-label={t('clear_search', 'Aramayı temizle')}
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-40"
          title={t('refresh', 'Yenile')}
          aria-label={t('refresh', 'Yenile')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={disableMarkAllRead}
          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary disabled:opacity-30"
          title={t('mark_all_read', 'Tümünü Okundu İşaretle')}
          aria-label={t('mark_all_read', 'Tümünü Okundu İşaretle')}
        >
          <CheckCheck className={`h-3.5 w-3.5 ${isMarkingAllRead ? 'animate-pulse' : ''}`} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onDeleteAll}
          disabled={disableDeleteAll}
          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-background-secondary hover:text-status-error disabled:opacity-30"
          title={t('delete_all', 'Tümünü Sil')}
          aria-label={t('delete_all', 'Tümünü Sil')}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border-light bg-background-secondary px-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="truncate text-sm font-medium text-text-secondary">
            {selectedFolderLabel}
          </h2>
          <span className="text-xs text-text-muted tabular-nums">
            ({pageInfo.totalElements})
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-xs">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={pageInfo.page === 0}
            className="rounded p-1 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary disabled:opacity-30"
            aria-label={t('previous_page', 'Önceki Sayfa')}
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <span className="px-1 text-xs tabular-nums text-text-muted">
            {pageInfo.page + 1}/{Math.max(pageInfo.totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={pageInfo.page + 1 >= pageInfo.totalPages}
            className="rounded p-1 text-text-tertiary transition-colors hover:bg-background-tertiary hover:text-text-primary disabled:opacity-30"
            aria-label={t('next_page', 'Sonraki Sayfa')}
          >
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  );
};

export default EmailListToolbar;
