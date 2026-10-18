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
import { getOrderStatusDotClass } from '../../utils/statusPresentation.js';
import Button, { buttonClasses } from '../../../common/components/ui/Button.jsx';
import DataPagination from '../../../common/components/ui/DataPagination.jsx';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import {
 BarChart3,
 Check,
 ChevronRight,
 CircleCheck,
 Info,
 Package,
 Pencil,
 RefreshCw,
 Search,
 SlidersHorizontal,
 Star,
 Truck,
 X
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
 <h1 className="truncate text-2xl font-semibold text-text-primary">{title}</h1>
 {showIndicator ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-error" aria-hidden /> : null}
 </div>
 {subtitle ? <p className="truncate text-sm text-text-secondary">{subtitle}</p> : null}
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {onAnalytics ? (
 <Button variant="secondary" size="sm" onClick={onAnalytics}>
 <BarChart3 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
 <span className="hidden sm:inline">{analyticsLabel}</span>
 </Button>
 ) : null}
 {onRefresh ? (
 <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading} aria-label={t("refresh", "Yenile")}>
 <RefreshCw className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} strokeWidth={1.5} />
 </Button>
 ) : null}
 </div>
 </div>
 );

 if (!sticky) {
 return <div className="mb-6">{headerContent}</div>;
 }
 return (
 <div className="sticky top-0 z-30 border-b border-border bg-background-primary">
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
 <div className="flex w-full flex-wrap gap-1 rounded bg-background-tertiary p-1 lg:w-auto" role="tablist" aria-label={t("order_status_filters", "Sipariş durum filtreleri")}>
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
 className={`flex-1 rounded px-3 py-1.5 text-sm transition-colors duration-150 sm:flex-none ${
 active
 ? 'bg-background-primary font-medium text-text-primary'
 : 'text-text-secondary hover:text-text-primary'
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
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
 <input
 type="text"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 placeholder={uiCopy.searchPlaceholder}
 disabled={searchLoading}
 aria-invalid={Boolean(searchError)}
 aria-describedby={searchError ? 'orders-search-error' : undefined}
 aria-label={uiCopy.searchPlaceholder}
 className="h-10 w-full rounded border border-border bg-background-primary pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
 />
 {searchTerm ? (
 <button
 type="button"
 onClick={onClearSearch}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary rounded hover:bg-background-tertiary transition-colors cursor-pointer"
 aria-label={uiCopy.clear}
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 ) : null}
 <button type="submit" className="sr-only" disabled={searchLoading || !searchTerm.trim()}>{uiCopy.searchSubmit}</button>
 </form>
 <button
 type="button"
 onClick={() => setFiltersOpen(v => !v)}
 aria-expanded={filtersOpen}
 aria-controls={filtersPopoverId}
 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-colors duration-150 ${
 filtersOpen
 ? 'border-primary text-text-primary'
 : 'border-border bg-background-primary text-text-secondary hover:bg-background-secondary'
 }`}
 title={uiCopy.openFilters}
 aria-label={uiCopy.openFilters}
 >
 <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 {filtersOpen && !isSearchMode ? (
 <div className="absolute right-0 top-full z-20 mt-2 flex min-w-56 items-center gap-3 rounded border border-border bg-background-primary px-4 py-3 shadow-sm" id={filtersPopoverId} role="region" aria-label={uiCopy.pageSizeHint}>
 <span className="text-sm text-text-secondary">{uiCopy.pageSizeHint}</span>
 <select
 aria-label={uiCopy.pageSizeHint}
 className="h-9 flex-1 rounded border border-border bg-background-primary px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
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
 <div id="orders-search-error" role="status" aria-live="polite" className="absolute right-0 top-full z-20 mt-2 max-w-xs rounded border border-border bg-background-primary px-4 py-2.5 text-sm text-status-error-text shadow-sm">
 {searchError}
 </div>
 ) : null}
 </div>
 );
});

const OrderItemSkeleton = () => (
 <div className="flex items-start gap-4 rounded border border-border bg-background-primary p-5">
 <Skeleton className="h-16 w-16 shrink-0" />
 <div className="flex-1 space-y-3 pt-1">
 <Skeleton className="h-4 w-44 max-w-full" />
 <Skeleton className="h-4 w-32" />
 </div>
 <Skeleton className="h-6 w-24 shrink-0" />
 </div>
);

