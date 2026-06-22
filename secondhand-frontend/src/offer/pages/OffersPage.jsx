import PageContainer from '@/common/components/layout/PageContainer';
import { SkeletonList } from '@/common/components/ui/Skeleton';
import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../services/offerService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import OfferTrackingCard from '../components/OfferTrackingCard.jsx';
import { Handshake, LayoutGrid, Search, SlidersHorizontal } from 'lucide-react';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { OFFER_DEFAULTS, OFFER_MESSAGES, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';
const STATUS_FILTER = Object.freeze({
  ALL: 'ALL'
});
const SORT = Object.freeze({
  NEWEST: 'newest',
  EXPIRING: 'expiring'
});
const personLabel = (o, activeTab) => activeTab === OFFER_TABS.MADE ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim() : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim();
const OffersPage = () => {
  const {
    t
  } = useTranslation();
  const notification = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(OFFER_TABS.MADE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [made, setMade] = useState([]);
  const [received, setReceived] = useState([]);
  const [madePage, setMadePage] = useState(OFFER_DEFAULTS.PAGE);
  const [madeTotalPages, setMadeTotalPages] = useState(0);
  const [madeTotalElements, setMadeTotalElements] = useState(0);
  const [receivedPage, setReceivedPage] = useState(OFFER_DEFAULTS.PAGE);
  const [receivedTotalPages, setReceivedTotalPages] = useState(0);
  const [receivedTotalElements, setReceivedTotalElements] = useState(0);
  const size = OFFER_DEFAULTS.PAGE_SIZE;
  const [counterTarget, setCounterTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(SORT.NEWEST);
  const refresh = async (opts = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const nextMadePage = Number.isFinite(opts?.madePage) ? opts.madePage : madePage;
      const nextReceivedPage = Number.isFinite(opts?.receivedPage) ? opts.receivedPage : receivedPage;
      const [mRes, rRes] = await Promise.all([offerService.listMade(nextMadePage, size), offerService.listReceived(nextReceivedPage, size)]);
      const mItems = Array.isArray(mRes) ? mRes : Array.isArray(mRes?.content) ? mRes.content : [];
      const rItems = Array.isArray(rRes) ? rRes : Array.isArray(rRes?.content) ? rRes.content : [];
      setMade(mItems);
      setReceived(rItems);
      setMadePage(Number.isFinite(mRes?.number) ? mRes.number : nextMadePage);
      setMadeTotalPages(Number.isFinite(mRes?.totalPages) ? mRes.totalPages : 0);
      setMadeTotalElements(Number.isFinite(mRes?.totalElements) ? mRes.totalElements : mItems.length);
      setReceivedPage(Number.isFinite(rRes?.number) ? rRes.number : nextReceivedPage);
      setReceivedTotalPages(Number.isFinite(rRes?.totalPages) ? rRes.totalPages : 0);
      setReceivedTotalElements(Number.isFinite(rRes?.totalElements) ? rRes.totalElements : rItems.length);
    } catch (e) {
      setMade([]);
      setReceived([]);
      setMadeTotalPages(0);
      setMadeTotalElements(0);
      setReceivedTotalPages(0);
      setReceivedTotalElements(0);
      setError(getOfferErrorMessage(e, OFFER_MESSAGES.LOAD_FAILED));
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  const items = useMemo(() => {
    return activeTab === OFFER_TABS.RECEIVED ? received : made;
  }, [activeTab, made, received]);
  const totalPages = activeTab === OFFER_TABS.RECEIVED ? receivedTotalPages : madeTotalPages;
  const page = activeTab === OFFER_TABS.RECEIVED ? receivedPage : madePage;
  const totalElements = activeTab === OFFER_TABS.RECEIVED ? receivedTotalElements : madeTotalElements;
  const statusCounts = useMemo(() => {
    const c = {
      [STATUS_FILTER.ALL]: items.length
    };
    Object.values(OFFER_STATUSES).forEach(s => {
      c[s] = 0;
    });
    items.forEach(o => {
      if (c[o.status] !== undefined) c[o.status] += 1;
    });
    return c;
  }, [items]);
  const processedItems = useMemo(() => {
    let list = [...items];
    if (statusFilter !== STATUS_FILTER.ALL) {
      list = list.filter(o => o.status === statusFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(o => {
        const title = (o.listingTitle || '').toLowerCase();
        const person = personLabel(o, activeTab).toLowerCase();
        return title.includes(q) || person.includes(q);
      });
    }
    list.sort((a, b) => {
      if (sortBy === SORT.EXPIRING) {
        return new Date(a.expiresAt || 0) - new Date(b.expiresAt || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    return list;
  }, [items, statusFilter, searchQuery, sortBy, activeTab]);
  const handleAccept = async offerId => {
    try {
      await offerService.accept(offerId);
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.OFFER_ACCEPTED);
      await refresh();
    } catch (e) {
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, getOfferErrorMessage(e, OFFER_MESSAGES.ACCEPT_FAILED));
    }
  };
  const handleReject = async offerId => {
    try {
      await offerService.reject(offerId);
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.OFFER_REJECTED);
      await refresh();
    } catch (e) {
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, getOfferErrorMessage(e, OFFER_MESSAGES.REJECT_FAILED));
    }
  };
  const handleCheckout = offerId => {
    navigate(`${ROUTES.CHECKOUT}?offerId=${offerId}`);
  };
  const openListing = useCallback(listingId => {
    navigate(ROUTES.LISTING_DETAIL(listingId));
  }, [navigate]);
  const statusChips = useMemo(() => [{
    key: STATUS_FILTER.ALL,
    label: 'All'
  }, {
    key: OFFER_STATUSES.PENDING,
    label: 'Pending'
  }, {
    key: OFFER_STATUSES.ACCEPTED,
    label: 'Accepted'
  }, {
    key: OFFER_STATUSES.REJECTED,
    label: 'Rejected'
  }, {
    key: OFFER_STATUSES.EXPIRED,
    label: 'Expired'
  }, {
    key: OFFER_STATUSES.COMPLETED,
    label: 'Completed'
  }], []);
  const pageFrom = totalElements === 0 ? 0 : page * size + 1;
  const pageTo = Math.min(totalElements, page * size + items.length);
  return <div className="min-h-screen bg-background-secondary">
      <PageContainer className="py-6 sm:py-7">
        <div className="rounded-2xl border border-border-light bg-card-bg p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-xl bg-background-tertiary p-1">
              <button type="button" onClick={() => {
              setActiveTab(OFFER_TABS.MADE);
              setStatusFilter(STATUS_FILTER.ALL);
            }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === OFFER_TABS.MADE ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                <LayoutGrid className="h-4 w-4 opacity-70" />{t("made")}<span className="rounded-full bg-background-secondary px-2 py-0.5 text-xs font-bold text-text-secondary">
                  {madeTotalElements}
                </span>
              </button>
              <button type="button" onClick={() => {
              setActiveTab(OFFER_TABS.RECEIVED);
              setStatusFilter(STATUS_FILTER.ALL);
            }} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === OFFER_TABS.RECEIVED ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
                <Handshake className="h-4 w-4 opacity-70" />{t("received")}<span className="rounded-full bg-background-secondary px-2 py-0.5 text-xs font-bold text-text-secondary">
                  {receivedTotalElements}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("search_listing_or_name")} className="w-full rounded-lg border border-border-light bg-background-secondary py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden />
                <label className="sr-only" htmlFor="offer-sort">{t("sort")}</label>
                <select id="offer-sort" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full rounded-lg border border-border-light bg-background-primary px-3 py-2 text-sm font-medium text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-auto">
                  <option value={SORT.NEWEST}>{t("newest_first")}</option>
                  <option value={SORT.EXPIRING}>{t("expiring_soon")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border-light pt-4">
            {statusChips.map(({
            key,
            label
          }) => <button key={key} type="button" onClick={() => setStatusFilter(key)} className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-semibold transition ${statusFilter === key ? 'border-primary bg-primary-light text-primary' : 'border-border-light bg-card-bg text-text-secondary hover:border-border-dark hover:text-text-primary'}`}>
                {label}
                <span className={`ml-1.5 tabular-nums ${statusFilter === key ? 'text-primary/70' : 'text-text-muted'}`}>({statusCounts[key] ?? 0})</span>
              </button>)}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border-light bg-card-bg p-4 shadow-sm sm:p-6">
          {totalElements > 0 ? <p className="mb-4 text-xs text-text-muted">
            {pageFrom}–{pageTo} / {totalElements} teklif
          </p> : null}

          {isLoading ? <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonList key={`offer-skeleton-${i}`} />
              ))}
            </div> : error ? <div className="rounded-2xl border border-status-error-border bg-status-error-bg px-4 py-3">
              <p className="text-sm font-medium text-status-error-text">{error}</p>
            </div> : items.length === 0 ? <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-light bg-background-secondary px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-light">
                <Handshake className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">{t("no")}{activeTab === OFFER_TABS.MADE ? 'offers made' : 'offers received'}{t("yet")}</h2>
              <p className="mt-2 max-w-md text-sm text-text-muted">{t("when_you_send_or_receive_offers_they_wil")}</p>
            </div> : processedItems.length === 0 ? <div className="rounded-2xl border border-status-warning-border bg-status-warning-bg px-4 py-8 text-center">
              <p className="text-sm font-medium text-status-warning-text">{t("no_offers_match_your_filters")}</p>
              <button type="button" onClick={() => {
            setStatusFilter(STATUS_FILTER.ALL);
            setSearchQuery('');
          }} className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover">{t("clear_filters")}</button>
            </div> : <>
              <ul className="space-y-3">
                {processedItems.map(o => <li key={o.id}>
                    <OfferTrackingCard offer={o} activeTab={activeTab} currency={OFFER_DEFAULTS.FALLBACK_CURRENCY} onAccept={handleAccept} onReject={handleReject} onCounter={setCounterTarget} onCheckout={handleCheckout} onOpenListing={openListing} />
                  </li>)}
              </ul>

              <div className="mt-6 overflow-hidden rounded-xl border border-border-light bg-background-secondary">
                <Pagination page={page} totalPages={totalPages} onPageChange={p => {
              const next = Math.max(0, Math.min(p, Math.max(0, totalPages - 1)));
              if (activeTab === OFFER_TABS.MADE) {
                setMadePage(next);
                refresh({
                  madePage: next
                });
                return;
              }
              setReceivedPage(next);
              refresh({
                receivedPage: next
              });
            }} />
              </div>
            </>}
        </div>
      </PageContainer>

      <CounterOfferModal isOpen={!!counterTarget} onClose={() => setCounterTarget(null)} offer={counterTarget} onSuccess={refresh} />
    </div>;
};
export default OffersPage;