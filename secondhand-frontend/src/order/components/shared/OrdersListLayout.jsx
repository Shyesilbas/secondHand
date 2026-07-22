import PageContainer from '@/common/components/layout/PageContainer';
import {useTranslation} from "react-i18next";
import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_QUERY_KEYS } from '../../orderConstants.js';
import { orderService } from '../../services/orderService.js';
import {formatCurrency, resolveEnumLabel} from '../../../common/formatters.js';
import {ROUTES} from '../../../common/constants/routes.js';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import ReviewModal from '../../../reviews/components/ReviewModal.jsx';
import {
  ORDER_DEFAULTS,
  ORDER_LIMITS,
  ORDER_STATUS_TAB_FILTER,
  ORDER_STATUSES,
  ORDER_TIME,
  ORDER_VIEW_MODES
} from '../../constants/orderUiConstants.js';
import {getOrderStatusBadgeClass} from '../../utils/statusPresentation.js';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  CircleCheck,
  Clock,
  Info,
  Loader2,
  Package,
  PackageCheck,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  Wallet,
  X,
  XCircle
} from 'lucide-react';

const mergeUiCopy = partial => ({
  ...DEFAULT_UI_COPY,
  ...partial
});
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
  /** Kartta sipariş no gösterilmez; isim yoksa bu başlık kullanılır */
  orderCardTitleFallback: 'Your order',
  reviewDone: 'Review completed',
  reviewLabel: 'Your review',
  reviewNow: 'Review now',
  progressLabel: 'Order progress',
  detail: 'Order details',
  trackShipment: 'Track shipment',
  reorder: 'Buy again',
  confirmReceipt: 'Confirm Order',
  qtyLabel: 'Qty',
  itemsSummary: n => n === 1 ? '1 item' : `${n} items`,
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
  paginationPerPage: n => `${n} / page`,
  emptyShopping: 'Start shopping',
  startShopping: 'Start shopping'
};
const formatLongDate = (iso, locale) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale || 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};
const statusKey = s => String(s || '').toUpperCase();

