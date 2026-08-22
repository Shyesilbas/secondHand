import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_QUERY_KEYS } from '../../orderConstants.js';
import { orderService } from '../../services/orderService.js';
import { formatCurrency, resolveEnumLabel } from '../../../common/formatters.js';
import { ROUTES } from '../../../common/constants/routes.js';
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
import { getOrderStatusBadgeClass } from '../../utils/statusPresentation.js';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  CircleCheck,
  Clock,
  ExternalLink,
  Info,
  Layers,
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
  XCircle,
  ChevronRight
} from 'lucide-react';

const mergeUiCopy = partial => ({
  ...DEFAULT_UI_COPY,
  ...partial
});

const DEFAULT_UI_COPY = {
  locale: 'tr-TR',
  searchPlaceholder: 'Sipariş no ile ara…',
  searchSubmit: 'Ara',
  clear: 'Temizle',
  openFilters: 'Filtreler',
  pageSizeHint: 'Sayfa başı',
  tabAll: 'Tümü',
  tabPreparing: 'Hazırlanıyor',
  tabShipped: 'Kargoda',
  tabDelivered: 'Teslim Edildi',
  tabCancelled: 'İptal Edildi',
  totalLabel: 'Toplam Tutar',
  orderLabel: 'Sipariş',
  orderNumberPrefix: '#',
  orderCardTitleFallback: 'Siparişiniz',
  reviewDone: 'Değerlendirildi',
  reviewLabel: 'Değerlendirmeniz',
  reviewNow: 'Değerlendir',
  progressLabel: 'Sipariş Durumu',
  detail: 'Detaylar',
  trackShipment: 'Kargoyu Takip Et',
  reorder: 'Tekrar Satın Al',
  confirmReceipt: 'Teslim Alındı Onayla',
  qtyLabel: 'Adet',
  itemsSummary: n => n === 1 ? '1 ürün' : `${n} ürün`,
  nameBannerTitle: 'Siparişlerinizi İsimlendirin',
  nameBannerBody: 'Kalem simgesini kullanarak siparişlerinize hatırlatıcı isimler verebilirsiniz.',
  nameBannerOk: 'Anladım',
  escrowLabel: 'Güvence Havuzu (Escrow)',
  escrowHintPending: 'Sipariş tamamlandığında cüzdanınıza aktarılır',
  escrowHintEmpty: 'Bekleyen güvence bakiyesi yok',
  escrowByOrder: 'Sipariş Bazında',
  paginationShowing: (from, to, total) => `${total} siparişten ${from}–${to} arası gösteriliyor`,
  paginationPage: (p, t) => `Sayfa ${p} / ${t}`,
  paginationPrev: 'Önceki',
  paginationNext: 'Sonraki',
  paginationPerPage: n => `${n} / sayfa`,
  emptyShopping: 'Alışverişe Başla',
  startShopping: 'Alışverişe Başla'
};

const formatLongDate = (iso, locale) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale || 'tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

const statusKey = s => String(s || '').toUpperCase();

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

const btnToolbarIcon = 'inline-flex items-center justify-center rounded-2xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer';
const orderActionBtnBase = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 focus:outline-none shadow-xs active:scale-[0.98] cursor-pointer';

