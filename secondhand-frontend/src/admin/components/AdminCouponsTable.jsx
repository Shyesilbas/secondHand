import { useTranslation } from 'react-i18next';
import { Pencil, Search, Tag } from 'lucide-react';
import { formatDateTime } from '../../common/formatters.js';
import { Badge, Button, Card, EmptyState, SkeletonList } from '../../common/components/ui/index.js';
import { audienceSummary } from '../utils/couponFormUtils.js';

const AdminCouponsTable = ({
  isLoading,
  sorted,
  filteredSorted,
  codeFilter,
  normalizedCodeQuery,
  onCodeFilterChange,
  onClearFilter,
  onOpenCreate,
  onOpenEdit
}) => {
  const { t } = useTranslation();

  return (
    <Card padding="none" border="light" shadow={false} className="overflow-hidden">
      {isLoading ? (
        <div className="p-4" aria-busy="true">
          <SkeletonList />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Tag}
          title={t('no_coupons_yet_create_one_with_new_coupo')}
          action={
            <Button size="sm" onClick={onOpenCreate}>
              {t('new_coupon')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 border-b border-border-light bg-background-secondary px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block min-w-0 flex-1 sm:max-w-sm">
              <span className="sr-only">{t('filter_by_coupon_code')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden strokeWidth={1.5} />
              <input
                type="search"
                value={codeFilter}
                onChange={(e) => onCodeFilterChange(e.target.value)}
                placeholder={t('filter_by_code')}
                autoComplete="off"
                className="w-full rounded border border-border-light bg-background-primary py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              />
            </label>
            {normalizedCodeQuery ? (
              <span className="shrink-0 text-xs font-medium tabular-nums text-text-muted">
                {filteredSorted.length} {t('of')} {sorted.length}
              </span>
            ) : null}
          </div>

          {filteredSorted.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t('no_coupon_code_matches')}
              description={codeFilter.trim()}
              action={
                <Button variant="secondary" size="sm" onClick={onClearFilter}>
                  {t('clear_search')}
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border-light bg-background-secondary text-text-secondary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('code')}</th>
                    <th className="px-4 py-3 font-semibold">{t('title')}</th>
                    <th className="px-4 py-3 font-semibold">{t('discount')}</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">{t('global_left')}</th>
                    <th className="px-4 py-3 font-semibold">{t('audience')}</th>
                    <th className="px-4 py-3 font-semibold">{t('period')}</th>
                    <th className="px-4 py-3 font-semibold">{t('active')}</th>
                    <th className="w-24 px-4 py-3 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {filteredSorted.map((row) => {
                    const { label, hint } = audienceSummary(row, t);
                    const audienceType = row.audience || (row.forAllUsers !== false ? 'ALL_USERS' : 'USER_ID_LIST');

                    return (
                      <tr key={row.id} className="hover:bg-background-secondary">
                        <td className="px-4 py-3 font-medium text-text-primary">{row.code}</td>
                        <td className="max-w-48 px-4 py-3">
                          <div className="truncate text-text-primary">{row.title}</div>
                          {row.description && (
                            <div className="truncate text-xs text-text-muted">{row.description}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-text-primary">
                          <span className="text-xs text-text-muted">
                            {String(row.discountKind || '').replace(/_/g, ' ')}
                          </span>
                          <div>{row.value != null ? row.value : '—'}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-text-primary">
                          {row.usageLimitGlobal != null ? (
                            <>
                              <span className="font-semibold text-text-primary">
                                {row.usageRemainingGlobal ?? '—'}
                              </span>
                              <span className="text-text-muted"> / {row.usageLimitGlobal}</span>
                            </>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-primary">
                          <div className="text-sm">
                            <span
                              className={
                                audienceType === 'NEVER_ORDERED_FIRST_ORDER'
                                  ? 'font-medium text-primary'
                                  : audienceType === 'ALL_USERS'
                                    ? 'font-medium text-status-success-text'
                                    : 'text-text-primary'
                              }
                            >
                              {label}
                            </span>
                            {hint ? <div className="mt-0.5 text-xs text-text-muted">{hint}</div> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-text-secondary">
                          <div>{formatDateTime(row.startsAt)}</div>
                          <div>{formatDateTime(row.endsAt)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={row.active ? 'success' : 'neutral'} dot size="sm">
                            {row.active ? 'On' : 'Off'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(row)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {t('edit')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default AdminCouponsTable;