/** Paylaşılan slice metni (üst özet + pagination) */
const getListPaginationSlice = (pagination, pageSizeFallback = ORDER_DEFAULTS.INITIAL_PAGE_SIZE) => {
  if (!pagination || pagination.totalPages === 0) return null;
  const currentPage = pagination.number || 0;
  const pageSize = pagination.size || pageSizeFallback;
  const totalElements = pagination.totalElements || 0;
  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);
  return {
    currentPage,
    totalPages: pagination.totalPages || 1,
    pageSize,
    totalElements,
    startItem,
    endItem
  };
};
const ORDER_STATUS_LIST_ICON = {
  [ORDER_STATUSES.PENDING]: Clock,
  [ORDER_STATUSES.CONFIRMED]: CheckCircle,
  [ORDER_STATUSES.PROCESSING]: Loader2,
  [ORDER_STATUSES.SHIPPED]: Truck,
  [ORDER_STATUSES.DELIVERED]: PackageCheck,
  [ORDER_STATUSES.COMPLETED]: CircleCheck,
  [ORDER_STATUSES.CANCELLED]: XCircle,
  [ORDER_STATUSES.REFUNDED]: RotateCcw,
  [ORDER_STATUSES.MEETUP_PENDING]: Clock,
  [ORDER_STATUSES.HANDOVER_CONFIRMED]: PackageCheck,
  [ORDER_STATUSES.VERIFICATION_LOCKED]: AlertTriangle
};
const ListStatusGlyph = ({
  status,
  className
}) => {
  const Cmp = ORDER_STATUS_LIST_ICON[statusKey(status)] || Package;
  const spin = statusKey(status) === ORDER_STATUSES.PROCESSING;
  return <Cmp className={`shrink-0 ${spin ? 'animate-spin' : ''} ${className || ''}`} aria-hidden strokeWidth={2} />;
};
const btnToolbarIcon = 'inline-flex items-center justify-center rounded-xl bg-background-primary text-slate-600 hover:text-text-primary border border-border-light/90 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all';
const orderActionBtnBase = 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2';
const Header = React.memo(({
  title,
  subtitle,
  showIndicator,
  onAnalytics,
  analyticsLabel = 'Analytics',
  onRefresh,
  loading,
  sticky
}) => {
  const {
    t
  } = useTranslation();
  const headerContent = <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight truncate">{title}</h1>
            {showIndicator ? <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shrink-0 shadow-sm" /> : null}
          </div>
          {subtitle ? <p className="text-sm text-slate-500 font-medium truncate">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onAnalytics ? <button type="button" onClick={onAnalytics} className={`${btnToolbarIcon} gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-semibold`}>
              <BarChart3 className="w-4 h-4 text-primary shrink-0" />
              <span className="hidden sm:inline">{analyticsLabel}</span>
            </button> : null}
          {onRefresh ? <button type="button" onClick={onRefresh} disabled={loading} className={`${btnToolbarIcon} p-2 disabled:opacity-40 disabled:pointer-events-none`} title={t("refresh")}>
              <RefreshCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button> : null}
        </div>
      </div>;
  if (!sticky) {
    return <div className="mb-4 sm:mb-6">{headerContent}</div>;
  }
  return <div className="bg-background-primary/80 backdrop-blur-xl border-b border-border-light/60 sticky top-0 z-30">
        <PageContainer className="py-3.5">{headerContent}</PageContainer>
      </div>;
});
const StatusTabs = React.memo(({
  statusFilter,
  setStatusFilter,
  uiCopy
}) => {
  const {
    t
  } = useTranslation();
  const tabs = useMemo(() => [{
    value: ORDER_STATUS_TAB_FILTER.ALL,
    label: uiCopy.tabAll
  }, {
    value: ORDER_STATUS_TAB_FILTER.PREPARING,
    label: uiCopy.tabPreparing
  }, {
    value: ORDER_STATUS_TAB_FILTER.SHIPPED,
    label: uiCopy.tabShipped
  }, {
    value: ORDER_STATUS_TAB_FILTER.DELIVERED_GROUP,
    label: uiCopy.tabDelivered
  }, {
    value: ORDER_STATUS_TAB_FILTER.CANCELLED,
    label: uiCopy.tabCancelled
  }], [uiCopy]);
  return <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/50 border border-border-light/60 w-full lg:w-auto" role="tablist" aria-label={t("order_status_filters")}>
      {tabs.map(tab => {
      const active = (statusFilter || '') === (tab.value || '');
      return <button key={tab.value || 'all'} type="button" role="tab" aria-selected={active} id={`orders-tab-${String(tab.value || 'all').replace(/\W+/g, '-')}`} onClick={() => setStatusFilter?.(tab.value)} className={`flex-1 min-w-[5.25rem] sm:flex-none px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 ${active ? 'bg-background-primary text-text-primary shadow-sm ring-1 ring-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-background-primary/70'}`}>
            {tab.label}
          </button>;
    })}
    </div>;
});
const SearchToolbar = React.memo(({
  search,
  onSearch,
  onClearSearch,
  filtersOpen,
  setFiltersOpen,
  uiCopy,
  pagination,
  onPageSizeChange
}) => {
  const {
    t
  } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    searchLoading,
    searchError,
    isSearchMode
  } = search;
  const filtersPopoverId = 'orders-list-page-size-popover';
  return <div className="flex flex-col w-full sm:w-auto relative" role="search" aria-label={t("search_orders")}>
      <div className="flex items-center gap-2 w-full">
        <form onSubmit={onSearch} className="flex items-center relative group w-full sm:w-64 transition-all duration-300 focus-within:w-full sm:focus-within:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" strokeWidth={2.5} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={uiCopy.searchPlaceholder} disabled={searchLoading} aria-invalid={Boolean(searchError)} aria-describedby={searchError ? 'orders-search-error' : undefined} className="w-full pl-9 pr-9 py-2 rounded-xl border border-border-light bg-background-primary text-sm font-semibold text-text-primary placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all duration-200 shadow-sm" />
          {searchTerm ? <button type="button" onClick={isSearchMode ? onClearSearch : () => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors" aria-label={uiCopy.clear}>
              <X className="w-3.5 h-3.5" />
            </button> : null}
          <button type="submit" className="sr-only" disabled={searchLoading || !searchTerm.trim()}>{uiCopy.searchSubmit}</button>
        </form>
        <button type="button" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen} aria-controls={filtersPopoverId} className={`p-2.5 rounded-xl border transition-all duration-200 shrink-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${filtersOpen ? 'border-primary bg-background-primary text-primary ring-2 ring-primary/15' : 'border-border-light/90 bg-background-primary text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`} title={uiCopy.openFilters} aria-label={uiCopy.openFilters}>
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
      {filtersOpen && !isSearchMode ? <div className="absolute top-full right-0 mt-2 z-20 flex items-center gap-3 rounded-xl border border-border-light/80 bg-background-primary px-4 py-2.5 shadow-lg shadow-slate-900/5 min-w-[200px]" id={filtersPopoverId} role="region" aria-label={uiCopy.pageSizeHint}>
          <span className="text-xs font-semibold text-slate-500">{uiCopy.pageSizeHint}</span>
          <select className="px-2 py-1.5 text-xs font-bold text-slate-800 border border-border-light rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 cursor-pointer" value={pagination?.size ?? ORDER_DEFAULTS.INITIAL_PAGE_SIZE} onChange={e => onPageSizeChange(Number(e.target.value))}>
            {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map(option => <option key={option} value={option}>
                {uiCopy.paginationPerPage(option)}
              </option>)}
          </select>
        </div> : null}
      {searchError ? <div id="orders-search-error" role="status" aria-live="polite" className="absolute top-full right-0 mt-2 z-20 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 shadow-lg shadow-rose-900/5 max-w-xs">
          {searchError}
        </div> : null}
    </div>;
});
const OrderItemSkeleton = () => <div className="rounded-2xl border border-slate-100 bg-background-primary p-5 sm:p-6 shadow-sm animate-pulse overflow-hidden relative">
    <div className="absolute left-0 inset-y-0 w-1 rounded-r bg-slate-200" aria-hidden />
    <div className="pl-5 flex gap-4 sm:gap-5 items-start">
      <div className="flex -space-x-3 shrink-0">
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-200 border-2 border-white shadow-sm" />
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-100 border-2 border-white shadow-sm" />
      </div>
      <div className="flex-1 space-y-3 min-w-0 pt-1">
        <div className="h-4 w-44 max-w-full bg-slate-200 rounded-lg" />
        <div className="h-5 w-20 bg-slate-100 rounded-full" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="shrink-0 text-right space-y-2 pt-1">
        <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
        <div className="h-8 w-28 bg-slate-200 rounded-xl ml-auto" />
      </div>
    </div>
    <div className="pl-5 mt-5 pt-4 border-t border-slate-100 flex gap-2 justify-end">
      <div className="h-10 w-24 bg-slate-100 rounded-xl" />
      <div className="h-10 w-36 bg-slate-200 rounded-xl" />
    </div>
  </div>;
