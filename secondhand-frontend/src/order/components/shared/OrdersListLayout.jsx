import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ORDER_QUERY_KEYS, hasOrderAction } from '../../orderConstants.js';
import { orderService } from '../../services/orderService.js';
import { formatCurrency, formatLongDate, resolveEnumLabel } from '../../../common/formatters.js';
import { ROUTES } from '../../../common/constants/routes.js';
import { optimizeCloudinaryUrl } from '../../../common/utils/imageOptimizer.js';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import ReviewModal from '../../../reviews/components/ReviewModal.jsx';
import {
    ORDER_ACTIONS,
    ORDER_DEFAULTS,
    ORDER_LIST_TABS,
    ORDER_STATUSES,
    ORDER_TIME,
    ORDER_VIEW_MODES,
    SELLER_TO_SHIP_STATUSES
} from '../../constants/orderUiConstants.js';
import { getOrderStatusBadgeClass, getOrderStatusDotClass } from '../../utils/statusPresentation.js';
import Button, { buttonClasses } from '../../../common/components/ui/Button.jsx';
import DataPagination from '../../../common/components/ui/DataPagination.jsx';
import EmptyState from '../../../common/components/ui/EmptyState.jsx';
import Skeleton from '../../../common/components/ui/Skeleton.jsx';
import Alert from '../../../common/components/ui/Alert.jsx';
import {
    BarChart3,
    ChevronRight,
    CircleCheck,
    Clock,
    KeyRound,
    Package,
    RefreshCw,
    Search,
    Star,
    Truck,
    X
} from 'lucide-react';

// Header, summary and list share one column width so everything lines up.
const LIST_WIDTH = 'max-w-4xl';

