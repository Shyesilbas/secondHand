import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CheckCheck,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { Button, Tabs } from '../../common/components/ui/index.js';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { EMAIL_FOLDER_ITEMS } from '../emailConstants.js';

const EmailListToolbar = ({
  embedded,
  onBack,
  filterType,
  onSelectFolder,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onRefresh,
  isFetching,
  onMarkAllRead,
  disableMarkAllRead,
  isMarkingAllRead,
  onDeleteAll,
  disableDeleteAll
}) => {
  const { t } = useTranslation();
  const searchId = useId();

  const tabItems = EMAIL_FOLDER_ITEMS.map((item) => ({
    key: item.id,
    label: item.label
  }));

  return (
    <header className="shrink-0 border-b border-border-light bg-background-primary">
      <h1 className="sr-only">{t('mailbox', 'Posta kutusu')}</h1>
      <div className="flex flex-wrap items-center justify-between gap-x-4 px-4 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {!embedded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              aria-label={t('back', 'Geri')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
          )}
          <Tabs
            items={tabItems}
            activeKey={filterType}
            onChange={onSelectFolder}
            ariaLabel={t('mail_folders', 'E-posta kategorileri')}
            variant="underline"
            borderBottom={false}
            className="min-w-0"
            tabClassName="py-3"
          />
        </div>

        <div className="flex w-full shrink-0 items-center gap-1.5 pb-2.5 pt-1 sm:w-auto sm:py-2">
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-initial">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={t('search_mail', 'E-postalarda ara')}
              placeholder={t('search_mail', 'E-postalarda ara...')}
              className={`${inputNormal} h-9 bg-background-secondary pl-9 pr-8 focus:bg-background-primary`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors duration-150 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                aria-label={t('clear_search', 'Aramayı temizle')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isFetching}
            title={t('refresh', 'Yenile')}
            aria-label={t('refresh', 'Yenile')}
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin motion-reduce:animate-none' : ''}`}
              strokeWidth={1.5}
              aria-hidden
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMarkAllRead}
            disabled={disableMarkAllRead}
            title={t('mark_all_read', 'Tümünü okundu işaretle')}
            aria-label={t('mark_all_read', 'Tümünü okundu işaretle')}
          >
            <CheckCheck
              className={`h-4 w-4 ${isMarkingAllRead ? 'animate-pulse motion-reduce:animate-none' : ''}`}
              strokeWidth={1.5}
              aria-hidden
            />
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={onDeleteAll}
            disabled={disableDeleteAll}
            title={t('delete_all', 'Tümünü sil')}
            aria-label={t('delete_all', 'Tümünü sil')}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EmailListToolbar;