const OrdersPagination = ({ pagination, hidden, onPageChange, onPageSizeChange }) => {
 const slice = hidden ? null : getListPaginationSlice(pagination);
 if (!slice) return null;
 return (
 <DataPagination
 shouldShowPagination
 currentPage={slice.currentPage}
 totalPages={slice.totalPages}
 startItem={slice.startItem}
 endItem={slice.endItem}
 totalItems={slice.totalElements}
 pageSize={slice.pageSize}
 pageSizeOptions={ORDER_DEFAULTS.PAGE_SIZE_OPTIONS}
 onPageChange={onPageChange}
 onPageSizeChange={onPageSizeChange}
 />
 );
};

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
 className={buttonClasses('primary', 'sm')}
 >
 <Truck className="h-4 w-4" strokeWidth={1.5} aria-hidden />
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
 className={buttonClasses('primary', 'sm')}
 >
 <CircleCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden />
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
 className={buttonClasses('secondary', 'sm')}
 >
 <Star className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 <span>{uiCopy.reviewNow}</span>
 </button>
 );
 }
 }

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
 className="group relative flex cursor-pointer flex-col items-start gap-4 overflow-hidden rounded border border-border bg-background-primary p-5 transition-colors duration-150 hover:border-card-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:flex-row sm:gap-6"
 >
 {/* Thumbnails */}
 <div className="flex -space-x-3 shrink-0 relative z-10 self-center sm:self-start mt-0.5">
 {displayedItems.map((item, i) => (
 <div
 key={item.id || i}
 className="relative h-14 w-14 overflow-hidden rounded border-2 border-background-primary bg-background-secondary sm:h-16 sm:w-16"
 style={{ zIndex: 30 - i * 10 }}
 >
 {item.listing?.imageUrl ? (
 <img src={item.listing.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center">
 <Package className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
 </div>
 )}
 </div>
 ))}
 {extraCount > 0 && (
 <div className="relative z-0 flex h-14 w-14 items-center justify-center rounded border-2 border-background-primary bg-background-tertiary sm:h-16 sm:w-16">
 <span className="text-sm tabular-nums text-text-secondary">+{extraCount}</span>
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
 aria-label={t("order_name", "Sipariş Adı")}
 className="h-9 w-40 rounded border border-border-focus bg-background-primary px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus sm:w-52"
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
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 w-9"
 aria-label={t("save", "Kaydet")}
 >
 <Check className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <button
 type="button"
 onClick={e => {
 e.stopPropagation();
 onCancelEditName();
 }}
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3 w-9"
 aria-label={t("cancel", "İptal")}
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 ) : (
 <div className="flex flex-wrap items-center gap-2">
 <span className="max-w-xs truncate text-sm font-medium text-text-primary">
 {order.name || items[0]?.listing?.title || uiCopy.orderCardTitleFallback}
 </span>

 <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
 <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getOrderStatusDotClass(order.status)}`} aria-hidden />
 {statusLabel}
 </span>

 {isBuyer ? (
 <button
 type="button"
 onClick={e => {
 e.stopPropagation();
 onStartEditName(order, e);
 }}
 className="rounded p-1 text-text-muted opacity-0 transition-opacity duration-150 hover:text-text-primary focus-visible:opacity-100 group-hover:opacity-100"
 aria-label={t("rename_order", "Siparişi İsimlendir")}
 >
 <Pencil className="h-4 w-4" strokeWidth={1.5} />
 </button>
 ) : null}
 </div>
 )}

 {order.createdAt ? (
 <time
 dateTime={order.createdAt}
 className="text-sm tabular-nums text-text-tertiary"
 >
 {formatLongDate(order.createdAt, uiCopy.locale)}
 </time>
 ) : null}
 </div>

 {/* Right: Price & Actions */}
 <div className="shrink-0 flex z-10 mt-1 sm:mt-0 w-full sm:w-auto flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
 <div className="flex flex-col items-start sm:items-end">
 <span className="text-sm text-text-tertiary">{uiCopy.totalLabel}</span>
 <span className="mt-0.5 text-lg font-semibold tabular-nums text-text-primary">
 {formatCurrency(displayTotal, currency)}
 </span>
 </div>

 <div className="shrink-0" onClick={e => e.stopPropagation()}>
 {primaryAction ? (
 primaryAction
 ) : (
 <span className="inline-flex items-center gap-1 text-sm text-text-tertiary transition-colors group-hover:text-text-primary" aria-hidden>
 <span>{uiCopy.detail}</span>
 <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
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
 <div className="rounded border border-border bg-background-primary p-5">
 <div>
 <div className="min-w-0">
 <div className="flex items-baseline gap-2 mb-0.5">
 <span className="text-sm text-text-secondary">{uiCopy.escrowLabel}</span>
 <span className={`text-xl font-semibold tabular-nums ${flow.escrow.pendingEscrowAmount > 0 ? 'text-text-primary' : 'text-text-muted'}`}>
 {formatCurrency(flow.escrow.pendingEscrowAmount)}
 </span>
 </div>
 <p className="text-sm text-text-tertiary">
 {flow.escrow.pendingEscrowAmount > 0 ? uiCopy.escrowHintPending : uiCopy.escrowHintEmpty}
 </p>

 {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
 <div className="mt-4 pt-3 border-t border-border-light space-y-2">
 <div className="text-sm text-text-secondary">{uiCopy.escrowByOrder}</div>
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
 <div key={order.id} className="flex items-center justify-between text-sm">
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 onClick={() => flow.modal.openOrderModal(order)}
 className="max-w-56 truncate text-left text-text-secondary hover:text-text-primary"
 >
 {order.name || uiCopy.orderCardTitleFallback}
 </button>
 <div className="relative group">
 <Info className="h-4 w-4 cursor-help text-text-muted" strokeWidth={1.5} aria-label={tooltipText} />
 <div className="invisible absolute bottom-full left-0 z-50 mb-2 w-48 rounded bg-primary p-2 text-xs text-white opacity-0 shadow-sm group-hover:visible group-hover:opacity-100">
 {tooltipText}
 </div>
 </div>
 </div>
 <span className="font-medium tabular-nums text-text-primary">{formatCurrency(escrowAmt, order.currency)}</span>
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
 <div className="relative min-h-screen bg-background-secondary pb-20">
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
 <div className="mb-5 flex items-center gap-2 text-sm text-text-secondary">
 <span>{uiCopy.nameBannerTitle}</span>
 <button
 type="button"
 onClick={flow.ui.dismissNameBanner}
 aria-label={uiCopy.nameBannerOk}
 className="rounded p-1 text-text-muted transition-colors hover:text-text-primary"
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 ) : null}
 
 {topSlot ? <div className="mb-6">{topSlot}</div> : null}

 {/* Segmented Delivery Method Switcher */}
 <div className="mb-6 flex max-w-md rounded bg-background-tertiary p-1">
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
 aria-pressed={isActive}
 className={`flex-1 rounded py-2 text-sm transition-colors duration-150 ${
 isActive
 ? 'bg-background-primary font-medium text-text-primary'
 : 'text-text-secondary hover:text-text-primary'
 }`}
 >
 {label}
 </button>
 );
 })}
 </div>

 {flow.search ? (
 <>
 <div className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded border border-border bg-background-primary p-3 lg:flex-row lg:items-center">
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
 <p className="text-sm tabular-nums text-text-tertiary">
 {uiCopy.paginationShowing(topListSummarySlice.startItem, topListSummarySlice.endItem, topListSummarySlice.totalElements)}
 </p>
 </div>
 ) : null}
 </>
 ) : null}

 {flow.loading ? (
 <div className="space-y-3.5">
 {(isSellerView ? ['a', 'b'] : ['a', 'b', 'c']).map(k => <OrderItemSkeleton key={k} />)}
 </div>
 ) : flow.error ? (
 <div role="alert" className="flex flex-col items-start gap-3 rounded border border-border bg-background-primary p-5 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-status-error-text">{flow.error}</p>
 <Button variant="secondary" size="sm" onClick={flow.refreshAll}>{t("try_again", "Try again")}</Button>
 </div>
 ) : !displayedOrders?.length && !flow.search?.isSearchMode ? (
 <EmptyState
 icon={Package}
 title={emptyText || (isSellerView ? 'Henüz satışınız yok' : 'Henüz siparişiniz bulunmuyor')}
 description={isSellerView ? 'Satışa çıkardığınız ürünler alıcı bulduğunda burada listelenecektir.' : 'Binlerce avantajlı ikinci el ilanı keşfedin ve ilk siparişinizi oluşturun.'}
 primaryAction={isBuyerView && emptyAction ? { label: uiCopy.startShopping, onClick: emptyAction } : undefined}
 className="py-16"
 />
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
 onCompleteOrder={flow.actions.completeOrder}
 onReorder={onReorderListing}
 editingOrderId={flow.ui.editingOrderId}
 editingOrderName={flow.ui.editingOrderName}
 setEditingOrderName={flow.ui.setEditingOrderName}
 onStartEditName={flow.actions.startEditOrderName}
 onCancelEditName={flow.actions.cancelEditOrderName}
 onSaveOrderName={flow.actions.saveOrderName}
 uiCopy={uiCopy}
 isReviewed={Boolean(flow.reviews.reviewedOrderSummaries[order.id])}
 />
 </div>
 ))}
 </div>
 )}

 <OrdersPagination
 pagination={flow.pagination}
 hidden={flow.search?.isSearchMode || flow.loading}
 onPageChange={onPageChange}
 onPageSizeChange={onPageSizeChange}
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

export default OrdersListLayout;