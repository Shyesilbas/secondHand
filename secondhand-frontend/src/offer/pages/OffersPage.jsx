import { useTranslation } from 'react-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Handshake, Search } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import { EmptyState, PageHeader, Skeleton } from '../../common/components/ui/index.js';
import ErrorState from '../../common/components/ui/ErrorState.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import Tabs from '../../common/components/ui/Tabs.jsx';
import { inputNormal } from '../../common/components/forms/inputStyles.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { offerService } from '../services/offerService.js';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import OfferTrackingCard from '../components/OfferTrackingCard.jsx';
import { OFFER_STATUS_PRESENTATION, offerCounterpart } from '../utils/offerPresentation.js';
import { OFFER_DEFAULTS, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';

const ALL = 'ALL';
const SORT = Object.freeze({ NEWEST: 'newest', EXPIRING: 'expiring' });
const STATUS_FILTERS = [ALL, OFFER_STATUSES.PENDING, OFFER_STATUSES.ACCEPTED, OFFER_STATUSES.REJECTED, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.COMPLETED];

const RowsSkeleton = () => (
  <ul className="divide-y divide-border-light" aria-hidden>
    {Array.from({ length: 4 }).map((_, i) => (
      <li key={i} className="flex items-center gap-4 px-5 py-4">
        <Skeleton className="h-16 w-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="hidden h-5 w-24 sm:block" />
      </li>
    ))}
  </ul>
);

const OffersPage = () => {
  const { t } = useTranslation();
  const notification = useNotification();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(OFFER_TABS.MADE);
  const [pages, setPages] = useState({ [OFFER_TABS.MADE]: OFFER_DEFAULTS.PAGE, [OFFER_TABS.RECEIVED]: OFFER_DEFAULTS.PAGE });
  const [counterTarget, setCounterTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(SORT.NEWEST);
  const size = OFFER_DEFAULTS.PAGE_SIZE;

  // Both lists load so each tab can show its total.
  const madeQuery = useQuery({
    queryKey: ['offers', 'made', pages[OFFER_TABS.MADE], size],
    queryFn: () => offerService.listMade(pages[OFFER_TABS.MADE], size),
  });
  const receivedQuery = useQuery({
    queryKey: ['offers', 'received', pages[OFFER_TABS.RECEIVED], size],
    queryFn: () => offerService.listReceived(pages[OFFER_TABS.RECEIVED], size),
  });
  const active = activeTab === OFFER_TABS.MADE ? madeQuery : receivedQuery;
  const items = useMemo(() => active.data?.content || [], [active.data]);
  const totalPages = active.data?.totalPages || 0;
  const totalElements = active.data?.totalElements || 0;
  const page = pages[activeTab];

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
    const list = items
      .filter((o) => statusFilter === ALL || o.status === statusFilter)
      .filter((o) => !q
        || (o.listingTitle || '').toLocaleLowerCase('tr-TR').includes(q)
        || offerCounterpart(o, activeTab).toLocaleLowerCase('tr-TR').includes(q));
    return list.sort((a, b) => (sortBy === SORT.EXPIRING
      ? new Date(a.expiresAt || 0) - new Date(b.expiresAt || 0)
      : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  }, [items, statusFilter, searchQuery, sortBy, activeTab]);

  const onMutationDone = (messageKey, fallback) => ({
    onSuccess: () => {
      notification?.showSuccess(t('success'), t(messageKey, fallback));
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
  const acceptMutation = useMutation({
    mutationFn: (offerId) => offerService.accept(offerId),
    ...onMutationDone('offer_accepted_toast', 'Teklif kabul edildi.'),
    onError: (e) => notification?.showError(t('error'), getOfferErrorMessage(e, t('offer_accept_failed', 'Teklif kabul edilemedi.'))),
  });
  const rejectMutation = useMutation({
    mutationFn: (offerId) => offerService.reject(offerId),
    ...onMutationDone('offer_rejected_toast', 'Teklif reddedildi.'),
    onError: (e) => notification?.showError(t('error'), getOfferErrorMessage(e, t('offer_reject_failed', 'Teklif reddedilemedi.'))),
  });
  const busy = acceptMutation.isPending || rejectMutation.isPending;

  const openListing = useCallback((listingId) => navigate(ROUTES.LISTING_DETAIL(listingId)), [navigate]);
  const clearFilters = () => {
    setStatusFilter(ALL);
    setSearchQuery('');
  };
  const changeTab = (key) => {
    setActiveTab(key);
    clearFilters();
  };

  const pageFrom = totalElements === 0 ? 0 : page * size + 1;
  const pageTo = Math.min(totalElements, page * size + items.length);
  const error = active.error ? getOfferErrorMessage(active.error, t('offers_load_failed', 'Teklifler yüklenemedi.')) : null;

  let body;
  if (active.isLoading) {
    body = <RowsSkeleton />;
  } else if (error) {
    body = <ErrorState bordered={false} title={t('offers_load_failed', 'Teklifler yüklenemedi.')} description={error} onRetry={() => active.refetch()} />;
  } else if (items.length === 0) {
    body = (
      <EmptyState
        icon={Handshake}
        className="border-0"
        title={t(activeTab === OFFER_TABS.MADE ? 'offers_empty_made' : 'offers_empty_received')}
        description={t('when_you_send_or_receive_offers_they_wil')}
        primaryAction={activeTab === OFFER_TABS.MADE ? { label: t('browse_all_listings'), onClick: () => navigate(ROUTES.LISTINGS) } : undefined}
      />
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        className="border-0"
        title={t('no_offers_match_your_filters')}
        description={t('offers_filter_page_hint', 'Filtreler bu sayfadaki teklifleri daraltır.')}
        primaryAction={{ label: t('clear_filters'), onClick: clearFilters }}
      />
    );
  } else {
    body = (
      <ul className="divide-y divide-border-light">
        {visible.map((o) => (
          <OfferTrackingCard
            key={o.id}
            offer={o}
            activeTab={activeTab}
            currency={OFFER_DEFAULTS.FALLBACK_CURRENCY}
            busy={busy}
            onAccept={(id) => acceptMutation.mutate(id)}
            onReject={(id) => rejectMutation.mutate(id)}
            onCounter={setCounterTarget}
            onCheckout={(id) => navigate(`${ROUTES.CHECKOUT}?offerId=${id}`)}
            onOpenListing={openListing}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="py-8">
        <PageHeader title={t('offers', 'Teklifler')} subtitle={t('offers_page_subtitle', 'Gönderdiğin ve aldığın teklifleri buradan takip et.')} />

        <div className="mt-6">
          <Tabs
            ariaLabel={t('offers', 'Teklifler')}
            activeKey={activeTab}
            onChange={changeTab}
            items={[
              { key: OFFER_TABS.MADE, label: t('offers_tab_made', 'Gönderdiğim'), count: madeQuery.data?.totalElements },
              { key: OFFER_TABS.RECEIVED, label: t('offers_tab_received', 'Aldığım'), count: receivedQuery.data?.totalElements },
            ]}
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="radiogroup" aria-label={t('status', 'Durum')} className="inline-flex max-w-full overflow-x-auto rounded border border-border bg-background-secondary p-0.5">
            {STATUS_FILTERS.map((key) => {
              const selected = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setStatusFilter(key)}
                  className={`shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                    selected ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {key === ALL ? t('all', 'Tümü') : t(OFFER_STATUS_PRESENTATION[key].labelKey)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_listing_or_name')}
                aria-label={t('search_listing_or_name')}
                className={`${inputNormal} pl-9`}
              />
            </div>
            <label className="sr-only" htmlFor="offer-sort">{t('sort')}</label>
            <select id="offer-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputNormal} sm:w-auto`}>
              <option value={SORT.NEWEST}>{t('newest_first')}</option>
              <option value={SORT.EXPIRING}>{t('expiring_soon')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded border border-border-light bg-background-primary shadow-sm">
          {body}
        </div>

        {totalElements > 0 && !active.isLoading && !error && (
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm tabular-nums text-text-tertiary">
              {t('offers_range', { defaultValue: '{{from}}–{{to}} / {{total}} teklif', from: pageFrom, to: pageTo, total: totalElements })}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPages((prev) => ({ ...prev, [activeTab]: Math.max(0, Math.min(p, totalPages - 1)) }))}
            />
          </div>
        )}
      </PageContainer>

      <CounterOfferModal isOpen={!!counterTarget} onClose={() => setCounterTarget(null)} offer={counterTarget} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['offers'] })} />
    </div>
  );
};

export default OffersPage;
