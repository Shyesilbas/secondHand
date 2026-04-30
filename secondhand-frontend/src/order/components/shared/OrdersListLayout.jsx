import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {formatCurrency, resolveEnumLabel} from '../../../common/formatters.js';
import {ROUTES} from '../../../common/constants/routes.js';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import {OrderProgressStepper} from '../orderDetails/OrderTimeline.jsx';
import {
    ORDER_DEFAULTS,
    ORDER_LIMITS,
    ORDER_STATUS_TAB_FILTER,
    ORDER_STATUSES,
    ORDER_TIME,
    ORDER_VIEW_MODES,
} from '../../constants/orderUiConstants.js';
import { getOrderStatusBadgeClass } from '../../utils/statusPresentation.js';
import {
    BarChart3,
    CheckCircle,
    CircleCheck,
    Info,
    Package,
    Pencil,
    Receipt,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Sparkles,
    Wallet,
    X,
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
  reviewDone: 'Review completed',
  reviewLabel: 'Your review',
  reviewNow: 'Review now',
  progressLabel: 'Order progress',
  detail: 'Order details',
  trackShipment: 'Track shipment',
  reorder: 'Buy again',
  confirmReceipt: 'Confirm Order',
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

const Header = React.memo(
  ({ title, showIndicator, onAnalytics, analyticsLabel = 'Analytics', onRefresh, loading, sticky }) => {
    const headerContent = (
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
          {showIndicator ? <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onAnalytics ? (
            <button
              type="button"
              onClick={onAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{analyticsLabel}</span>
            </button>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-indigo-600 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-indigo-200 transition-all duration-300 shadow-sm disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    );

    if (!sticky) {
      return <div className="mb-4 sm:mb-6">{headerContent}</div>;
    }

    return (
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">{headerContent}</div>
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
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const active = (statusFilter || '') === (tab.value || '');
        return (
          <button
            key={tab.value || 'all'}
            type="button"
            onClick={() => setStatusFilter?.(tab.value)}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 ${
              active
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
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
    <div className="flex flex-col w-full sm:w-auto relative">
      <div className="flex items-center gap-2 w-full">
        <form onSubmit={onSearch} className="flex items-center relative group w-full sm:w-64 transition-all duration-300 focus-within:w-full sm:focus-within:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" strokeWidth={2.5} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={uiCopy.searchPlaceholder}
            disabled={searchLoading}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200/80 bg-white/80 text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-300 shadow-sm"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={isSearchMode ? onClearSearch : () => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button type="submit" className="hidden" disabled={searchLoading || !searchTerm.trim()}>{uiCopy.searchSubmit}</button>
        </form>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className={`p-2.5 rounded-xl border transition-all duration-300 shrink-0 shadow-sm ${
            filtersOpen ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200/80 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
          title={uiCopy.openFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
      {filtersOpen && !isSearchMode ? (
        <div className="absolute top-full right-0 mt-2 z-20 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 py-2.5 shadow-xl shadow-slate-900/5 min-w-[200px]">
          <span className="text-xs font-semibold text-slate-500">{uiCopy.pageSizeHint}</span>
          <select
            className="px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 flex-1 cursor-pointer"
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
        <div className="absolute top-full right-0 mt-2 z-20 px-4 py-2.5 bg-rose-50/95 backdrop-blur-xl border border-rose-200 rounded-xl text-xs font-bold text-rose-700 shadow-xl shadow-rose-900/5 whitespace-nowrap">{searchError}</div>
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

const UnifiedOrderItem = React.memo(
  ({
    viewMode,
    order,
    enums,
    onOpenOrder,
    onCompleteOrder,
    editingOrderId,
    editingOrderName,
    setEditingOrderName,
    onStartEditName,
    onCancelEditName,
    onSaveOrderName,
    uiCopy,
    isReviewed,
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

    const displayTotal = viewMode === ORDER_VIEW_MODES.SELLER ? sellerTotalAmount : parseFloat(order.totalAmount);
    const currency = order.currency || 'TRY';
    const statusLabel = resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status;
    
    const displayedItems = items.slice(0, 3);
    const extraCount = items.length > 3 ? items.length - 3 : 0;

    let primaryAction = null;
    if (isBuyer) {
      if (isShipped) {
        primaryAction = (
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
            {uiCopy.trackShipment}
          </button>
        );
      } else if (isDelivered) {
        primaryAction = (
          <button type="button" onClick={(e) => { e.stopPropagation(); onCompleteOrder(order.id, e); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
            {uiCopy.confirmReceipt}
          </button>
        );
      } else if (isCompleted && !isReviewed) {
        primaryAction = (
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
            {uiCopy.reviewNow}
          </button>
        );
      } else {
        primaryAction = (
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200/80 bg-white/50 text-slate-700 text-sm font-bold hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md">
            {uiCopy.detail}
          </button>
        );
      }
    } else {
       primaryAction = (
          <button type="button" onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }} className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200/80 bg-white/50 text-slate-700 text-sm font-bold hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md">
            {uiCopy.detail}
          </button>
       );
    }

    return (
      <article 
        onClick={() => onOpenOrder(order)}
        className="group bg-white/80 backdrop-blur-xl rounded-[1.25rem] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-400 overflow-hidden relative cursor-pointer flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 opacity-0 group-hover:from-indigo-50/50 group-hover:to-violet-50/50 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
        
        {/* Left: Images */}
        <div className="flex -space-x-3 shrink-0 relative z-10 w-full sm:w-auto justify-center sm:justify-start">
          {displayedItems.map((item, i) => (
            <div key={item.id || i} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-slate-50 relative`} style={{ zIndex: 30 - i * 10 }}>
              {item.listing?.imageUrl ? (
                <img src={item.listing.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
          ))}
          {extraCount > 0 && (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-white shadow-sm flex items-center justify-center bg-slate-50 text-xs font-bold text-slate-600 relative z-0">
              +{extraCount}
            </div>
          )}
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0 w-full relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left gap-1.5">
          {isBuyer && editingOrderId === order.id ? (
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editingOrderName}
                onChange={(e) => setEditingOrderName(e.target.value)}
                className="w-32 sm:w-48 px-3 py-1.5 text-sm font-bold text-slate-800 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                placeholder="Name..."
                maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH}
                autoFocus
              />
              <button type="button" onClick={(e) => onSaveOrderName(order.id, e)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                <CheckCircle className="w-4 h-4" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onCancelEditName(); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[200px] sm:max-w-[300px]">
                {order.name || `${uiCopy.orderLabel} ${uiCopy.orderNumberPrefix}${order.orderNumber}`}
              </span>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border shadow-sm backdrop-blur-sm ${getOrderStatusBadgeClass(order.status)}`}>
                {statusLabel}
              </span>
              {isBuyer ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onStartEditName(order, e); }}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>{formatLongDate(order.createdAt, uiCopy.locale)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>{uiCopy.itemsSummary ? uiCopy.itemsSummary(items.length) : `${items.length} items`}</span>
          </div>
        </div>

        {/* Right: Price & Button */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10 mt-3 sm:mt-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100/80">
          <div className="text-center sm:text-right flex sm:flex-col justify-between sm:justify-start w-full sm:w-auto items-center sm:items-end">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{uiCopy.totalLabel}</span>
            <span className={`text-lg sm:text-xl font-extrabold tabular-nums tracking-tight ${isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>
              {formatCurrency(displayTotal, currency)}
            </span>
          </div>
          <div className="w-full sm:w-auto flex justify-stretch">
             {primaryAction}
          </div>
        </div>
      </article>
    );
  }
);

const OrdersListLayout = ({
  title,
  subtitle,
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

  const banner = isBuyerView && flow.ui.showNameBanner;

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
                      const autoReleaseDate = deliveredAt ? new Date(new Date(deliveredAt).getTime() + ORDER_TIME.DELIVERY_CONFIRMATION_WINDOW_MS) : null;
                      const now = new Date();
                      const isAutoReleased = autoReleaseDate && now >= autoReleaseDate;
                      let tooltipText;
                      if (!deliveredAt) tooltipText = 'Released 72h after delivery.';
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
    <div className="min-h-screen bg-[#f8fafc] relative selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      {/* Decorative background glows - Fixed behind content so it doesn't break scrolling or stacking */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-400/10 blur-[120px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-violet-400/10 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10">
      <Header
        title={title}
        showIndicator={computedShowIndicator}
        onAnalytics={onAnalytics}
        analyticsLabel={analyticsLabel}
        onRefresh={flow.refreshAll}
        loading={flow.loading}
        sticky={stickyHeader}
        uiCopy={uiCopy}
      />

      <div className={containerClassName || 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
        {banner ? (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {uiCopy.nameBannerTitle}
            <button onClick={flow.ui.dismissNameBanner} className="ml-2 p-0.5 hover:bg-indigo-100 rounded-full transition-colors text-indigo-400 hover:text-indigo-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null}
        
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}

        {flow.search ? (
          <div className="mb-6 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-white/40 backdrop-blur-xl p-2 sm:p-2.5 rounded-2xl border border-slate-200/60 shadow-sm">
            <StatusTabs statusFilter={flow.search.statusFilter} setStatusFilter={flow.search.setStatusFilter} uiCopy={uiCopy} />
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
          </div>
        ) : null}

        {flow.loading ? (
          <div className="space-y-4">
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </div>
        ) : !flow.orders?.length && !flow.search?.isSearchMode ? (
          <div className="py-24 text-center rounded-3xl border border-dashed border-slate-300/80 bg-white/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-sm">Looks like you haven't made any orders yet. Discover amazing products and start shopping.</p>
              {isBuyerView && emptyAction ? (
                <button type="button" onClick={emptyAction} className="px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                  {uiCopy.startShopping}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {(flow.orders || []).map((order) => (
              <div key={order.id}>
                <UnifiedOrderItem
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
                  isReviewed={Boolean(flow.reviews?.reviewedOrderIds?.[order.id])}
                  reviewSummary={flow.reviews?.reviewedOrderSummaries?.[order.id]}
                />
              </div>
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
      </div>

      {/* Render Modal outside the z-10 wrapper so it has full z-index context over the whole viewport */}
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
