import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { CheckCircle2, EyeOff, PlayCircle, X } from 'lucide-react';
import Button from '../../common/components/ui/Button.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { parseError } from '../../common/errorHandler.js';
import { listingService } from '../services/listingService.js';
import { LISTING_STATUS } from '../types/index.js';

// Source statuses each batch action accepts; mirrors the Listing entity transitions on the backend
// (deactivate, reactivate, markAsSold). An action is offered only when every selected listing allows it,
// because the endpoint is all-or-nothing.
const ACTIONS = [
  { action: 'DEACTIVATE', from: [LISTING_STATUS.ACTIVE], icon: EyeOff, label: 'bulk_deactivate', done: 'bulk_deactivated' },
  { action: 'REACTIVATE', from: [LISTING_STATUS.INACTIVE], icon: PlayCircle, label: 'bulk_reactivate', done: 'bulk_reactivated' },
  { action: 'MARK_SOLD', from: [LISTING_STATUS.ACTIVE], icon: CheckCircle2, label: 'bulk_mark_sold', done: 'bulk_marked_sold' },
];

const LINK = 'rounded text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-50';

/**
 * Floating bar for My Listings select mode: the count, select this page / select all my listings / clear,
 * and the status changes that apply to every selected listing. `selectedItems` maps id -> status and may
 * hold listings from other pages.
 */
const MyListingsBulkBar = ({
  selectedItems,
  visibleListings,
  totalCount,
  isFiltered,
  selectingAll,
  onSelectPage,
  onSelectAll,
  onClear,
  onClose,
  onDone
}) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const [pending, setPending] = useState(null);

  const count = selectedItems.size;
  const statuses = useMemo(() => new Set(selectedItems.values()), [selectedItems]);
  const pageSelected = visibleListings.length > 0 && visibleListings.every((listing) => selectedItems.has(listing.id));
  const allSelected = totalCount > 0 && count >= totalCount;
  const available = useMemo(
    () => ACTIONS.filter(({ from }) => count > 0 && [...statuses].every((status) => from.includes(status))),
    [count, statuses],
  );

  const run = async ({ action, done }) => {
    setPending(action);
    try {
      await listingService.updateBatchStatus([...selectedItems.keys()], action);
      notification.showSuccess(t('success'), t(done, { count }));
      onDone();
    } catch (err) {
      const parsed = parseError(err);
      notification.showError(t('bulk_status_failed'), parsed.message, {
        errorCode: parsed.errorCode,
        validationErrors: parsed.validationErrors,
        autoClose: false,
      });
    } finally {
      setPending(null);
    }
  };

  const handle = (item) => {
    if (item.action !== 'MARK_SOLD') {
      run(item);
      return;
    }
    notification.showConfirmation(
      t('bulk_mark_sold_confirm_title', { count }),
      t('bulk_mark_sold_confirm_body'),
      () => run(item),
      () => {},
    );
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <div
          role="region"
          aria-label={t('bulk_actions')}
          className="pointer-events-auto rounded border border-border bg-background-primary shadow-md"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-light px-4 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-sm font-semibold tabular-nums text-text-primary" aria-live="polite">
                {allSelected ? t('bulk_all_selected', { count }) : t('bulk_selected_count', { count })}
              </span>
              {!pageSelected && !allSelected && (
                <button type="button" onClick={onSelectPage} disabled={visibleListings.length === 0} className={LINK}>
                  {t('bulk_select_all_page', { count: visibleListings.length })}
                </button>
              )}
              {!allSelected && (
                <button type="button" onClick={onSelectAll} disabled={selectingAll || totalCount === 0} className={LINK}>
                  {selectingAll
                    ? t('bulk_selecting_all')
                    : t(isFiltered ? 'bulk_select_all_matching' : 'bulk_select_all_mine', { count: totalCount })}
                </button>
              )}
              {count > 0 && (
                <button type="button" onClick={onClear} className={LINK}>
                  {t('bulk_clear_selection')}
                </button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-9 !px-0" aria-label={t('bulk_exit')}>
              <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            {ACTIONS.map((item) => {
              const Icon = item.icon;
              const enabled = available.includes(item);
              return (
                <Button
                  key={item.action}
                  variant="secondary"
                  size="sm"
                  disabled={!enabled || pending !== null}
                  onClick={() => handle(item)}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  {pending === item.action ? t('bulk_applying') : t(item.label)}
                </Button>
              );
            })}
            {count > 0 && available.length === 0 ? (
              <p className="w-full text-sm text-text-tertiary">{t('bulk_mixed_status_hint')}</p>
            ) : null}
            {count === 0 ? <p className="w-full text-sm text-text-tertiary">{t('bulk_pick_hint')}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyListingsBulkBar;
