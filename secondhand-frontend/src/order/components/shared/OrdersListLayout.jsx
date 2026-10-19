import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo } from 'react';
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
 ChevronDown,
 ChevronRight,
 CircleCheck,
 Package,
 Pencil,
 RefreshCw,
 Search,
 Star,
 Truck,
 X
} from 'lucide-react';

// Header and list share one column width so the title lines up with the cards.
const LIST_WIDTH = 'max-w-4xl';

const useOrdersCopy = () => {
 const { t, i18n } = useTranslation();
 return useMemo(() => ({
 locale: i18n.language?.startsWith('tr') ? 'tr-TR' : 'en-US',
 searchPlaceholder: t('orders_ui_search_placeholder', 'Sipariş no ile ara…'),
 searchSubmit: t('orders_ui_search_submit', 'Ara'),
 clear: t('orders_ui_clear', 'Temizle'),
 tabAll: t('orders_ui_tab_all', 'Tümü'),
 tabPreparing: t('orders_ui_tab_preparing', 'Hazırlanıyor'),
 tabShipped: t('orders_ui_tab_shipped', 'Kargoda'),
 tabDelivered: t('orders_ui_tab_delivered', 'Teslim Edildi'),
 tabCancelled: t('orders_ui_tab_cancelled', 'İptal Edildi'),
 deliveryLabel: t('orders_ui_delivery_label', 'Teslimat yöntemi'),
 deliveryAll: t('orders_ui_delivery_all', 'Tüm teslimatlar'),
 deliveryCargo: t('orders_ui_delivery_cargo', 'Kargo'),
 deliveryMeetup: t('orders_ui_delivery_meetup', 'Güvenli buluşma'),
 totalLabel: t('orders_ui_total', 'Toplam tutar'),
 orderCardTitleFallback: t('orders_ui_title_fallback', 'Siparişiniz'),
 reviewNow: t('orders_ui_review_now', 'Değerlendir'),
 detail: t('orders_ui_detail', 'Detaylar'),
 trackShipment: t('orders_ui_track_shipment', 'Kargoyu takip et'),
 confirmReceipt: t('orders_ui_confirm_receipt', 'Teslim alındı onayla'),
 nameBannerTitle: t('orders_ui_name_banner', 'Kalem simgesiyle siparişlerinize hatırlatıcı isimler verebilirsiniz.'),
 nameBannerOk: t('orders_ui_name_banner_ok', 'Anladım'),
 escrowLabel: t('orders_ui_escrow_label', 'Güvence havuzu (escrow)'),
 escrowHintPending: t('orders_ui_escrow_pending', 'Sipariş tamamlandığında cüzdanınıza aktarılır'),
 escrowHintEmpty: t('orders_ui_escrow_empty', 'Bekleyen güvence bakiyesi yok'),
 escrowByOrder: t('orders_ui_escrow_by_order', 'Sipariş bazında'),
 escrowAwaitingDelivery: t('orders_ui_escrow_awaiting_delivery', 'Teslimattan 72 saat sonra onaylanır.'),
 escrowReleased: t('orders_ui_escrow_released', 'Otomatik aktarıldı.'),
 escrowReleasesIn: hours => t('orders_ui_escrow_releases_in', { defaultValue: '~{{hours}} saat içinde aktarılacak.', hours }),
 startShopping: t('orders_ui_start_shopping', 'Alışverişe başla'),
 filteredEmptyTitle: t('orders_ui_filtered_empty_title', 'Bu filtreyle eşleşen sipariş yok'),
 filteredEmptyBody: t('orders_ui_filtered_empty_body', 'Başka bir durum ya da teslimat yöntemi deneyin.'),
 clearFilters: t('orders_ui_clear_filters', 'Filtreleri temizle')
 }), [t, i18n.language]);
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
 <PageContainer className={`py-4 ${LIST_WIDTH}`}>{headerContent}</PageContainer>
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
 <div className="-mb-px flex overflow-x-auto" role="tablist" aria-label={t("order_status_filters", "Sipariş durumu filtreleri")}>
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
 className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors duration-150 ${
 active
 ? 'border-primary font-medium text-text-primary'
 : 'border-transparent text-text-secondary hover:text-text-primary'
 }`}
 >
 {tab.label}
 </button>
 );
 })}
 </div>
 );
});

const DeliverySelect = ({ value, onChange, uiCopy }) => (
 <select
 aria-label={uiCopy.deliveryLabel}
 value={value}
 onChange={e => onChange(e.target.value)}
 className="h-10 shrink-0 rounded border border-border bg-background-primary px-3 text-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
 >
 <option value="ALL">{uiCopy.deliveryAll}</option>
 <option value="CARGO">{uiCopy.deliveryCargo}</option>
 <option value="SAFE_MEETUP">{uiCopy.deliveryMeetup}</option>
 </select>
);

const SearchToolbar = React.memo(({
 search,
 onSearch,
 onClearSearch,
 uiCopy
}) => {
 const { t } = useTranslation();
 const {
 searchTerm,
 setSearchTerm,
 searchLoading,
 searchError
 } = search;

 return (
 <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none" role="search" aria-label={t("search_orders", "Siparişlerde ara")}>
 <form onSubmit={onSearch} className="relative flex items-center">
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
 className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-text-muted transition-colors hover:bg-background-tertiary hover:text-text-secondary"
 aria-label={uiCopy.clear}
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 ) : null}
 <button type="submit" className="sr-only" disabled={searchLoading || !searchTerm.trim()}>{uiCopy.searchSubmit}</button>
 </form>
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
 isReviewed,
 highlighted
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
 className={buttonClasses('secondary', 'sm')}
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
 className={buttonClasses('secondary', 'sm')}
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
 className={`group relative flex cursor-pointer flex-col items-start gap-4 overflow-hidden rounded border bg-background-primary p-5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:flex-row sm:gap-6 ${highlighted ? 'border-primary' : 'border-border hover:border-card-border-hover'}`}
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
 <Button
 size="sm"
 className="w-9"
 onClick={e => {
 e.stopPropagation();
 onSaveOrderName(order.id, e);
 }}
 aria-label={t("save", "Kaydet")}
 >
 <Check className="h-4 w-4" strokeWidth={1.5} />
 </Button>
 <Button
 variant="secondary"
 size="sm"
 className="w-9"
 onClick={e => {
 e.stopPropagation();
 onCancelEditName();
 }}
 aria-label={t("cancel", "İptal")}
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </Button>
 </div>
 ) : (
 <div className="flex flex-wrap items-center gap-2">
 <span className="max-w-xs truncate text-sm font-medium text-text-primary">
 {order.name || items[0]?.listing?.title || uiCopy.orderCardTitleFallback}
 </span>

 {isBuyer ? (
 <button
 type="button"
 onClick={e => {
 e.stopPropagation();
 onStartEditName(order, e);
 }}
 className="-m-2.5 rounded p-2.5 text-text-muted transition-colors duration-150 hover:text-text-primary"
 aria-label={t("rename_order", "Siparişi İsimlendir")}
 >
 <Pencil className="h-4 w-4" strokeWidth={1.5} />
 </button>
 ) : null}
 </div>
 )}

 <div className="flex flex-wrap items-center gap-x-2 text-sm">
 <span className="inline-flex items-center gap-1.5 text-text-secondary">
 <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getOrderStatusDotClass(order.status)}`} aria-hidden />
 {statusLabel}
 </span>
 {order.createdAt ? (
 <>
 <span className="text-text-muted" aria-hidden>·</span>
 <time dateTime={order.createdAt} className="tabular-nums text-text-tertiary">
 {formatLongDate(order.createdAt, uiCopy.locale)}
 </time>
 </>
 ) : null}
 </div>
 </div>

 {/* Right: Price & Actions */}
 <div className="shrink-0 flex z-10 mt-1 sm:mt-0 w-full sm:w-auto flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
 <div className="flex flex-col items-start sm:items-end">
 <span className="sr-only">{uiCopy.totalLabel}</span>
 <span className="text-lg font-semibold tabular-nums text-text-primary">
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
 highlightOrderId
}) => {
 const { t } = useTranslation();
 const uiCopy = useOrdersCopy();
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
 const hasActiveFilter = Boolean(flow.search.statusFilter) || deliveryMethodFilter !== 'ALL';
 const clearFilters = () => {
 flow.search.setStatusFilter(ORDER_STATUS_TAB_FILTER.ALL);
 setDeliveryMethodFilter('ALL');
 };

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

 const escrowRows = useMemo(() => (flow.orders || []).filter(order => (parseFloat(order.escrowAmount) || 0) > 0), [flow.orders]);
 const escrowHint = order => {
 const deliveredAt = order.shipping?.deliveredAt;
 if (!deliveredAt) return uiCopy.escrowAwaitingDelivery;
 const releaseAt = new Date(deliveredAt).getTime() + ORDER_TIME.DELIVERY_CONFIRMATION_WINDOW_MS;
 const diffMs = releaseAt - Date.now();
 if (diffMs <= 0) return uiCopy.escrowReleased;
 return uiCopy.escrowReleasesIn(Math.ceil(diffMs / (60 * 60 * 1000)));
 };

 const pendingEscrow = flow.escrow.pendingEscrowAmount;
 const topSlot = isSellerView && !flow.escrow.isLoading ? (
 <div className="rounded border border-border bg-background-primary p-5">
 <div className="flex items-baseline gap-2">
 <span className="text-sm text-text-secondary">{uiCopy.escrowLabel}</span>
 <span className={`text-xl font-semibold tabular-nums ${pendingEscrow > 0 ? 'text-text-primary' : 'text-text-muted'}`}>
 {formatCurrency(pendingEscrow)}
 </span>
 </div>
 <p className="mt-0.5 text-sm text-text-tertiary">
 {pendingEscrow > 0 ? uiCopy.escrowHintPending : uiCopy.escrowHintEmpty}
 </p>

 {pendingEscrow > 0 && escrowRows.length > 0 ? (
 <details className="group mt-4 border-t border-border-light pt-3">
 <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-text-secondary hover:text-text-primary">
 <span>{uiCopy.escrowByOrder} ({escrowRows.length})</span>
 <ChevronDown className="h-4 w-4 transition-transform duration-150 group-open:rotate-180" strokeWidth={1.5} aria-hidden />
 </summary>
 <ul className="mt-3 space-y-3">
 {escrowRows.map(order => (
 <li key={order.id} className="flex items-start justify-between gap-4 text-sm">
 <div className="min-w-0">
 <button
 type="button"
 onClick={() => flow.modal.openOrderModal(order)}
 className="block max-w-full truncate text-left text-text-secondary hover:text-text-primary"
 >
 {order.name || uiCopy.orderCardTitleFallback}
 </button>
 <p className="text-text-tertiary">{escrowHint(order)}</p>
 </div>
 <span className="shrink-0 font-medium tabular-nums text-text-primary">{formatCurrency(parseFloat(order.escrowAmount) || 0, order.currency)}</span>
 </li>
 ))}
 </ul>
 </details>
 ) : null}
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

 <PageContainer className={containerClassName || `py-6 ${LIST_WIDTH}`}>
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

 <div className="mb-6 flex flex-col gap-3 border-b border-border-light lg:flex-row lg:items-end lg:justify-between">
 <StatusTabs statusFilter={flow.search.statusFilter} setStatusFilter={flow.search.setStatusFilter} uiCopy={uiCopy} />
 <div className="flex items-center gap-2 pb-3">
 <DeliverySelect value={deliveryMethodFilter} onChange={setDeliveryMethodFilter} uiCopy={uiCopy} />
 <SearchToolbar
 search={flow.search}
 onSearch={flow.search.handleSearch}
 onClearSearch={flow.search.clearSearch}
 uiCopy={uiCopy}
 />
 </div>
 </div>

 {flow.loading ? (
 <div className="space-y-3.5">
 {(isSellerView ? ['a', 'b'] : ['a', 'b', 'c']).map(k => <OrderItemSkeleton key={k} />)}
 </div>
 ) : flow.error ? (
 <div role="alert" className="flex flex-col items-start gap-3 rounded border border-border bg-background-primary p-5 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm text-status-error-text">{flow.error}</p>
 <Button variant="secondary" size="sm" onClick={flow.refreshAll}>{t("try_again", "Try again")}</Button>
 </div>
 ) : !displayedOrders.length ? (
 hasActiveFilter ? (
 <EmptyState
 icon={Search}
 title={uiCopy.filteredEmptyTitle}
 description={uiCopy.filteredEmptyBody}
 primaryAction={{ label: uiCopy.clearFilters, onClick: clearFilters }}
 className="py-16"
 />
 ) : (
 <EmptyState
 icon={Package}
 title={emptyText}
 description={isSellerView ? t('orders_ui_empty_seller_body', 'Satışa çıkardığınız ürünler alıcı bulduğunda burada listelenecektir.') : t('orders_ui_empty_buyer_body', 'Binlerce avantajlı ikinci el ilanı keşfedin ve ilk siparişinizi oluşturun.')}
 primaryAction={isBuyerView && emptyAction ? { label: uiCopy.startShopping, onClick: emptyAction } : undefined}
 className="py-16"
 />
 )
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
 highlighted={highlightOrderId != null && String(order.id) === String(highlightOrderId)}
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