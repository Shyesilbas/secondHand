import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { offerService } from '../services/offerService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import CounterOfferModal from '../components/CounterOfferModal.jsx';
import OfferTrackingCard from '../components/OfferTrackingCard.jsx';
import {
  Handshake,
  LayoutGrid,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { OFFER_DEFAULTS, OFFER_MESSAGES, OFFER_STATUSES, OFFER_TABS } from '../offerConstants.js';
import { getOfferErrorMessage } from '../utils/offerError.js';

const STATUS_FILTER = Object.freeze({
  ALL: 'ALL',
});

const SORT = Object.freeze({
  NEWEST: 'newest',
  EXPIRING: 'expiring',
});

const personLabel = (o, activeTab) =>
  activeTab === OFFER_TABS.MADE
    ? `${o.sellerName || ''} ${o.sellerSurname || ''}`.trim()
    : `${o.buyerName || ''} ${o.buyerSurname || ''}`.trim();

const OffersPage = () => {
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

      const [mRes, rRes] = await Promise.all([
        offerService.listMade(nextMadePage, size),
        offerService.listReceived(nextReceivedPage, size),
      ]);

      const mItems = Array.isArray(mRes) ? mRes : (Array.isArray(mRes?.content) ? mRes.content : []);
      const rItems = Array.isArray(rRes) ? rRes : (Array.isArray(rRes?.content) ? rRes.content : []);

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
    const c = { [STATUS_FILTER.ALL]: items.length };
    Object.values(OFFER_STATUSES).forEach((s) => {
      c[s] = 0;
    });
    items.forEach((o) => {
      if (c[o.status] !== undefined) c[o.status] += 1;
    });
    return c;
  }, [items]);

  const processedItems = useMemo(() => {
    let list = [...items];
    if (statusFilter !== STATUS_FILTER.ALL) {
      list = list.filter((o) => o.status === statusFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
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

  const handleAccept = async (offerId) => {
    try {
      await offerService.accept(offerId);
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.OFFER_ACCEPTED);
      await refresh();
    } catch (e) {
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, getOfferErrorMessage(e, OFFER_MESSAGES.ACCEPT_FAILED));
    }
  };

  const handleReject = async (offerId) => {
    try {
      await offerService.reject(offerId);
      notification?.showSuccess(OFFER_MESSAGES.SUCCESS_TITLE, OFFER_MESSAGES.OFFER_REJECTED);
      await refresh();
    } catch (e) {
      notification?.showError(OFFER_MESSAGES.ERROR_TITLE, getOfferErrorMessage(e, OFFER_MESSAGES.REJECT_FAILED));
    }
  };

  const handleCheckout = (offerId) => {
    navigate(`${ROUTES.CHECKOUT}?offerId=${offerId}`);
  };

  const openListing = useCallback(
    (listingId) => {
      navigate(ROUTES.LISTING_DETAIL(listingId));
    },
    [navigate]
  );

  const statusChips = useMemo(
    () => [
      { key: STATUS_FILTER.ALL, label: 'All' },
      { key: OFFER_STATUSES.PENDING, label: 'Pending' },
      { key: OFFER_STATUSES.ACCEPTED, label: 'Accepted' },
      { key: OFFER_STATUSES.REJECTED, label: 'Rejected' },
      { key: OFFER_STATUSES.EXPIRED, label: 'Expired' },
      { key: OFFER_STATUSES.COMPLETED, label: 'Completed' },
    ],
    []
  );

  const pageFrom = totalElements === 0 ? 0 : page * size + 1;
  const pageTo = Math.min(totalElements, page * size + items.length);

  return (
    <div className="min-h-screen bg-slate-50/90">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-slate-900/5 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab(OFFER_TABS.MADE);
                  setStatusFilter(STATUS_FILTER.ALL);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === OFFER_TABS.MADE ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-4 w-4 opacity-70" />
                Made
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {madeTotalElements}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab(OFFER_TABS.RECEIVED);
                  setStatusFilter(STATUS_FILTER.ALL);
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === OFFER_TABS.RECEIVED ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Handshake className="h-4 w-4 opacity-70" />
                Received
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600">
                  {receivedTotalElements}
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-[200px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listing or name…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
                <label className="sr-only" htmlFor="offer-sort">
                  Sort
                </label>
                <select
                  id="offer-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-auto"
                >
                  <option value={SORT.NEWEST}>Newest first</option>
                  <option value={SORT.EXPIRING}>Expiring soon</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {statusChips.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === key
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
                <span className="ml-1.5 tabular-nums text-slate-400">({statusCounts[key] ?? 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-6">
          {totalElements > 0 ? (
            <p className="mb-4 text-xs text-slate-500">
              Showing {pageFrom}–{pageTo} of {totalElements} offers
            </p>
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15">
                <Handshake className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                No {activeTab === OFFER_TABS.MADE ? 'offers made' : 'offers received'} yet
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                When you send or receive offers, they will appear here with status, timeline, and quick actions.
              </p>
            </div>
          ) : processedItems.length === 0 ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-amber-900">No offers match your filters.</p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(STATUS_FILTER.ALL);
                  setSearchQuery('');
                }}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {processedItems.map((o) => (
                  <li key={o.id}>
                    <OfferTrackingCard
                      offer={o}
                      activeTab={activeTab}
                      currency={OFFER_DEFAULTS.FALLBACK_CURRENCY}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onCounter={setCounterTarget}
                      onCheckout={handleCheckout}
                      onOpenListing={openListing}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    const next = Math.max(0, Math.min(p, Math.max(0, totalPages - 1)));
                    if (activeTab === OFFER_TABS.MADE) {
                      setMadePage(next);
                      refresh({ madePage: next });
                      return;
                    }
                    setReceivedPage(next);
                    refresh({ receivedPage: next });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <CounterOfferModal
        isOpen={!!counterTarget}
        onClose={() => setCounterTarget(null)}
        offer={counterTarget}
        onSuccess={refresh}
      />
    </div>
  );
};

export default OffersPage;