const useOrdersCopy = () => {
    const { t, i18n } = useTranslation();
    return useMemo(() => ({
        locale: i18n.language?.startsWith('tr') ? 'tr-TR' : 'en-US',
        bought: t('orders_ui_bought', 'Aldıklarım'),
        sold: t('orders_ui_sold', 'Sattıklarım'),
        searchPlaceholder: t('orders_ui_search_placeholder', 'Sipariş no ile ara'),
        searchSubmit: t('orders_ui_search_submit', 'Ara'),
        clear: t('orders_ui_clear', 'Temizle'),
        tabs: {
            [ORDER_LIST_TABS.ALL]: t('orders_ui_tab_all', 'Tümü'),
            [ORDER_LIST_TABS.ACTION]: t('orders_ui_tab_action', 'Aksiyon bekleyen'),
            [ORDER_LIST_TABS.PREPARING]: t('orders_ui_tab_preparing', 'Hazırlanıyor'),
            [ORDER_LIST_TABS.IN_DELIVERY]: t('orders_ui_tab_in_delivery', 'Teslimatta'),
            [ORDER_LIST_TABS.COMPLETED]: t('orders_ui_tab_completed', 'Teslim edildi'),
            [ORDER_LIST_TABS.CLOSED]: t('orders_ui_tab_closed', 'İptal ve iade'),
        },
        deliveryLabel: t('orders_ui_delivery_label', 'Teslimat yöntemi'),
        deliveryAll: t('orders_ui_delivery_all', 'Tüm teslimatlar'),
        deliveryCargo: t('orders_ui_delivery_cargo', 'Kargo'),
        deliveryMeetup: t('orders_ui_delivery_meetup', 'Güvenli buluşma'),
        totalLabel: t('orders_ui_total', 'Toplam tutar'),
        orderCardTitleFallback: t('orders_ui_title_fallback', 'Sipariş'),
        moreItems: count => t('orders_ui_more_items', { defaultValue: '+{{count}} ürün', count }),
        sellerPrefix: t('orders_ui_seller_prefix', 'Satıcı'),
        buyerPrefix: t('orders_ui_buyer_prefix', 'Alıcı'),
        reviewNow: t('orders_ui_review_now', 'Değerlendir'),
        detail: t('orders_ui_detail', 'Detaylar'),
        trackShipment: t('orders_ui_track_shipment', 'Kargoyu takip et'),
        confirmReceipt: t('orders_ui_confirm_receipt', 'Teslim aldım'),
        meetupCode: t('orders_ui_meetup_code', 'Buluşma kodu'),
        meetupDetail: t('orders_ui_meetup_detail', 'Buluşma detayı'),
        shipOrder: t('orders_ui_ship_order', 'Kargoya ver'),
        summaryToShip: t('orders_ui_summary_to_ship', 'Kargolanacak'),
        summaryEscrow: t('orders_ui_summary_escrow', 'Güvencede bekleyen'),
        summaryCompleted: t('orders_ui_summary_completed', 'Tamamlanan satış'),
        escrowInRow: amount => t('orders_ui_escrow_in_row', { defaultValue: '{{amount}} güvencede', amount }),
        escrowAwaitingDelivery: t('orders_ui_escrow_awaiting_delivery', 'teslimat onaylandıktan sonra aktarılır'),
        escrowReleased: t('orders_ui_escrow_released', 'otomatik aktarıldı'),
        escrowReleasesIn: hours => t('orders_ui_escrow_releases_in', { defaultValue: '~{{hours}} saat içinde aktarılır', hours }),
        startShopping: t('orders_ui_start_shopping', 'Alışverişe başla'),
        filteredEmptyTitle: t('orders_ui_filtered_empty_title', 'Bu filtreyle eşleşen sipariş yok'),
        filteredEmptyBody: t('orders_ui_filtered_empty_body', 'Başka bir sekme ya da teslimat yöntemi deneyin.'),
        searchEmptyTitle: q => t('orders_ui_search_empty_title', { defaultValue: '{{q}} numaralı sipariş bulunamadı', q }),
        searchEmptyBody: t('orders_ui_search_empty_body', 'Sipariş numarasını kontrol edip tekrar deneyin.'),
        clearSearch: t('orders_ui_clear_search', 'Aramayı temizle'),
        clearFilters: t('orders_ui_clear_filters', 'Filtreleri temizle'),
        shipDeadlineNoteTitle: t('orders_ui_ship_deadline_note_title', 'Kargo siparişlerini 72 saat içinde kargolaman gerekir'),
        shipDeadlineNoteBody: t('orders_ui_ship_deadline_note_body', 'Süre siparişin verildiği andan başlar. 72 saat içinde kargoya verilmeyen siparişler otomatik iptal edilir ve alıcıya ücret iadesi yapılır.'),
        shipTimeLeft: (hours, minutes) => t('orders_ui_ship_time_left', { defaultValue: 'Kargolamak için kalan süre: {{hours}} sa {{minutes}} dk', hours, minutes }),
        shipTimeLeftMinutes: minutes => t('orders_ui_ship_time_left_minutes', { defaultValue: 'Kargolamak için kalan süre: {{minutes}} dk', minutes }),
        shipTimeExpired: t('orders_ui_ship_time_expired', 'Kargolama süresi doldu, sipariş iptal ediliyor')
    }), [t, i18n.language]);
};

const TAB_ORDER = [
    ORDER_LIST_TABS.ALL,
    ORDER_LIST_TABS.ACTION,
    ORDER_LIST_TABS.PREPARING,
    ORDER_LIST_TABS.IN_DELIVERY,
    ORDER_LIST_TABS.COMPLETED,
    ORDER_LIST_TABS.CLOSED
];

const getListPaginationSlice = (pagination) => {
    if (!pagination || pagination.totalPages === 0) return null;
    const currentPage = pagination.number || 0;
    const pageSize = pagination.size;
    const totalElements = pagination.totalElements || 0;
    return {
        currentPage,
        totalPages: pagination.totalPages || 1,
        pageSize,
        totalElements,
        startItem: totalElements === 0 ? 0 : currentPage * pageSize + 1,
        endItem: Math.min((currentPage + 1) * pageSize, totalElements)
    };
};

/* ── Header ─────────────────────────────────────────────── */

