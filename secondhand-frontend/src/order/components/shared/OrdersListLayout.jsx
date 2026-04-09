import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, resolveEnumLabel } from '../../../common/formatters.js';
import { ROUTES } from '../../../common/constants/routes.js';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import { getStatusColor } from '../../orderConstants.js';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import {
  ORDER_DEFAULTS,
  ORDER_STATUSES,
  ORDER_STATUS_TAB_FILTER,
  ORDER_VIEW_MODES,
} from '../../constants/orderUiConstants.js';
import {
  BarChart3,
  CheckCircle,
  Package,
  Pencil,
  Receipt,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  X,
  Info,
} from 'lucide-react';

const mergeUiCopy = (partial) => ({ ...DEFAULT_UI_COPY, ...partial });

const DEFAULT_UI_COPY = {
  locale: 'en-GB',
  searchPlaceholder: 'Search by order number…',
  searchSubmit: 'Search',
  clear: 'Clear',
  openFilters: 'Filters',
  pageSizeHint: 'Per page',
  tabAll: 'All',
  tabPreparing: 'Preparing',
  tabShipped: 'Shipped',
  tabDelivered: 'Delivered',
  tabCancelled: 'Cancelled',
  totalLabel: 'Total',
  orderLabel: 'Order',
  orderNumberPrefix: '#',
  trackingLabel: 'Tracking no.',
  etaLabel: 'Est. delivery',
  trackingEmpty: '—',
  detail: 'Order details',
  trackShipment: 'Track shipment',
  reorder: 'Buy again',
  confirmReceipt: 'Confirm delivery',
  qtyLabel: 'Qty',
  itemsSummary: (n) => (n === 1 ? '1 item' : `${n} items`),
  nameBannerTitle: 'Name your orders',
  nameBannerBody: 'Use the pencil icon to give an order a name you will remember.',
  nameBannerOk: 'Got it',
  escrowLabel: 'Escrow',
  escrowHintPending: 'Released to your wallet when orders complete',
  escrowHintEmpty: 'No pending escrow',
  escrowByOrder: 'By order',
  paginationShowing: (from, to, total) => `Showing ${from}–${to} of ${total}`,
  paginationPage: (p, t) => `Page ${p} of ${t}`,
  paginationPrev: 'Previous',
  paginationNext: 'Next',
  paginationPerPage: (n) => `${n} / page`,
  emptyShopping: 'Start shopping',
  startShopping: 'Start shopping',
};

const formatLongDate = (iso, locale) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale || 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const orderStatusBadgeClass = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === ORDER_STATUSES.COMPLETED) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === ORDER_STATUSES.DELIVERED) return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === ORDER_STATUSES.SHIPPED) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  if (s === ORDER_STATUSES.PROCESSING) return 'bg-amber-50 text-amber-900 border-amber-200';
  if (s === ORDER_STATUSES.CONFIRMED) return 'bg-green-50 text-green-800 border-green-200';
  if (s === ORDER_STATUSES.PENDING) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (s === ORDER_STATUSES.CANCELLED || s === ORDER_STATUSES.REFUNDED) return 'bg-rose-50 text-rose-800 border-rose-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