const Header = React.memo(({
  title,
  subtitle,
  showIndicator,
  onAnalytics,
  analyticsLabel = 'Analitik',
  onRefresh,
  loading,
  sticky
}) => {
  const { t } = useTranslation();
  const headerContent = (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
          {showIndicator ? <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shrink-0 shadow-xs" /> : null}
        </div>
        {subtitle ? <p className="text-xs text-slate-500 font-medium truncate">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onAnalytics ? (
          <button 
            type="button" 
            onClick={onAnalytics} 
            className={`${btnToolbarIcon} gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">{analyticsLabel}</span>
          </button>
        ) : null}
        {onRefresh ? (
          <button 
            type="button" 
            onClick={onRefresh} 
            disabled={loading} 
            className={`${btnToolbarIcon} p-2.5 disabled:opacity-40 disabled:pointer-events-none`} 
            title={t("refresh", "Yenile")}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        ) : null}
      </div>
    </div>
  );

  if (!sticky) {
    return <div className="mb-6">{headerContent}</div>;
  }
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs transition-all">
      <PageContainer className="py-4">{headerContent}</PageContainer>
    </div>
  );
});

const StatusTabs = React.memo(({
  statusFilter,
  setStatusFilter,
  uiCopy
}) => {
  const { t } = useTranslation();
  const tabs = useMemo(() => [
    { value: ORDER_STATUS_TAB_FILTER.ALL, label: uiCopy.tabAll },
    { value: ORDER_STATUS_TAB_FILTER.PREPARING, label: uiCopy.tabPreparing },
    { value: ORDER_STATUS_TAB_FILTER.SHIPPED, label: uiCopy.tabShipped },
    { value: ORDER_STATUS_TAB_FILTER.DELIVERED_GROUP, label: uiCopy.tabDelivered },
    { value: ORDER_STATUS_TAB_FILTER.CANCELLED, label: uiCopy.tabCancelled }
  ], [uiCopy]);

  return (
    <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 w-full lg:w-auto shadow-xs" role="tablist" aria-label={t("order_status_filters", "Sipariş durum filtreleri")}>
      {tabs.map(tab => {
        const active = (statusFilter || '') === (tab.value || '');
        return (
          <button
            key={tab.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            id={`orders-tab-${String(tab.value || 'all').replace(/\W+/g, '-')}`}
            onClick={() => setStatusFilter?.(tab.value)}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-slate-200/80 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
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
  const { t } = useTranslation();
  const {
    searchTerm,
    setSearchTerm,
    searchLoading,
    searchError,
    isSearchMode
  } = search;
  const filtersPopoverId = 'orders-list-page-size-popover';

  return (
    <div className="flex flex-col w-full sm:w-auto relative" role="search" aria-label={t("search_orders", "Sipariş ara")}>
      <div className="flex items-center gap-2 w-full">
        <form onSubmit={onSearch} className="flex items-center relative group w-full sm:w-64 transition-all duration-300 focus-within:w-full sm:focus-within:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors" strokeWidth={2.5} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={uiCopy.searchPlaceholder}
            disabled={searchLoading}
            aria-invalid={Boolean(searchError)}
            aria-describedby={searchError ? 'orders-search-error' : undefined}
            className="w-full pl-9 pr-9 py-2 rounded-2xl border border-slate-200/80 bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={isSearchMode ? onClearSearch : () => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={uiCopy.clear}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button type="submit" className="sr-only" disabled={searchLoading || !searchTerm.trim()}>{uiCopy.searchSubmit}</button>
        </form>
        <button
          type="button"
          onClick={() => setFiltersOpen(v => !v)}
          aria-expanded={filtersOpen}
          aria-controls={filtersPopoverId}
          className={`p-2.5 rounded-2xl border transition-all duration-200 shrink-0 shadow-xs cursor-pointer ${
            filtersOpen
              ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
              : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
          title={uiCopy.openFilters}
          aria-label={uiCopy.openFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
      {filtersOpen && !isSearchMode ? (
        <div className="absolute top-full right-0 mt-2 z-20 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg min-w-[220px]" id={filtersPopoverId} role="region" aria-label={uiCopy.pageSizeHint}>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{uiCopy.pageSizeHint}</span>
          <select
            className="px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 flex-1 cursor-pointer"
            value={pagination?.size ?? ORDER_DEFAULTS.INITIAL_PAGE_SIZE}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {uiCopy.paginationPerPage(option)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {searchError ? (
        <div id="orders-search-error" role="status" aria-live="polite" className="absolute top-full right-0 mt-2 z-20 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 shadow-lg max-w-xs">
          {searchError}
        </div>
      ) : null}
    </div>
  );
});

const OrderItemSkeleton = () => (
  <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs animate-pulse overflow-hidden">
    <div className="flex gap-4 sm:gap-6 items-start">
      <div className="flex -space-x-3 shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-200 border-2 border-white shadow-xs" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border-2 border-white shadow-xs" />
      </div>
      <div className="flex-1 space-y-3 min-w-0 pt-1">
        <div className="h-4 w-44 max-w-full bg-slate-200 rounded-lg" />
        <div className="h-5 w-24 bg-slate-100 rounded-full" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="shrink-0 text-right space-y-2 pt-1">
        <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
        <div className="h-7 w-24 bg-slate-200 rounded-xl ml-auto" />
      </div>
    </div>
  </div>
);

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

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200/80">
      <p className="text-xs text-slate-500 font-semibold tabular-nums">{uiCopy.paginationShowing(startItem, endItem, totalElements)}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || totalPages <= 1}
          className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200/80 bg-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 shadow-xs transition-all cursor-pointer"
        >
          {uiCopy.paginationPrev}
        </button>
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 tabular-nums px-2">
          {uiCopy.paginationPage(currentPage + 1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || totalPages <= 1}
          className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-900 bg-slate-900 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-40 shadow-xs transition-all cursor-pointer"
        >
          {uiCopy.paginationNext}
        </button>
        <span className="hidden sm:inline w-px h-5 bg-slate-200 mx-1" />
        <select
          className="px-3 py-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer transition-all"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {ORDER_DEFAULTS.PAGE_SIZE_OPTIONS.map(option => (
            <option key={option} value={option}>
              {uiCopy.paginationPerPage(option)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
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

  const { t } = useTranslation();
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

  const statusDotColor = {
    [ORDER_STATUSES.COMPLETED]: 'bg-emerald-500',
    [ORDER_STATUSES.DELIVERED]: 'bg-emerald-500',
    [ORDER_STATUSES.SHIPPED]: 'bg-blue-500',
    [ORDER_STATUSES.PROCESSING]: 'bg-amber-500',
    [ORDER_STATUSES.CONFIRMED]: 'bg-emerald-500',
    [ORDER_STATUSES.PENDING]: 'bg-slate-400',
    [ORDER_STATUSES.CANCELLED]: 'bg-rose-500',
    [ORDER_STATUSES.REFUNDED]: 'bg-rose-500',
    [ORDER_STATUSES.MEETUP_PENDING]: 'bg-amber-500',
    [ORDER_STATUSES.HANDOVER_CONFIRMED]: 'bg-emerald-500',
    [ORDER_STATUSES.VERIFICATION_LOCKED]: 'bg-purple-600'
  }[statusKey(order.status)] || 'bg-slate-400';

  let primaryAction = null;
  if (isBuyer) {
    if (isShipped) {
      primaryAction = (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onOpenOrder(order);
          }}
          className={`${orderActionBtnBase} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{uiCopy.trackShipment}</span>
        </button>
      );
    } else if (isDelivered) {
      primaryAction = (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onCompleteOrder(order.id, e);
          }}
          className={`${orderActionBtnBase} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          <CircleCheck className="w-3.5 h-3.5" />
          <span>{uiCopy.confirmReceipt}</span>
        </button>
      );
    } else if (isCompleted && !isReviewed) {
      primaryAction = (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (onOpenQuickReview) onOpenQuickReview(order);
            else onOpenOrder(order);
          }}
          className={`${orderActionBtnBase} bg-amber-500 text-slate-950 hover:bg-amber-400`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{uiCopy.reviewNow}</span>
        </button>
      );
    }
  }

  const accentBorder = {
    [ORDER_STATUSES.COMPLETED]: 'border-l-emerald-500',
    [ORDER_STATUSES.DELIVERED]: 'border-l-emerald-500',
    [ORDER_STATUSES.SHIPPED]: 'border-l-blue-500',
    [ORDER_STATUSES.PROCESSING]: 'border-l-amber-500',
    [ORDER_STATUSES.CONFIRMED]: 'border-l-emerald-400',
    [ORDER_STATUSES.PENDING]: 'border-l-slate-300',
    [ORDER_STATUSES.CANCELLED]: 'border-l-rose-500',
    [ORDER_STATUSES.REFUNDED]: 'border-l-rose-500',
    [ORDER_STATUSES.MEETUP_PENDING]: 'border-l-amber-500',
    [ORDER_STATUSES.HANDOVER_CONFIRMED]: 'border-l-emerald-500',
    [ORDER_STATUSES.VERIFICATION_LOCKED]: 'border-l-purple-600'
  }[statusKey(order.status)] || 'border-l-slate-300';

  return (
    <article
      tabIndex={isBuyer && editingOrderId === order.id ? -1 : 0}
      onClick={() => onOpenOrder(order)}
      onMouseEnter={handleMouseEnter}
      onKeyDown={e => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenOrder(order);
        }
      }}
      aria-label={`${order.name ? `${order.name}, ` : ''}${statusLabel}. ${formatLongDate(order.createdAt, uiCopy.locale)}`}
      className={`group relative rounded-3xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6 border-l-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${accentBorder}`}
    >
      {/* Thumbnails */}
      <div className="flex -space-x-3 shrink-0 relative z-10 self-center sm:self-start mt-0.5">
        {displayedItems.map((item, i) => (
          <div
            key={item.id || i}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white shadow-xs overflow-hidden bg-slate-50 relative group-hover:scale-105 transition-transform"
            style={{ zIndex: 30 - i * 10 }}
          >
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
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-white shadow-xs flex items-center justify-center bg-slate-100 relative z-0">
            <span className="text-xs font-extrabold text-slate-600">+{extraCount}</span>
          </div>
        )}
      </div>

      {/* Middle: Details */}
      <div className="flex-1 min-w-0 w-full relative z-10 flex flex-col gap-1.5">
        {isBuyer && editingOrderId === order.id ? (
          <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={editingOrderName}
              onChange={e => setEditingOrderName(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              className="w-40 sm:w-52 px-3 py-1.5 text-xs font-bold text-slate-900 border border-emerald-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white shadow-xs"
              placeholder={t("order_name", "Sipariş Adı")}
              maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH}
              autoFocus
            />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onSaveOrderName(order.id, e);
              }}
              className="p-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
              title={t("save", "Kaydet")}
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onCancelEditName();
              }}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title={t("cancel", "İptal")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900 tracking-tight truncate max-w-[200px] sm:max-w-xs">
              {order.name || uiCopy.orderCardTitleFallback}
            </span>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${getOrderStatusBadgeClass(order.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor} ${order.status === ORDER_STATUSES.PROCESSING ? 'animate-pulse' : ''}`} aria-hidden />
              {statusLabel}
            </span>

            {isBuyer ? (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onStartEditName(order, e);
                }}
                className="p-1 text-slate-300 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title={t("rename_order", "Siparişi İsimlendir")}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        )}

        {/* Meta: date & count */}
        <div className="flex items-center gap-2 text-xs text-slate-400 tabular-nums font-medium">
          <time dateTime={order.createdAt || undefined}>{formatLongDate(order.createdAt, uiCopy.locale)}</time>
          <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" aria-hidden />
          <span>{uiCopy.itemsSummary ? uiCopy.itemsSummary(items.length) : `${items.length} ürün`}</span>
        </div>

        {/* Order number */}
        <p className="text-[11px] text-slate-400 font-mono font-bold tracking-tight">
          #{order.orderNumber}
        </p>
      </div>

      {/* Right: Price & Actions */}
      <div className="shrink-0 flex z-10 mt-1 sm:mt-0 w-full sm:w-auto flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{uiCopy.totalLabel}</span>
          <span className={`text-lg sm:text-xl font-extrabold font-mono tabular-nums tracking-tight mt-0.5 ${isCompleted ? 'text-emerald-700' : 'text-slate-900'}`}>
            {formatCurrency(displayTotal, currency)}
          </span>
        </div>

        <div className="shrink-0" onClick={e => e.stopPropagation()}>
          {primaryAction ? (
            primaryAction
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-emerald-700 transition-colors" aria-hidden>
              <span>{uiCopy.detail}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
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
  const { t } = useTranslation();
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

  const topSlot = isSellerView && !flow.escrow.isLoading ? (
    <div className={`p-5 rounded-3xl border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-50/60 border-slate-200/60'}`}>
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{uiCopy.escrowLabel}</span>
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
              {formatCurrency(flow.escrow.pendingEscrowAmount)}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-0">
            {flow.escrow.pendingEscrowAmount > 0 ? uiCopy.escrowHintPending : uiCopy.escrowHintEmpty}
          </p>

          {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{uiCopy.escrowByOrder}</div>
              {flow.orders.filter(order => (parseFloat(order.escrowAmount) || 0) > 0).map(order => {
                const escrowAmt = parseFloat(order.escrowAmount) || 0;
                const deliveredAt = order.shipping?.deliveredAt;
                const autoReleaseDate = deliveredAt ? new Date(new Date(deliveredAt).getTime() + ORDER_TIME.DELIVERY_CONFIRMATION_WINDOW_MS) : null;
                const now = new Date();
                const isAutoReleased = autoReleaseDate && now >= autoReleaseDate;
                let tooltipText;
                if (!deliveredAt) tooltipText = 'Teslimattan 72 saat sonra onaylanır.';
                else if (isAutoReleased) tooltipText = 'Otomatik aktarıldı.';
                else {
                  const diffMs = autoReleaseDate - now;
                  const h = Math.ceil(diffMs / (60 * 60 * 1000));
                  tooltipText = `~${h} saat içinde aktarılacak.`;
                }
                return (
                  <div key={order.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => flow.modal.openOrderModal(order)}
                        className="text-slate-700 hover:text-emerald-700 font-bold truncate max-w-[14rem] text-left cursor-pointer"
                      >
                        {order.name || uiCopy.orderCardTitleFallback}
                      </button>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 w-48 p-2 bg-slate-900 text-white text-[10px] font-medium rounded-xl shadow-lg">
                          {tooltipText}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold font-mono text-slate-900">{formatCurrency(escrowAmt, order.currency)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50/50 relative pb-20 font-sans">
      <Header
        title={title}
        subtitle={subtitle}
        showIndicator={computedShowIndicator}
        onAnalytics={onAnalytics}
        analyticsLabel={analyticsLabel}
        onRefresh={flow.refreshAll}
        loading={flow.loading}
        sticky={stickyHeader}
      />

      <PageContainer className={containerClassName || 'py-6'}>
        {banner ? (
          <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{uiCopy.nameBannerTitle}</span>
            <button
              onClick={flow.ui.dismissNameBanner}
              className="ml-2 p-0.5 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null}
        
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}

        {/* Segmented Delivery Method Switcher */}
        <div className="mb-6 flex p-1 rounded-2xl bg-slate-200/60 border border-slate-200/80 max-w-md shadow-xs">
          {['ALL', 'CARGO', 'SAFE_MEETUP'].map(method => {
            const isActive = deliveryMethodFilter === method;
            const label = {
              ALL: t("all_orders_tab", "Tüm Siparişler"),
              CARGO: t("shipping_orders_tab", "Kargo Teslimatı"),
              SAFE_MEETUP: t("safe_meetup_orders_tab", "Güvenli Buluşma")
            }[method];
            return (
              <button
                key={method}
                type="button"
                onClick={() => setDeliveryMethodFilter(method)}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {flow.search ? (
          <>
            <div className="mb-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-3 rounded-3xl border border-slate-200/80 shadow-xs">
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
            {topListSummarySlice ? (
              <div className="flex justify-end -mt-3 mb-4 px-2">
                <p className="text-xs text-slate-400 font-semibold tabular-nums">
                  {uiCopy.paginationShowing(topListSummarySlice.startItem, topListSummarySlice.endItem, topListSummarySlice.totalElements)}
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        {flow.loading ? (
          <div className="space-y-3.5">
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => <OrderItemSkeleton key={i} />)}
          </div>
        ) : !displayedOrders?.length && !flow.search?.isSearchMode ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-white shadow-xs relative overflow-hidden">
            <div className="relative flex flex-col items-center max-w-sm mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 shadow-xs">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">{emptyText || (isSellerView ? 'Henüz satışınız yok' : 'Henüz siparişiniz bulunmuyor')}</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                {isSellerView ? 'Satışa çıkardığınız ürünler alıcı bulduğunda burada listelenecektir.' : 'Binlerce avantajlı ikinci el ilanı keşfedin ve ilk siparişinizi oluşturun.'}
              </p>
              {isBuyerView && emptyAction ? (
                <button
                  type="button"
                  onClick={emptyAction}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-700 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {uiCopy.startShopping}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {(displayedOrders || []).map(order => (
              <div key={order.id} id={order.id != null ? `order-card-${order.id}` : undefined}>
                <UnifiedOrderItem
                  viewMode={viewMode || flow.viewMode}
                  order={order}
                  enums={enums}
                  onOpenOrder={flow.modal.openOrderModal}
                  onOpenQuickReview={flow.reviewQuick?.openForOrder}
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
      </PageContainer>

      <PaymentReceiptModal
        isOpen={flow.receipt.receiptOpen}
        onClose={flow.receipt.closeReceipt}
        payment={flow.receipt.receiptPayment}
      />

      <OrderDetailsModal
        isOpen={flow.modal.orderModalOpen}
        selectedOrderId={flow.modal.selectedOrder?.id}
        selectedOrder={flow.modal.selectedOrder}
        orderReviews={flow.reviews.orderReviews}
        reviewsLoading={flow.reviews.reviewsLoading}
        onClose={flow.modal.closeOrderModal}
        onOpenReceipt={flow.receipt.openReceipt}
        onReviewSuccess={flow.actions.handleReviewSuccess}
        viewMode={viewMode || flow.viewMode}
      />

      <ReviewModal
        isOpen={Boolean(flow?.reviewQuick?.isOpen && flow?.reviewQuick?.target?.orderItem)}
        onClose={() => flow?.reviewQuick?.close?.()}
        orderItem={flow?.reviewQuick?.target?.orderItem}
        fallbackOrderId={flow?.reviewQuick?.target?.orderId}
        onReviewCreated={payload => flow?.reviewQuick?.onReviewCreated?.(payload)}
      />
    </div>
  );
};

OrdersListLayout.Header = Header;
OrdersListLayout.Pagination = Pagination;
export default OrdersListLayout;