const ViewSwitch = ({ uiCopy }) => {
    const linkClass = ({ isActive }) =>
        `inline-flex h-9 items-center rounded px-3 text-sm transition-colors duration-150 ${isActive ? 'bg-background-primary font-medium text-text-primary' : 'text-text-secondary hover:text-text-primary'
        }`;
    return (
        <nav className="inline-flex rounded-md border border-border bg-background-tertiary p-0.5" aria-label={uiCopy.bought + ' / ' + uiCopy.sold}>
            <NavLink to={ROUTES.MY_ORDERS} className={linkClass} end>{uiCopy.bought}</NavLink>
            <NavLink to={ROUTES.I_SOLD} className={linkClass} end>{uiCopy.sold}</NavLink>
        </nav>
    );
};

const Header = ({ title, subtitle, onAnalytics, analyticsLabel, onRefresh, loading, uiCopy }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                    {subtitle ? <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {onAnalytics ? (
                        <Button variant="secondary" size="sm" onClick={onAnalytics}>
                            <BarChart3 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                            <span className="hidden sm:inline">{analyticsLabel}</span>
                        </Button>
                    ) : null}
                    <Button variant="secondary" size="sm" className="w-9 !px-0" onClick={onRefresh} disabled={loading} aria-label={t("refresh", "Yenile")}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'motion-safe:animate-spin' : ''}`} strokeWidth={1.5} aria-hidden />
                    </Button>
                </div>
            </div>
            <ViewSwitch uiCopy={uiCopy} />
        </div>
    );
};

/* ── Seller summary ─────────────────────────────────────── */

const SummaryStat = ({ label, value, loading }) => (
    <div className="min-w-0 px-4 py-3 sm:px-5 sm:py-4">
        <p className="truncate text-sm text-text-tertiary">{label}</p>
        {loading ? (
            <Skeleton className="mt-1 h-6 w-16" />
        ) : (
            <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-text-primary">{value}</p>
        )}
    </div>
);

const SellerSummary = ({ flow, uiCopy }) => {
    const { statusCounts, countsError } = flow.tabs;
    // On a failed count request show a dash instead of an endless skeleton.
    const countsLoading = !countsError && flow.tabs.getTabCount(ORDER_LIST_TABS.ALL) == null;
    const toShip = countsError ? '—' : SELLER_TO_SHIP_STATUSES.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);
    return (
        <>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-background-primary p-4" role="note">
                <Clock className={`mt-0.5 h-5 w-5 shrink-0 ${toShip > 0 ? 'text-status-warning-text' : 'text-text-tertiary'}`} strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{uiCopy.shipDeadlineNoteTitle}</p>
                    <p className="mt-0.5 text-sm text-text-secondary">{uiCopy.shipDeadlineNoteBody}</p>
                </div>
            </div>
            <div className="mb-6 grid grid-cols-1 divide-y divide-border-light rounded-lg border border-border bg-background-primary sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <SummaryStat label={uiCopy.summaryToShip} value={toShip} loading={countsLoading} />
                <SummaryStat label={uiCopy.summaryEscrow} value={formatCurrency(flow.escrow.pendingEscrowAmount)} loading={flow.escrow.isLoading} />
                <SummaryStat label={uiCopy.summaryCompleted} value={countsError ? '—' : statusCounts[ORDER_STATUSES.COMPLETED] || 0} loading={countsLoading} />
            </div>
        </>
    );
};

/* ── Filters ─────────────────────────────────────────────── */

const StatusTabs = ({ activeTab, onChange, getTabCount, disabled, uiCopy }) => {
    const { t } = useTranslation();
    return (
        <div className="-mb-px flex overflow-x-auto" role="tablist" aria-label={t("order_status_filters", "Sipariş durumu filtreleri")}>
            {TAB_ORDER.map(tab => {
                const active = !disabled && activeTab === tab;
                const count = getTabCount(tab);
                const highlight = tab === ORDER_LIST_TABS.ACTION && count > 0;
                return (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab)}
                        className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors duration-150 ${active
                                ? 'border-primary font-medium text-text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        {uiCopy.tabs[tab]}
                        {count != null && count > 0 && (
                            <span
                                className={`rounded-sm px-1.5 text-xs font-medium tabular-nums ${highlight ? 'bg-status-warning-bg text-status-warning-text' : 'bg-background-tertiary text-text-secondary'
                                    }`}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

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

const SearchBox = ({ search, onSubmit, uiCopy }) => {
    const { t } = useTranslation();
    const { searchTerm, setSearchTerm, clearSearch } = search;
    return (
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1 sm:w-56 sm:flex-none" role="search" aria-label={t("search_orders", "Siparişlerde ara")}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={1.5} aria-hidden />
            <input
                type="search"
                inputMode="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={uiCopy.searchPlaceholder}
                aria-label={uiCopy.searchPlaceholder}
                className="h-10 w-full rounded border border-border bg-background-primary pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
            {searchTerm ? (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:bg-background-tertiary hover:text-text-secondary"
                    aria-label={uiCopy.clear}
                >
                    <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </button>
            ) : null}
            <button type="submit" className="sr-only" disabled={!searchTerm.trim()}>{uiCopy.searchSubmit}</button>
        </form>
    );
};

/* ── Order row ───────────────────────────────────────────── */

const OrderRowSkeleton = () => (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-background-primary p-4 sm:p-5 shadow-sm">
        <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2.5 pt-0.5">
            <Skeleton className="h-4 w-52 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="hidden h-9 w-28 shrink-0 sm:block" />
    </div>
);

// Release time is the backend `autoCompleteAt`; the release itself is the COMPLETED status.
const escrowReleaseHint = (order, uiCopy) => {
    if (order.status === ORDER_STATUSES.CANCELLED || order.status === ORDER_STATUSES.REFUNDED) return null;
    if (order.status === ORDER_STATUSES.COMPLETED) return uiCopy.escrowReleased;
    if (!order.autoCompleteAt) return uiCopy.escrowAwaitingDelivery;
    const diffMs = new Date(order.autoCompleteAt).getTime() - Date.now();
    return uiCopy.escrowReleasesIn(Math.max(1, Math.ceil(diffMs / ORDER_TIME.MINUTE_MS / 60)));
};

/** Re-renders every minute so the remaining ship time stays current. */
const useMinuteTick = (enabled) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!enabled) return undefined;
        const id = setInterval(() => setNow(Date.now()), ORDER_TIME.MINUTE_MS);
        return () => clearInterval(id);
    }, [enabled]);
    return now;
};

/** Counts down to the backend `shipDeadline`; the scheduler cancels the order after it. */
const ShipDeadline = ({ deadline, uiCopy }) => {
    const now = useMinuteTick(true);
    const leftMs = new Date(deadline).getTime() - now;
    if (leftMs <= 0) {
        return (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-status-error">
                <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                {uiCopy.shipTimeExpired}
            </p>
        );
    }
    const totalMinutes = Math.floor(leftMs / ORDER_TIME.MINUTE_MS);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const tone = leftMs <= ORDER_TIME.SHIP_DEADLINE_URGENT_MS ? 'text-status-error' : leftMs <= ORDER_TIME.SHIP_DEADLINE_WARNING_MS ? 'text-status-warning-text' : 'text-text-secondary';
    return (
        <p className={`mt-2 inline-flex items-center gap-1.5 text-sm font-medium tabular-nums ${tone}`}>
            <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            {hours > 0 ? uiCopy.shipTimeLeft(hours, minutes) : uiCopy.shipTimeLeftMinutes(minutes)}
        </p>
    );
};

// One next step per row, picked from the backend `allowedActions`; the most important one is primary.
const getRowAction = ({ order, isBuyer, isReviewed, uiCopy, handlers }) => {
    const can = action => hasOrderAction(order, action);
    if (isBuyer) {
        if (can(ORDER_ACTIONS.COMPLETE)) {
            return { variant: 'primary', icon: CircleCheck, label: uiCopy.confirmReceipt, onClick: e => handlers.complete(order.id, e) };
        }
        if (can(ORDER_ACTIONS.SHOW_MEETUP_CODE)) {
            return { variant: 'secondary', icon: KeyRound, label: uiCopy.meetupCode, onClick: () => handlers.open(order) };
        }
        if (order.status === ORDER_STATUSES.SHIPPED) {
            return { variant: 'secondary', icon: Truck, label: uiCopy.trackShipment, onClick: () => handlers.open(order) };
        }
        if (can(ORDER_ACTIONS.REVIEW) && !isReviewed) {
            return { variant: 'secondary', icon: Star, label: uiCopy.reviewNow, onClick: () => handlers.review(order) };
        }
        return null;
    }
    if (can(ORDER_ACTIONS.SHIP)) {
        return { variant: 'primary', icon: Truck, label: uiCopy.shipOrder, onClick: () => handlers.open(order) };
    }
    if (can(ORDER_ACTIONS.VERIFY_MEETUP)) {
        return { variant: 'secondary', icon: KeyRound, label: uiCopy.meetupDetail, onClick: () => handlers.open(order) };
    }
    return null;
};

const OrderRow = React.memo(({ viewMode, order, enums, uiCopy, isReviewed, highlighted, handlers }) => {
    const queryClient = useQueryClient();
    const [imgFailed, setImgFailed] = useState(false);
    const isBuyer = viewMode === ORDER_VIEW_MODES.BUYER;
    const items = order.orderItems || [];
    const firstItem = items[0];
    const imageUrl = firstItem?.listing?.imageUrl;
    const title = order.name || firstItem?.listing?.title || uiCopy.orderCardTitleFallback;
    const extraCount = Math.max(items.length - 1, 0);
    const currency = order.currency || 'TRY';
    // Seller rows show the backend sellerTotal (this seller's escrow share), never a client-side sum.
    const total = parseFloat(isBuyer ? order.totalAmount : order.sellerTotal) || 0;
    const statusLabel = resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status;
    const deliveryLabel = order.deliveryMethod === 'SAFE_MEETUP' ? uiCopy.deliveryMeetup : order.deliveryMethod === 'CARGO' ? uiCopy.deliveryCargo : null;
    const counterpart = isBuyer
        ? order.sellerFullName && `${uiCopy.sellerPrefix}: ${order.sellerFullName}`
        : [order.buyerName, order.buyerSurname].filter(Boolean).join(' ') && `${uiCopy.buyerPrefix}: ${[order.buyerName, order.buyerSurname].filter(Boolean).join(' ')}`;
    const escrowAmount = !isBuyer ? parseFloat(order.escrowAmount) || 0 : 0;
    const escrowHint = escrowAmount > 0 ? escrowReleaseHint(order, uiCopy) : null;
    const showShipDeadline = !isBuyer && Boolean(order.shipDeadline) && SELLER_TO_SHIP_STATUSES.includes(order.status);
    const action = getRowAction({ order, isBuyer, isReviewed, uiCopy, handlers });
    const meta = [order.createdAt && formatLongDate(order.createdAt, uiCopy.locale), deliveryLabel, counterpart].filter(Boolean);

    const prefetch = () => {
        queryClient.prefetchQuery({
            queryKey: ORDER_QUERY_KEYS.detail(order.id, !isBuyer),
            queryFn: () => (isBuyer ? orderService.getById(order.id) : orderService.getSellerOrderById(order.id)),
            staleTime: 30000
        });
    };

    const ActionIcon = action?.icon;

    return (
        <article
            tabIndex={0}
            onClick={() => handlers.open(order)}
            onMouseEnter={prefetch}
            onKeyDown={e => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlers.open(order);
                }
            }}
            aria-label={`${title}, ${statusLabel}`}
            className={`group flex cursor-pointer gap-4 rounded-lg border bg-background-primary p-4 shadow-sm hover:shadow transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:p-5 ${highlighted ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-card-border-hover'
                }`}
        >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-light bg-background-secondary">
                {imageUrl && !imgFailed ? (
                    <img src={optimizeCloudinaryUrl(imageUrl, { width: 160, height: 160, crop: 'fill', gravity: 'auto' })} alt="" loading="lazy" onError={() => setImgFailed(true)} className="h-full w-full object-cover" />
                ) : (
                    <Package className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                            {title}
                            {extraCount > 0 && <span className="ml-1.5 font-normal text-text-tertiary">{uiCopy.moreItems(extraCount)}</span>}
                        </p>
                        <p className="mt-1 truncate text-sm tabular-nums text-text-tertiary">{meta.join(' · ')}</p>
                        {showShipDeadline && <ShipDeadline deadline={order.shipDeadline} uiCopy={uiCopy} />}
                    </div>
                    <p className="shrink-0 text-base font-semibold tabular-nums text-text-price">
                        <span className="sr-only">{uiCopy.totalLabel}: </span>
                        {formatCurrency(total, currency)}
                    </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium border ${getOrderStatusBadgeClass(order.status)}`}>
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${getOrderStatusDotClass(order.status)}`} aria-hidden />
                            {statusLabel}
                        </span>
                        {escrowHint && (
                            <span className="tabular-nums text-text-tertiary">
                                · {uiCopy.escrowInRow(formatCurrency(escrowAmount, currency))}, {escrowHint}
                            </span>
                        )}
                    </p>
                    <div className="shrink-0" onClick={e => e.stopPropagation()}>
                        {action ? (
                            <button type="button" onClick={action.onClick} className={buttonClasses(action.variant, 'sm')}>
                                <ActionIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                                <span>{action.label}</span>
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-0.5 text-sm text-text-tertiary transition-colors group-hover:text-text-primary" aria-hidden>
                                {uiCopy.detail}
                                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
});

/* ── Layout ──────────────────────────────────────────────── */

const OrdersListLayout = ({
    title,
    subtitle,
    onAnalytics,
    analyticsLabel,
    flow,
    enums,
    viewMode,
    emptyText,
    emptyAction,
    highlightOrderId
}) => {
    const { t } = useTranslation();
    const uiCopy = useOrdersCopy();
    const mode = viewMode || flow.viewMode;
    const isBuyerView = mode === ORDER_VIEW_MODES.BUYER;
    const orders = flow.orders;
    const { search, tabs } = flow;
    const hasActiveFilter = tabs.activeTab !== ORDER_LIST_TABS.ALL || flow.deliveryMethodFilter !== 'ALL';

    const clearFilters = () => {
        tabs.setActiveTab(ORDER_LIST_TABS.ALL);
        flow.setDeliveryMethodFilter('ALL');
    };

    const openOrder = flow.modal.openOrderModal;
    const completeOrder = flow.actions.completeOrder;
    const openQuickReview = flow.reviewQuick?.openForOrder;
    const handlers = useMemo(() => ({
        open: openOrder,
        complete: completeOrder,
        review: order => (openQuickReview ? openQuickReview(order) : openOrder(order))
    }), [openOrder, completeOrder, openQuickReview]);

    useEffect(() => {
        if (!highlightOrderId || !orders.length || flow.loading) return;
        const id = String(highlightOrderId);
        requestAnimationFrame(() => {
            document.getElementById(`order-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }, [highlightOrderId, orders, flow.loading]);

    const slice = getListPaginationSlice(flow.pagination);

    useEffect(() => {
        if (!highlightOrderId || flow.loading || !orders.length) return;
        const el = document.getElementById(`order-card-${highlightOrderId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [highlightOrderId, flow.loading, orders.length]);

    let body;
    if (flow.loading) {
        body = (
            <div className="space-y-3">
                {['a', 'b', 'c'].map(k => <OrderRowSkeleton key={k} />)}
            </div>
        );
    } else if (flow.error) {
        body = (
            <Alert
                type="error"
                message={flow.error}
                action={<Button variant="secondary" size="sm" onClick={flow.refreshAll}>{t("try_again", "Tekrar dene")}</Button>}
            />
        );
    } else if (!orders.length) {
        body = search.isSearchMode ? (
            <EmptyState
                icon={Search}
                title={uiCopy.searchEmptyTitle(search.orderNumber)}
                description={uiCopy.searchEmptyBody}
                primaryAction={{ label: uiCopy.clearSearch, onClick: search.clearSearch }}
                className="py-16"
            />
        ) : hasActiveFilter ? (
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
                description={isBuyerView
                    ? t('orders_ui_empty_buyer_body', 'İkinci el ilanları keşfedip ilk siparişini oluşturabilirsin.')
                    : t('orders_ui_empty_seller_body', 'Satıştaki ürünlerin alıcı bulduğunda burada listelenir.')}
                primaryAction={isBuyerView && emptyAction ? { label: uiCopy.startShopping, onClick: emptyAction } : undefined}
                className="py-16"
            />
        );
    } else {
        body = (
            <ul className="space-y-3">
                {orders.map(order => (
                    <li key={order.id} id={`order-card-${order.id}`}>
                        <OrderRow
                            viewMode={mode}
                            order={order}
                            enums={enums}
                            uiCopy={uiCopy}
                            isReviewed={Boolean(flow.reviews.reviewedOrderSummaries[order.id])}
                            highlighted={highlightOrderId != null && String(order.id) === String(highlightOrderId)}
                            handlers={handlers}
                        />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="min-h-screen bg-background-secondary pb-20">
            <div className="bg-gradient-to-b from-background-primary via-background-primary/70 to-background-secondary">
                <PageContainer className={`pt-6 pb-5 ${LIST_WIDTH}`}>
                    <Header
                        title={title}
                        subtitle={subtitle}
                        onAnalytics={onAnalytics}
                        analyticsLabel={analyticsLabel}
                        onRefresh={flow.refreshAll}
                        loading={flow.loading}
                        uiCopy={uiCopy}
                    />
                </PageContainer>
            </div>

            <PageContainer className={LIST_WIDTH}>
                {!isBuyerView && <SellerSummary flow={flow} uiCopy={uiCopy} />}

                <div className="mb-5 flex flex-col gap-3 border-b border-border-light lg:flex-row lg:items-end lg:justify-between">
                    <StatusTabs
                        activeTab={tabs.activeTab}
                        onChange={tab => {
                            if (search.isSearchMode) search.clearSearch();
                            tabs.setActiveTab(tab);
                        }}
                        getTabCount={tabs.getTabCount}
                        disabled={search.isSearchMode}
                        uiCopy={uiCopy}
                    />
                    <div className="flex items-center gap-2 pb-3">
                        <DeliverySelect value={flow.deliveryMethodFilter} onChange={flow.setDeliveryMethodFilter} uiCopy={uiCopy} />
                        <SearchBox search={search} onSubmit={search.handleSearch} uiCopy={uiCopy} />
                    </div>
                </div>

                {body}

                {!flow.loading && slice && (
                    <DataPagination
                        shouldShowPagination
                        currentPage={slice.currentPage}
                        totalPages={slice.totalPages}
                        startItem={slice.startItem}
                        endItem={slice.endItem}
                        totalItems={slice.totalElements}
                        pageSize={slice.pageSize}
                        pageSizeOptions={ORDER_DEFAULTS.PAGE_SIZE_OPTIONS}
                        onPageChange={flow.loadPage}
                        onPageSizeChange={size => flow.fetchOrders(0, size, flow.sortField, flow.sortDirection)}
                    />
                )}
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
                viewMode={mode}
            />

            <ReviewModal
                isOpen={Boolean(flow.reviewQuick?.isOpen && flow.reviewQuick?.target?.orderItem)}
                onClose={() => flow.reviewQuick?.close?.()}
                orderItem={flow.reviewQuick?.target?.orderItem}
                fallbackOrderId={flow.reviewQuick?.target?.orderId}
                onReviewCreated={payload => flow.reviewQuick?.onReviewCreated?.(payload)}
            />
        </div>
    );
};

export default OrdersListLayout;