const Header = React.memo(
  ({ title, subtitle, showIndicator, onAnalytics, analyticsLabel = 'Analytics', onRefresh, loading, sticky, uiCopy: _u }) => {
    const headerContent = (
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {showIndicator ? <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" /> : null}
          </div>
          {subtitle ? <p className="text-sm text-slate-500 mt-1.5 max-w-xl leading-relaxed">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
          {onAnalytics ? (
            <button
              type="button"
              onClick={onAnalytics}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {analyticsLabel}
            </button>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    );

    if (!sticky) {
      return <div className="mb-8">{headerContent}</div>;
    }

    return (
      <div className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{headerContent}</div>
      </div>
    );
  }
);

const StatusTabs = React.memo(({ statusFilter, setStatusFilter, uiCopy }) => {
  const tabs = useMemo(
    () => [
      { value: ORDER_STATUS_TAB_FILTER.ALL, label: uiCopy.tabAll },
      { value: ORDER_STATUS_TAB_FILTER.PREPARING, label: uiCopy.tabPreparing },
      { value: ORDER_STATUS_TAB_FILTER.SHIPPED, label: uiCopy.tabShipped },
      { value: ORDER_STATUS_TAB_FILTER.DELIVERED_GROUP, label: uiCopy.tabDelivered },
      { value: ORDER_STATUS_TAB_FILTER.CANCELLED, label: uiCopy.tabCancelled },
    ],
    [uiCopy]
  );

  return (
    <div className="rounded-2xl bg-slate-100/90 p-1 flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const active = (statusFilter || '') === (tab.value || '');
        return (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => setStatusFilter?.(tab.value)}
            className={`flex-1 min-w-[5.5rem] sm:flex-none px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              active
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});

const SearchToolbar = React.memo(({ search, onSearch, onClearSearch, filtersOpen, setFiltersOpen, uiCopy, pagination, onPageSizeChange }) => {
  const { searchTerm, setSearchTerm, searchLoading, searchError, isSearchMode } = search;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1 flex gap-2 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={uiCopy.searchPlaceholder}
              disabled={searchLoading}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !searchTerm.trim()}
            className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {searchLoading ? '…' : uiCopy.searchSubmit}
          </button>
          {isSearchMode ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 shrink-0"
            >
              {uiCopy.clear}
            </button>
          ) : null}
        </form>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors shrink-0 ${
            filtersOpen ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {uiCopy.openFilters}
        </button>
      </div>
      {filtersOpen && !isSearchMode ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-xs font-medium text-slate-500">{uiCopy.pageSizeHint}</span>
          <select
            className="px-3 py-2 text-sm font-medium text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            value={pagination?.size ?? ORDER_DEFAULTS.INITIAL_PAGE_SIZE}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {uiCopy.paginationPerPage(option)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {searchError ? (
        <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-700">{searchError}</div>
      ) : null}
    </div>
  );
});

const OrderItemSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm animate-pulse mb-4">
    <div className="flex justify-between gap-4 mb-4">
      <div className="space-y-2 flex-1">
        <div className="h-5 w-48 bg-slate-200 rounded-lg" />
        <div className="h-4 w-32 bg-slate-100 rounded" />
      </div>
      <div className="h-8 w-24 bg-slate-100 rounded-lg" />
    </div>
    <div className="h-16 bg-slate-50 rounded-xl mb-4" />
    <div className="flex gap-2">
      <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
      <div className="h-10 flex-1 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

const Pagination = React.memo(({ pagination, isSearchMode, loading, onPageChange, onPageSizeChange, uiCopy }) => {
  if (isSearchMode || loading) return null;
  if (!pagination || pagination.totalPages === 0) return null;

  const currentPage = pagination.number || 0;
  const totalPages = pagination.totalPages || 1;
  const pageSize = pagination.size || ORDER_DEFAULTS.INITIAL_PAGE_SIZE;
  const totalElements = pagination.totalElements || 0;
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mt-10 pt-6 border-t border-slate-200">
      <p className="text-sm text-slate-500 tabular-nums">{uiCopy.paginationShowing(startItem, endItem, totalElements)}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || totalPages <= 1}
          className="px-3 py-2 text-sm font-medium text-slate-700 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
        >
          {uiCopy.paginationPrev}
        </button>
        <span className="text-sm font-medium text-slate-600 tabular-nums px-2">
          {uiCopy.paginationPage(currentPage + 1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || totalPages <= 1}
          className="px-3 py-2 text-sm font-medium text-slate-700 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
        >
          {uiCopy.paginationNext}
        </button>
        <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" />
        <select
          className="px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {uiCopy.paginationPerPage(option)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

const OrderLine = ({ item, currency, uiCopy }) => {
  const listing = item?.listing;
  const title = listing?.title || '—';
  const qty = item?.quantity ?? 1;
  const lineCurrency = item?.currency || currency;

  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      {listing?.imageUrl ? (
        <img src={listing.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-snug">{title}</p>
        <p className="text-xs text-slate-500 mt-1">
          {uiCopy.qtyLabel}: {qty}
          {item?.notes ? ` · ${item.notes}` : ''}
        </p>
      </div>
      <div className="text-sm font-bold text-slate-900 tabular-nums shrink-0">{formatCurrency(item?.totalPrice, lineCurrency)}</div>
    </div>
  );
};

const UnifiedOrderItem = React.memo(
  ({
    viewMode,
    order,
    enums,
    onOpenOrder,
    onOpenReceipt,
    onCompleteOrder,
    onReorder,
    editingOrderId,
    editingOrderName,
    setEditingOrderName,
    onStartEditName,
    onCancelEditName,
    onSaveOrderName,
    uiCopy,
  }) => {
    const items = order.orderItems || [];
    const isBuyer = viewMode === ORDER_VIEW_MODES.BUYER;
    const isCompleted = order.status === ORDER_STATUSES.COMPLETED;
    const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
    const isShipped = order.status === ORDER_STATUSES.SHIPPED;

    const sellerTotalAmount =
      viewMode === ORDER_VIEW_MODES.SELLER
        ? items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
        : null;

    const displayTotal =
      viewMode === ORDER_VIEW_MODES.SELLER ? sellerTotalAmount : parseFloat(order.totalAmount);
    const currency = order.currency || 'TRY';

    const statusLabel = resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status;
    const trackingNo = order.shipping?.trackingNumber || order.trackingNumber || null;
    const etaText = (() => {
      if (order.shipping?.deliveredAt) return formatLongDate(order.shipping.deliveredAt, uiCopy.locale);
      if (order.shipping?.inTransitAt) return formatLongDate(order.shipping.inTransitAt, uiCopy.locale);
      return uiCopy.trackingEmpty;
    })();

    const firstListingId = items[0]?.listing?.id;

    return (
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              {isBuyer && editingOrderId === order.id ? (
                <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingOrderName}
                    onChange={(e) => setEditingOrderName(e.target.value)}
                    className="flex-1 min-w-[8rem] max-w-md px-3 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    placeholder="…"
                    maxLength={100}
                    autoFocus
                  />
                  <button type="button" onClick={(e) => onSaveOrderName(order.id, e)} className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={onCancelEditName} className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2 flex-wrap">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">
                        {uiCopy.orderLabel} {uiCopy.orderNumberPrefix}
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold border ${orderStatusBadgeClass(order.status)}`}>
                        {statusLabel}
                      </span>
                      {isBuyer ? (
                        <button
                          type="button"
                          onClick={(e) => onStartEditName(order, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                    {order.createdAt ? (
                      <p className="text-xs text-slate-500 mt-1.5">{formatLongDate(order.createdAt, uiCopy.locale)}</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{uiCopy.totalLabel}</p>
              <p className={`text-xl font-bold tabular-nums ${isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>
                {formatCurrency(displayTotal, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 border-t border-slate-100">
          {items.length ? items.map((item) => <OrderLine key={item.id ?? `${item.listing?.id}-${item.quantity}`} item={item} currency={currency} uiCopy={uiCopy} />) : null}
        </div>

        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between gap-2 text-slate-600">
              <span className="font-medium text-slate-500">{uiCopy.trackingLabel}</span>
              <span className="font-mono text-slate-800 tabular-nums">{trackingNo || uiCopy.trackingEmpty}</span>
            </div>
            <div className="flex justify-between gap-2 text-slate-600">
              <span className="font-medium text-slate-500">{uiCopy.etaLabel}</span>
              <span className="text-slate-800">{etaText}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onOpenOrder(order)}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {uiCopy.detail}
          </button>
          {isBuyer && isShipped ? (
            <button
              type="button"
              onClick={() => onOpenOrder(order)}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              {uiCopy.trackShipment}
            </button>
          ) : null}
          {isBuyer && isDelivered ? (
            <button
              type="button"
              onClick={(e) => onCompleteOrder(order.id, e)}
              className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              {uiCopy.confirmReceipt}
            </button>
          ) : null}
          {isBuyer && isDelivered && firstListingId ? (
            <button
              type="button"
              onClick={() => onReorder?.(firstListingId)}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {uiCopy.reorder}
            </button>
          ) : null}
          {isBuyer && isCompleted && firstListingId ? (
            <button
              type="button"
              onClick={() => onReorder?.(firstListingId)}
              className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {uiCopy.reorder}
            </button>
          ) : null}
          {order.paymentReference ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenReceipt(order.paymentReference);
              }}
              className="sm:w-auto py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Receipt className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </article>
    );
  }
);

const OrdersListLayout = ({
  title,
  subtitle,
  countText: _countText,
  showIndicator,
  stickyHeader = false,
  onAnalytics,
  analyticsLabel,
  containerClassName,
  flow,
  enums,
  viewMode,
  emptyText,
  emptyAction,
  uiCopy: uiCopyProp,
}) => {
  const uiCopy = useMemo(() => mergeUiCopy(uiCopyProp || {}), [uiCopyProp]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();

  const onPageChange = (page) => {
    if (!flow.search?.isSearchMode) flow.loadPage(page);
  };

  const onPageSizeChange = (size) => {
    flow.fetchOrders(0, size, flow.sortField, flow.sortDirection);
  };

  const isBuyerView = viewMode === ORDER_VIEW_MODES.BUYER;
  const isSellerView = viewMode === ORDER_VIEW_MODES.SELLER;

  const computedShowIndicator =
    showIndicator ?? (isBuyerView && flow.orders.some((o) => o.status === ORDER_STATUSES.DELIVERED));

  const onReorderListing = (listingId) => {
    if (listingId) navigate(ROUTES.LISTING_DETAIL(listingId));
  };

  const banner =
    isBuyerView && flow.ui.showNameBanner ? (
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-start gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-indigo-100/50">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 mb-0.5">{uiCopy.nameBannerTitle}</p>
            <p className="text-xs font-medium text-slate-600">{uiCopy.nameBannerBody}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={flow.ui.dismissNameBanner}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 shadow-sm shrink-0 z-10"
        >
          {uiCopy.nameBannerOk}
        </button>
      </div>
    ) : null;

  const topSlot =
    isSellerView && !flow.escrow.isLoading ? (
      <div className={`px-4 py-3.5 rounded-2xl border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/60 border-slate-200'}`}>
        <div className="flex items-start gap-3">
          <Wallet className={`w-4 h-4 mt-0.5 shrink-0 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-600' : 'text-slate-300'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{uiCopy.escrowLabel}</span>
              <span
                className={`text-lg font-semibold tabular-nums tracking-tight ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {formatCurrency(flow.escrow.pendingEscrowAmount)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-0">
              {flow.escrow.pendingEscrowAmount > 0 ? uiCopy.escrowHintPending : uiCopy.escrowHintEmpty}
            </p>
            {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-2">{uiCopy.escrowByOrder}</div>
                <div className="space-y-2">
                  {flow.orders
                    .filter((order) => (parseFloat(order.escrowAmount) || 0) > 0)
                    .map((order) => {
                      const escrowAmt = parseFloat(order.escrowAmount) || 0;
                      const deliveredAt = order.shipping?.deliveredAt;
                      const autoReleaseDate = deliveredAt ? new Date(new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000) : null;
                      const now = new Date();
                      const isAutoReleased = autoReleaseDate && now >= autoReleaseDate;
                      let tooltipText;
                      if (!deliveredAt) tooltipText = 'Released 48h after delivery.';
                      else if (isAutoReleased) tooltipText = 'Auto-released.';
                      else {
                        const diffMs = autoReleaseDate - now;
                        const h = Math.ceil(diffMs / (60 * 60 * 1000));
                        tooltipText = `Auto-releases in ~${h}h.`;
                      }
                      return (
                        <div key={order.id} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => flow.modal.openOrderModal(order)} className="text-slate-700 hover:underline font-medium">
                              #{order.orderNumber}
                            </button>
                            <div className="relative group">
                              <Info className="w-2.5 h-2.5 text-slate-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 w-52 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg">
                                {tooltipText}
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold tabular-nums text-slate-700">{formatCurrency(escrowAmt, order.currency)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title={title}
        subtitle={subtitle}
        showIndicator={computedShowIndicator}
        onAnalytics={onAnalytics}
        analyticsLabel={analyticsLabel}
        onRefresh={flow.refreshAll}
        loading={flow.loading}
        sticky={stickyHeader}
        uiCopy={uiCopy}
      />

      <div className={containerClassName || 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {banner ? <div className="mb-6">{banner}</div> : null}
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}

        {flow.search ? (
          <div className="mb-5 space-y-4">
            <SearchToolbar
              search={flow.search}
              onSearch={flow.search.handleSearch}
              onClearSearch={flow.search.clearSearch}
              filtersOpen={filtersOpen}
              setFiltersOpen={setFiltersOpen}
              uiCopy={uiCopy}
              pagination={flow.pagination}
              onPageSizeChange={onPageSizeChange}
            />
            <StatusTabs statusFilter={flow.search.statusFilter} setStatusFilter={flow.search.setStatusFilter} uiCopy={uiCopy} />
          </div>
        ) : null}

        {flow.loading ? (
          <div>
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </div>
        ) : !flow.orders?.length && !flow.search?.isSearchMode ? (
          <div className="py-16 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</p>
            {isBuyerView && emptyAction ? (
              <button type="button" onClick={emptyAction} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800">
                {uiCopy.startShopping}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            {(flow.orders || []).map((order) => (
              <UnifiedOrderItem
                key={order.id}
                viewMode={viewMode || flow.viewMode}
                order={order}
                enums={enums}
                onOpenOrder={flow.modal.openOrderModal}
                onOpenReceipt={flow.receipt.openReceipt}
                onCompleteOrder={flow.actions.completeOrder}
                onReorder={onReorderListing}
                editingOrderId={flow.ui.editingOrderId}
                editingOrderName={flow.ui.editingOrderName}
                setEditingOrderName={flow.ui.setEditingOrderName}
                onStartEditName={flow.actions.startEditOrderName}
                onCancelEditName={flow.actions.cancelEditOrderName}
                onSaveOrderName={flow.actions.saveOrderName}
                uiCopy={uiCopy}
              />
            ))}
          </div>
        )}

        <Pagination
          pagination={flow.pagination}
          isSearchMode={flow.search?.isSearchMode}
          loading={flow.loading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          uiCopy={uiCopy}
        />
      </div>

      <PaymentReceiptModal isOpen={flow.receipt.receiptOpen} onClose={flow.receipt.closeReceipt} payment={flow.receipt.receiptPayment} />

      <OrderDetailsModal
        isOpen={flow.modal.orderModalOpen}
        selectedOrder={flow.modal.selectedOrder}
        orderReviews={flow.reviews.orderReviews}
        reviewsLoading={flow.reviews.reviewsLoading}
        onClose={flow.modal.closeOrderModal}
        onOpenReceipt={flow.receipt.openReceipt}
        onReviewSuccess={flow.actions.handleReviewSuccess}
        viewMode={viewMode || flow.viewMode}
      />
    </div>
  );
};

OrdersListLayout.Header = Header;
OrdersListLayout.Pagination = Pagination;

export default OrdersListLayout;