const Pagination = React.memo(({
  pagination,
  isSearchMode,
  loading,
  onPageChange,
  onPageSizeChange,
  uiCopy
}) => {
  if (isSearchMode || loading) return null;
  const slice = getListPaginationSlice(pagination);
  if (!slice) return null;
  const {
    currentPage,
    totalPages,
    pageSize,
    totalElements,
    startItem,
    endItem
  } = slice;
  return <div className="flex items-center justify-between flex-wrap gap-4 mt-10 pt-6 border-t border-border-light">
      <p className="text-sm text-slate-500 tabular-nums">{uiCopy.paginationShowing(startItem, endItem, totalElements)}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={() => onPageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0 || totalPages <= 1} className="inline-flex items-center px-4 py-2.5 rounded-xl border border-border-light bg-background-primary text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 shadow-sm transition-all">
          {uiCopy.paginationPrev}
        </button>
        <span className="text-sm font-semibold text-slate-700 tabular-nums px-2">
          {uiCopy.paginationPage(currentPage + 1, totalPages)}
        </span>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1 || totalPages <= 1} className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-900/10 bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 shadow-sm transition-all">
          {uiCopy.paginationNext}
        </button>
        <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" />
        <select className="px-3 py-2.5 text-sm font-semibold text-slate-800 border border-border-light rounded-xl bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm cursor-pointer transition-all" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
          {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map(option => <option key={option} value={option}>
              {uiCopy.paginationPerPage(option)}
            </option>)}
        </select>
      </div>
    </div>;
});
const UnifiedOrderItem = React.memo(({
  viewMode,
  order,
  enums,
  onOpenOrder,
  onOpenQuickReview,
  onCompleteOrder,
  editingOrderId,
  editingOrderName,
  setEditingOrderName,
  onStartEditName,
  onCancelEditName,
  onSaveOrderName,
  uiCopy,
  isReviewed
}) => {
  const queryClient = useQueryClient();
  const handleMouseEnter = () => {
    const isSeller = viewMode === ORDER_VIEW_MODES.SELLER;
    queryClient.prefetchQuery({
      queryKey: ORDER_QUERY_KEYS.detail(order.id, isSeller),
      queryFn: () => isSeller
        ? orderService.getSellerOrderById(order.id)
        : orderService.getById(order.id),
      staleTime: 30000,
    });
  };

  const {
    t
  } = useTranslation();
  const items = order.orderItems || [];
  const isBuyer = viewMode === ORDER_VIEW_MODES.BUYER;
  const isCompleted = order.status === ORDER_STATUSES.COMPLETED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED || order.status === ORDER_STATUSES.HANDOVER_CONFIRMED;
  const isShipped = order.status === ORDER_STATUSES.SHIPPED;
  const sellerTotalAmount = viewMode === ORDER_VIEW_MODES.SELLER ? items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0) : null;
  const displayTotal = viewMode === ORDER_VIEW_MODES.SELLER ? sellerTotalAmount : parseFloat(order.totalAmount);
  const currency = order.currency || 'TRY';
  const statusLabel = resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status;
  const displayedItems = items.slice(0, 3);
  const extraCount = items.length > 3 ? items.length - 3 : 0;

  // Status badge dot color
  const statusDotColor = {
    [ORDER_STATUSES.COMPLETED]: 'bg-status-success-bg',
    [ORDER_STATUSES.DELIVERED]: 'bg-primary',
    [ORDER_STATUSES.SHIPPED]: 'bg-primary',
    [ORDER_STATUSES.PROCESSING]: 'bg-status-warning-bg',
    [ORDER_STATUSES.CONFIRMED]: 'bg-status-success-bg',
    [ORDER_STATUSES.PENDING]: 'bg-text-muted',
    [ORDER_STATUSES.CANCELLED]: 'bg-rose-500',
    [ORDER_STATUSES.REFUNDED]: 'bg-rose-500',
    [ORDER_STATUSES.MEETUP_PENDING]: 'bg-primary',
    [ORDER_STATUSES.HANDOVER_CONFIRMED]: 'bg-primary',
    [ORDER_STATUSES.VERIFICATION_LOCKED]: 'bg-primary'
  }[statusKey(order.status)] || 'bg-text-muted';
  let primaryAction = null;
  if (isBuyer) {
    if (isShipped) {
      primaryAction = <button type="button" onClick={e => {
        e.stopPropagation();
        onOpenOrder(order);
      }} className={`${orderActionBtnBase} bg-primary text-white hover:bg-primary active:bg-primary shadow-sm shadow-indigo-900/15`}>
            <Truck className="w-4 h-4 opacity-95" strokeWidth={2} />
            {uiCopy.trackShipment}
          </button>;
    } else if (isDelivered) {
      primaryAction = <button type="button" onClick={e => {
        e.stopPropagation();
        onCompleteOrder(order.id, e);
      }} className={`${orderActionBtnBase} bg-status-success-bg text-white hover:bg-status-success-bg active:bg-status-success-bg shadow-sm shadow-emerald-900/15`}>
            <CircleCheck className="w-4 h-4 opacity-95" strokeWidth={2} />
            {uiCopy.confirmReceipt}
          </button>;
    } else if (isCompleted && !isReviewed) {
      primaryAction = <button type="button" onClick={e => {
        e.stopPropagation();
        if (onOpenQuickReview) onOpenQuickReview(order);else onOpenOrder(order);
      }} className={`${orderActionBtnBase} bg-primary text-white hover:bg-primary active:bg-primary shadow-sm shadow-indigo-900/15`}>
            <Star className="w-4 h-4 opacity-95" strokeWidth={2} />
            {uiCopy.reviewNow}
          </button>;
    }
  }
  const accentBorder = {
    [ORDER_STATUSES.COMPLETED]: 'border-l-emerald-400',
    [ORDER_STATUSES.DELIVERED]: 'border-l-blue-400',
    [ORDER_STATUSES.SHIPPED]: 'border-l-indigo-400',
    [ORDER_STATUSES.PROCESSING]: 'border-l-amber-400',
    [ORDER_STATUSES.CONFIRMED]: 'border-l-green-400',
    [ORDER_STATUSES.PENDING]: 'border-l-slate-300',
    [ORDER_STATUSES.CANCELLED]: 'border-l-rose-400',
    [ORDER_STATUSES.REFUNDED]: 'border-l-rose-400',
    [ORDER_STATUSES.MEETUP_PENDING]: 'border-l-indigo-500',
    [ORDER_STATUSES.HANDOVER_CONFIRMED]: 'border-l-violet-600',
    [ORDER_STATUSES.VERIFICATION_LOCKED]: 'border-l-purple-700'
  }[statusKey(order.status)] || 'border-l-slate-200';
  return <article tabIndex={isBuyer && editingOrderId === order.id ? -1 : 0} onClick={() => onOpenOrder(order)} onMouseEnter={handleMouseEnter} onKeyDown={e => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenOrder(order);
    }
  }} aria-label={`${order.name ? `${order.name}, ` : ''}${statusLabel}. ${formatLongDate(order.createdAt, uiCopy.locale)}`} className={`group relative rounded-2xl border border-slate-100 bg-background-primary shadow-sm hover:shadow-sm hover:border-border-light hover:-translate-y-px transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6 border-l-[3.5px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${accentBorder}`}>
        {/* Thumbnails */}
        <div className="flex -space-x-3 shrink-0 relative z-10 self-center sm:self-start mt-1">
          {displayedItems.map((item, i) => <div key={item.id || i} className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-50 relative" style={{
        zIndex: 30 - i * 10
      }}>
              {item.listing?.imageUrl ? <img src={item.listing.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>}
            </div>)}
          {extraCount > 0 && <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl border-2 border-white shadow-md flex items-center justify-center bg-slate-50 relative z-0">
              <span className="text-sm font-bold text-slate-500">+{extraCount}</span>
            </div>}
        </div>

        {/* Middle: Details */}
        <div className="flex-1 min-w-0 w-full relative z-10 flex flex-col gap-2">
          {isBuyer && editingOrderId === order.id ? <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
              <input type="text" value={editingOrderName} onChange={e => setEditingOrderName(e.target.value)} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} className="w-40 sm:w-52 px-3 py-1.5 text-sm font-semibold text-slate-800 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 bg-background-primary shadow-sm" placeholder={t("order_name")} maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH} autoFocus />
              <button type="button" onClick={e => {
          e.stopPropagation();
          onSaveOrderName(order.id, e);
        }} className="p-2 rounded-xl bg-status-success-bg text-white hover:bg-status-success-bg shadow-sm transition-colors" title={t("save")}>
                <CheckCircle className="w-4 h-4" />
              </button>
              <button type="button" onClick={e => {
          e.stopPropagation();
          onCancelEditName();
        }} className="p-2 rounded-xl border border-border-light bg-background-primary text-slate-600 hover:bg-slate-50 transition-colors" title={t("cancel")}>
                <X className="w-4 h-4" />
              </button>
            </div> : <div className="flex flex-wrap items-center gap-2.5">
              {/* Order name */}
              <span className="text-base font-semibold text-text-primary tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {order.name || uiCopy.orderCardTitleFallback}
              </span>

              {/* Status pill */}
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold border ${getOrderStatusBadgeClass(order.status)}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor} ${order.status === ORDER_STATUSES.PROCESSING ? 'animate-pulse' : ''}`} aria-hidden />
                {statusLabel}
              </span>

              {/* Name edit button (buyer only) */}
              {isBuyer ? <button type="button" onClick={e => {
          e.stopPropagation();
          onStartEditName(order, e);
        }} className="p-1.5 text-slate-300 hover:text-primary rounded-lg hover:bg-indigo-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 opacity-0 group-hover:opacity-100" title={t("rename_order")}>
                  <Pencil className="w-3.5 h-3.5" />
                </button> : null}
            </div>}

          {/* Meta: date · items */}
          <div className="flex items-center gap-2 text-sm text-slate-400 tabular-nums">
            <time dateTime={order.createdAt || undefined}>{formatLongDate(order.createdAt, uiCopy.locale)}</time>
            <span className="w-1 h-1 rounded-full bg-slate-200 shrink-0" aria-hidden />
            <span>{uiCopy.itemsSummary ? uiCopy.itemsSummary(items.length) : `${items.length} items`}</span>
          </div>

          {/* Order number subtle */}
          <p className="text-body text-slate-300 font-medium tabular-nums">
            #{order.orderNumber}
          </p>
        </div>

        {/* Right: Price + CTA */}
        <div className={`shrink-0 flex z-10 mt-1 sm:mt-0 w-full sm:w-auto flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4`}>
          {/* Price */}
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-caption font-semibold text-slate-400 uppercase tracking-wider">{uiCopy.totalLabel}</span>
            <span className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight leading-tight mt-0.5 ${isCompleted ? 'text-status-success' : 'text-text-primary'}`}>
              {formatCurrency(displayTotal, currency)}
            </span>
          </div>

          {/* Primary CTA or chevron affordance */}
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            {primaryAction ? primaryAction : <span className="inline-flex items-center gap-1 text-body font-semibold text-slate-400 group-hover:text-primary transition-colors" aria-hidden>
                {uiCopy.detail}
                <svg className="w-3.5 h-3.5 -rotate-90 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>}
          </div>
        </div>
      </article>;
});
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
  highlightOrderId
}) => {
  const uiCopy = useMemo(() => mergeUiCopy(uiCopyProp || {}), [uiCopyProp]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deliveryMethodFilter = flow.deliveryMethodFilter;
  const setDeliveryMethodFilter = flow.setDeliveryMethodFilter;
  const navigate = useNavigate();
  const displayedOrders = flow.orders || [];
  const onPageChange = page => {
    if (!flow.search?.isSearchMode) flow.loadPage(page);
  };
  const onPageSizeChange = size => {
    flow.fetchOrders(0, size, flow.sortField, flow.sortDirection);
  };
  const isBuyerView = viewMode === ORDER_VIEW_MODES.BUYER;
  const isSellerView = viewMode === ORDER_VIEW_MODES.SELLER;
  useEffect(() => {
    if (!highlightOrderId || !flow.orders?.length || flow.loading) return;
    const id = String(highlightOrderId);
    requestAnimationFrame(() => {
      document.getElementById(`order-card-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  }, [highlightOrderId, flow.orders, flow.loading]);
  const computedShowIndicator = showIndicator ?? (isBuyerView && (flow.orders || []).some(o => o.status === ORDER_STATUSES.DELIVERED));
  const onReorderListing = listingId => {
    if (listingId) navigate(ROUTES.LISTING_DETAIL(listingId));
  };
  const banner = isBuyerView && flow.ui.showNameBanner;
  const topListSummarySlice = useMemo(() => {
    if (!flow.search || flow.loading || flow.search?.isSearchMode || !flow.orders?.length) return null;
    return getListPaginationSlice(flow.pagination);
  }, [flow.search, flow.loading, flow.orders?.length, flow.pagination]);
  const topSlot = isSellerView && !flow.escrow.isLoading ? <div className={`px-4 py-3.5 rounded-2xl border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-slate-50 border-border-light' : 'bg-slate-50/60 border-border-light'}`}>
        <div className="flex items-start gap-3">
          <Wallet className={`w-4 h-4 mt-0.5 shrink-0 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-600' : 'text-slate-300'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-caption font-medium text-slate-500 uppercase tracking-wide">{uiCopy.escrowLabel}</span>
              <span className={`text-lg font-semibold tabular-nums tracking-tight ${flow.escrow.pendingEscrowAmount > 0 ? 'text-text-primary' : 'text-slate-400'}`}>
                {formatCurrency(flow.escrow.pendingEscrowAmount)}
              </span>
            </div>
            <p className="text-caption text-slate-500 mb-0">
              {flow.escrow.pendingEscrowAmount > 0 ? uiCopy.escrowHintPending : uiCopy.escrowHintEmpty}
            </p>
            {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? <div className="mt-3 pt-3 border-t border-border-light">
                <div className="text-caption font-medium text-slate-500 uppercase tracking-wide mb-2">{uiCopy.escrowByOrder}</div>
                <div className="space-y-2">
                  {flow.orders.filter(order => (parseFloat(order.escrowAmount) || 0) > 0).map(order => {
              const escrowAmt = parseFloat(order.escrowAmount) || 0;
              const deliveredAt = order.shipping?.deliveredAt;
              const autoReleaseDate = deliveredAt ? new Date(new Date(deliveredAt).getTime() + ORDER_TIME.DELIVERY_CONFIRMATION_WINDOW_MS) : null;
              const now = new Date();
              const isAutoReleased = autoReleaseDate && now >= autoReleaseDate;
              let tooltipText;
              if (!deliveredAt) tooltipText = 'Released 72h after delivery.';else if (isAutoReleased) tooltipText = 'Auto-released.';else {
                const diffMs = autoReleaseDate - now;
                const h = Math.ceil(diffMs / (60 * 60 * 1000));
                tooltipText = `Auto-releases in ~${h}h.`;
              }
              return <div key={order.id} className="flex items-center justify-between text-caption">
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => flow.modal.openOrderModal(order)} className="text-slate-700 hover:underline font-medium truncate max-w-[12rem] text-left">
                              {order.name || uiCopy.orderCardTitleFallback}
                            </button>
                            <div className="relative group">
                              <Info className="w-2.5 h-2.5 text-slate-400 cursor-help" />
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 w-52 p-2 bg-slate-900 text-white text-caption rounded-lg shadow-lg">
                                {tooltipText}
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold tabular-nums text-slate-700">{formatCurrency(escrowAmt, order.currency)}</span>
                        </div>;
            })}
                </div>
              </div> : null}
          </div>
        </div>
      </div> : null;
  return <div className="min-h-screen bg-slate-50 relative selection:bg-primary-50 selection:text-primary pb-20">
      {/* Decorative background glows - Fixed behind content so it doesn't break scrolling or stacking */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-primary/[0.055] blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-primary/[0.045] blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
      <Header title={title} subtitle={subtitle} showIndicator={computedShowIndicator} onAnalytics={onAnalytics} analyticsLabel={analyticsLabel} onRefresh={flow.refreshAll} loading={flow.loading} sticky={stickyHeader} />

      <PageContainer className={containerClassName || 'py-10'}>
        {banner ? <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-primary/50 text-primary text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {uiCopy.nameBannerTitle}
            <button onClick={flow.ui.dismissNameBanner} className="ml-2 p-0.5 hover:bg-primary-50 rounded-full transition-colors text-primary hover:text-primary">
              <X className="w-3 h-3" />
            </button>
          </div> : null}
        
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}

        {/* Modern Segmented Tab Switcher for Delivery Methods */}
        <div className="mb-8 flex p-1.5 rounded-2xl bg-slate-200/50 border border-border-light/60 max-w-md shadow-sm">
          {['ALL', 'CARGO', 'SAFE_MEETUP'].map(method => {
            const isActive = deliveryMethodFilter === method;
            const label = {
              ALL: t('all_orders_tab', 'Tüm Siparişler'),
              CARGO: t('shipping_orders_tab', 'Kargo ile Gönderim'),
              SAFE_MEETUP: t('safe_meetup_orders_tab', 'Elden Güvenli Teslimat')
            }[method];
            return <button key={method} type="button" onClick={() => setDeliveryMethodFilter(method)} className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${isActive ? 'bg-background-primary text-text-primary shadow-sm border border-border-light/60' : 'text-slate-500 hover:text-slate-800 hover:bg-background-primary/40'}`}>
                {label}
              </button>;
          })}
        </div>

        {flow.search ? <>
          <div className="mb-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-background-primary p-2 sm:p-2.5 rounded-2xl border border-border-light/80 shadow-sm">
            <StatusTabs statusFilter={flow.search.statusFilter} setStatusFilter={flow.search.setStatusFilter} uiCopy={uiCopy} />
            <SearchToolbar search={flow.search} onSearch={flow.search.handleSearch} onClearSearch={flow.search.clearSearch} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen} uiCopy={uiCopy} pagination={flow.pagination} onPageSizeChange={onPageSizeChange} />
          </div>
          {topListSummarySlice ? <div className="flex justify-end -mt-4 mb-5 px-1">
              <p className="text-sm text-slate-500 tabular-nums">
                {uiCopy.paginationShowing(topListSummarySlice.startItem, topListSummarySlice.endItem, topListSummarySlice.totalElements)}
              </p>
            </div> : null}
          </> : null}

        {flow.loading ? <div className="space-y-4">
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => <OrderItemSkeleton key={i} />)}
          </div> : !displayedOrders?.length && !flow.search?.isSearchMode ? <div className="py-28 text-center rounded-2xl border border-dashed border-border-light bg-background-primary shadow-sm relative overflow-hidden">
            <div className="relative flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-border-light flex items-center justify-center mb-6 shadow-sm">
                <Package className="w-11 h-11 text-slate-300" />
              </div>
              <h3 className="text-sm font-medium text-text-primary mb-2 tracking-tight">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</h3>
              <p className="text-sm text-slate-400 mb-8 max-w-xs leading-relaxed">
                {isSellerView ? 'Your sold items will appear here once buyers place orders.' : 'Discover amazing products and place your first order.'}
              </p>
              {isBuyerView && emptyAction ? <button type="button" onClick={emptyAction} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary active:bg-primary shadow-md shadow-indigo-900/15 hover:shadow-lg hover:shadow-indigo-900/20 transition-all ring-1 ring-primary/30">
                  {uiCopy.startShopping}
                </button> : null}
            </div>
          </div> : <div className="space-y-4">
            {(displayedOrders || []).map(order => <div key={order.id} id={order.id != null ? `order-card-${order.id}` : undefined}>
                <UnifiedOrderItem viewMode={viewMode || flow.viewMode} order={order} enums={enums} onOpenOrder={flow.modal.openOrderModal} onOpenQuickReview={flow.reviewQuick?.openForOrder} onOpenReceipt={flow.receipt.openReceipt} onCompleteOrder={flow.actions.completeOrder} onReorder={onReorderListing} editingOrderId={flow.ui.editingOrderId} editingOrderName={flow.ui.editingOrderName} setEditingOrderName={flow.ui.setEditingOrderName} onStartEditName={flow.actions.startEditOrderName} onCancelEditName={flow.actions.cancelEditOrderName} onSaveOrderName={flow.actions.saveOrderName} uiCopy={uiCopy} isReviewed={Boolean(flow.reviews?.reviewedOrderIds?.[order.id])} reviewSummary={flow.reviews?.reviewedOrderSummaries?.[order.id]} />
              </div>)}
          </div>}

        <Pagination pagination={flow.pagination} isSearchMode={flow.search?.isSearchMode} loading={flow.loading} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} uiCopy={uiCopy} />
      </PageContainer>

      <PaymentReceiptModal isOpen={flow.receipt.receiptOpen} onClose={flow.receipt.closeReceipt} payment={flow.receipt.receiptPayment} />
      </div>

      {/* Render Modal outside the z-10 wrapper so it has full z-index context over the whole viewport */}
      <OrderDetailsModal isOpen={flow.modal.orderModalOpen} selectedOrderId={flow.modal.selectedOrder?.id} selectedOrder={flow.modal.selectedOrder} orderReviews={flow.reviews.orderReviews} reviewsLoading={flow.reviews.reviewsLoading} onClose={flow.modal.closeOrderModal} onOpenReceipt={flow.receipt.openReceipt} onReviewSuccess={flow.actions.handleReviewSuccess} viewMode={viewMode || flow.viewMode} />

      <ReviewModal isOpen={Boolean(flow?.reviewQuick?.isOpen && flow?.reviewQuick?.target?.orderItem)} onClose={() => flow?.reviewQuick?.close?.()} orderItem={flow?.reviewQuick?.target?.orderItem} fallbackOrderId={flow?.reviewQuick?.target?.orderId} onReviewCreated={payload => flow?.reviewQuick?.onReviewCreated?.(payload)} />
    </div>;
};
OrdersListLayout.Header = Header;
OrdersListLayout.Pagination = Pagination;
export default OrdersListLayout;