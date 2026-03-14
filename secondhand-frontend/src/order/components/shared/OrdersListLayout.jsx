import React from 'react';
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../../common/formatters.js';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import {getStatusColor} from '../../orderConstants.js';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import {
  BarChart3,
  CheckCircle,
  ChevronRight,
  Eye,
  Info,
  Package,
  Pencil,
  Receipt,
  RefreshCw,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';

const Header = React.memo(
  ({
    title,
    subtitle,
    countText,
    showIndicator,
    onAnalytics,
    analyticsLabel = 'Analytics',
    onRefresh,
    loading,
    sticky,
  }) => {
    const headerContent = (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h1>
          {showIndicator ? <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> : null}
          {subtitle ? (
            <span className="text-sm text-slate-500 font-normal hidden sm:inline">{subtitle}</span>
          ) : countText ? (
            <span className="text-xs text-slate-500 font-normal tabular-nums hidden sm:inline">· {countText}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {onAnalytics ? (
            <button
              type="button"
              onClick={onAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{analyticsLabel}</span>
            </button>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    );

    if (!sticky) {
      return <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">{headerContent}</div>;
    }

    return (
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">{headerContent}</div>
      </div>
    );
  }
);

const OrderItemSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200/70 p-4 animate-pulse">
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="h-[14px] w-28 bg-slate-200 rounded-sm" />
        <div className="h-[12px] w-14 bg-slate-100 rounded-sm" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 rounded bg-slate-100" />
        <div className="w-7 h-7 rounded bg-slate-100" />
      </div>
    </div>
    <div className="flex items-center gap-3 mb-3">
      <div className="h-[10px] w-16 bg-slate-200 rounded-sm" />
      <div className="h-[10px] w-14 bg-slate-100 rounded-sm" />
      <div className="h-[10px] w-10 bg-slate-100 rounded-sm" />
      <div className="h-[10px] w-20 bg-slate-100 rounded-sm" />
    </div>
    <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
      <div className="w-9 h-9 rounded bg-slate-200" />
      <div className="flex-1 min-w-0">
        <div className="h-[12px] w-2/3 bg-slate-200 rounded-sm" />
        <div className="h-[10px] w-1/3 bg-slate-100 rounded-sm mt-1.5" />
      </div>
      <div className="h-[14px] w-14 bg-slate-200 rounded-sm" />
    </div>
  </div>
);

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const Search = React.memo(({ search, onSearch, onClearSearch }) => {
  const { searchTerm, setSearchTerm, searchLoading, searchError, isSearchMode, statusFilter, setStatusFilter } = search;

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-colors"
              disabled={searchLoading}
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter?.(e.target.value || '')}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-colors min-w-[130px]"
          >
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={searchLoading || !searchTerm.trim()}
            className="px-4 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {searchLoading ? 'Searching…' : 'Search'}
          </button>
          {isSearchMode ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
            >
              Clear
            </button>
          ) : null}
        </div>
      </form>
      {searchError ? (
        <div className="mt-2 px-3 py-2 bg-red-50/80 border border-red-100 rounded-xl">
          <p className="text-[13px] text-red-600">{searchError}</p>
        </div>
      ) : null}
    </div>
  );
});

const Pagination = React.memo(({ pagination, isSearchMode, loading, onPageChange, onPageSizeChange }) => {
  if (isSearchMode || loading) return null;
  if (!pagination || pagination.totalPages === 0) return null;

  const currentPage = pagination.number || 0;
  const totalPages = pagination.totalPages || 1;
  const pageSize = pagination.size || 5;
  const totalElements = pagination.totalElements || 0;

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-1 rounded-2xl border border-slate-200/70 bg-white p-3">
      <p className="text-[11px] text-slate-500 tabular-nums">
        {startItem}–{endItem} of {totalElements}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || totalPages <= 1}
          className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-[11px] text-slate-500 tabular-nums px-2">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || totalPages <= 1}
          className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <span className="w-px h-3.5 bg-slate-200 mx-1.5" />

        <select
          id="pageSize"
          className="px-2 py-1 text-[11px] text-slate-600 border border-slate-200 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>
    </div>
  );
});

const STATUS_ACCENT = {
  COMPLETED: 'border-l-emerald-400',
  DELIVERED: 'border-l-blue-400',
  SHIPPED: 'border-l-indigo-400',
  PROCESSING: 'border-l-amber-400',
  CONFIRMED: 'border-l-green-400',
  PENDING: 'border-l-gray-300',
  CANCELLED: 'border-l-red-300',
  REFUNDED: 'border-l-rose-300',
};

const UnifiedOrderItem = React.memo(
  ({
    viewMode,
    order,
    enums,
    onOpenOrder,
    onOpenReceipt,
    onCompleteOrder,
    editingOrderId,
    editingOrderName,
    setEditingOrderName,
    onStartEditName,
    onCancelEditName,
    onSaveOrderName,
  }) => {
    const itemsCount = order.orderItems?.length || 0;
    const firstItem = order.orderItems?.[0];
    const isCompleted = order.status === 'COMPLETED';
    const isDelivered = order.status === 'DELIVERED';

    const sellerTotalAmount =
      viewMode === 'seller'
        ? (order.orderItems || []).reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0)
        : null;

    const accentClass = STATUS_ACCENT[order.status] || 'border-l-gray-200';

    return (
      <div
        onClick={() => onOpenOrder(order)}
        className={`group bg-white border border-slate-200/70 border-l-2 ${accentClass} rounded-2xl px-4 py-3.5 cursor-pointer transition-all duration-150
          hover:shadow-[0_14px_40px_-30px_rgba(15,23,42,0.45)] hover:border-slate-300
          ${isCompleted ? 'bg-emerald-50/30' : ''}`}
      >
        {/* Row 1 — Order title + Actions */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            {viewMode === 'buyer' && editingOrderId === order.id ? (
              <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingOrderName}
                  onChange={(e) => setEditingOrderName(e.target.value)}
                  className="flex-1 px-2 py-1 text-[13px] font-medium text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Order name"
                  maxLength={100}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={(e) => onSaveOrderName(order.id, e)} className="p-1 hover:bg-slate-50 rounded text-slate-600 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
                <button onClick={onCancelEditName} className="p-1 hover:bg-slate-50 rounded text-slate-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[13px] font-semibold text-slate-900 truncate tracking-tight">
                  {viewMode === 'seller' ? `#${order.orderNumber}` : order.name || `#${order.orderNumber}`}
                </h3>
                {viewMode === 'buyer' && order.name ? (
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">#{order.orderNumber}</span>
                ) : null}
                {viewMode === 'buyer' ? (
                  <button
                    onClick={(e) => onStartEditName(order, e)}
                    className="p-0.5 text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Edit order name"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {viewMode === 'buyer' && isDelivered && (
              <button
                type="button"
                onClick={(e) => onCompleteOrder(order.id, e)}
                className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 mr-1"
                title="Confirm Order"
              >
                <CheckCircle className="w-3 h-3" /> Confirm
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }}
              className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {order.paymentReference ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenReceipt(order.paymentReference); }}
                className="p-1.5 text-slate-300 hover:text-slate-600 rounded-lg transition-colors"
                title="View Receipt"
              >
                <Receipt className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-150 ml-0.5" />
          </div>
        </div>

        {/* Row 2 — Status + meta */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-[11px] mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-slate-100 ${getStatusColor(order.status)}`}>
            {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium bg-slate-100 ${getStatusColor(order.paymentStatus)}`}>
            {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
            </span>
            <span className="text-slate-500 tabular-nums">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
          </div>
          <span className="text-slate-500 tabular-nums">{formatDateTime(order.createdAt)}</span>
        </div>

        {/* Row 3 — Product preview + price */}
        {firstItem ? (
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-100">
            {firstItem?.listing?.imageUrl ? (
              <img
                src={firstItem.listing.imageUrl}
                alt={firstItem.listing.title}
                className="w-8 h-8 rounded object-cover border border-slate-200 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-slate-700 truncate">{firstItem?.listing?.title || 'Item'}</p>
              {itemsCount > 1 ? (
                <p className="text-[10px] text-slate-500 mt-0.5">+{itemsCount - 1} more</p>
              ) : null}
            </div>
            <p className={`text-[13px] font-semibold tabular-nums tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
              {formatCurrency(viewMode === 'seller' ? sellerTotalAmount : order.totalAmount, order.currency)}
            </p>
          </div>
        ) : null}
      </div>
    );
  }
);

const OrdersListLayout = ({
  title,
  subtitle,
  countText,
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
}) => {
  const onPageChange = (page) => {
    if (!flow.search?.isSearchMode) {
      flow.loadPage(page);
    }
  };

  const onPageSizeChange = (size) => {
    flow.fetchOrders(0, size, flow.sortField, flow.sortDirection);
  };

  const isBuyerView = viewMode === 'buyer';
  const isSellerView = viewMode === 'seller';

  const computedCountText = countText || (() => {
    if (!flow.orders.length) return null;
    const total = flow.pagination?.totalElements || flow.orders.length;
    if (isSellerView) return `${total} ${total === 1 ? 'sale' : 'sales'}`;
    return `${total} ${total === 1 ? 'order' : 'orders'}`;
  })();

  const computedShowIndicator = showIndicator ?? (isBuyerView && flow.orders.some((o) => o.status === 'DELIVERED' && o.status !== 'COMPLETED'));

  const banner = isBuyerView && flow.ui.showNameBanner ? (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <p className="text-[12px] text-slate-600">
          <span className="font-medium text-slate-800">Tip:</span> Click the edit icon to name your orders for easier identification.
        </p>
      </div>
      <button
        onClick={flow.ui.dismissNameBanner}
        className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors ml-3"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  const topSlot = isSellerView && !flow.escrow.isLoading ? (
    <div className={`px-4 py-3.5 rounded-2xl border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/60 border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <Wallet className={`w-4 h-4 mt-0.5 flex-shrink-0 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-600' : 'text-slate-300'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Escrow</span>
            <span className={`text-lg font-semibold tabular-nums tracking-tight ${flow.escrow.pendingEscrowAmount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
              {formatCurrency(flow.escrow.pendingEscrowAmount)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-0">
            {flow.escrow.pendingEscrowAmount > 0
              ? 'Released to your wallet when orders are completed'
              : 'No pending escrow'}
          </p>
          {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-2">By Order</div>
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
                    if (!deliveredAt) {
                      tooltipText = 'Released automatically 48h after delivery.';
                    } else if (isAutoReleased) {
                      tooltipText = 'Auto-released (48h after delivery).';
                    } else {
                      const diffMs = autoReleaseDate - now;
                      const totalMinutes = Math.floor(diffMs / (1000 * 60));
                      const daysLeft = Math.floor(totalMinutes / (24 * 60));
                      const remainingMinutes = totalMinutes % (24 * 60);
                      const hoursLeft = Math.floor(remainingMinutes / 60);
                      const minutesLeft = remainingMinutes % 60;

                      const parts = [];
                      if (daysLeft > 0) parts.push(`${daysLeft}d`);
                      if (hoursLeft > 0) parts.push(`${hoursLeft}h`);
                      if (minutesLeft > 0) parts.push(`${minutesLeft}m`);

                      tooltipText = parts.length > 0
                        ? `Auto-releases in ${parts.join(' ')} (48h after delivery).`
                        : 'Auto-releasing soon.';
                    }

                    const progressPercent = deliveredAt && autoReleaseDate
                      ? isAutoReleased ? 100 : Math.max(0, 100 - ((autoReleaseDate - now) / (48 * 60 * 60 * 1000)) * 100)
                      : 0;

                    return (
                      <div key={order.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => flow.modal.openOrderModal(order)}
                              className="text-slate-700 hover:text-slate-900 hover:underline cursor-pointer text-left font-medium tabular-nums"
                            >
                              #{order.orderNumber}
                            </button>
                            <div className="relative group">
                              <Info className="w-2.5 h-2.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg">
                                <p className="leading-relaxed">{tooltipText}</p>
                                <div className="absolute left-3 bottom-0 transform translate-y-full">
                                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-slate-900" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold tabular-nums text-slate-700">{formatCurrency(escrowAmt, order.currency)}</span>
                        </div>
                        {deliveredAt && !isAutoReleased && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progressPercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap">
                              {Math.ceil((autoReleaseDate - now) / (60 * 60 * 1000))}h
                            </span>
                          </div>
                        )}
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header
        title={title}
        subtitle={subtitle}
        countText={computedCountText}
        showIndicator={computedShowIndicator}
        onAnalytics={onAnalytics}
        analyticsLabel={analyticsLabel}
        onRefresh={flow.refreshAll}
        loading={flow.loading}
        sticky={stickyHeader}
      />

      <div className={containerClassName || 'max-w-4xl mx-auto px-6 py-6'}>
        {banner ? <div className="mb-5">{banner}</div> : null}
        {topSlot ? <div className="mb-5">{topSlot}</div> : null}

        {flow.search ? (
          <div className="mb-5">
            <Search search={flow.search} onSearch={flow.search.handleSearch} onClearSearch={flow.search.clearSearch} />
          </div>
        ) : null}

        {flow.loading ? (
          <div className="space-y-2">
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </div>
        ) : !flow.orders?.length && !flow.search?.isSearchMode ? (
          <div className="py-16 text-center">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-[13px] text-slate-500 mb-4">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</p>
            {isBuyerView && emptyAction ? (
              <button
                onClick={emptyAction}
                className="px-4 py-2 bg-slate-900 text-white text-[13px] font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Start Shopping
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {(flow.orders || []).map((order) => (
              <UnifiedOrderItem
                key={order.id}
                viewMode={viewMode || flow.viewMode}
                order={order}
                enums={enums}
                onOpenOrder={flow.modal.openOrderModal}
                onOpenReceipt={flow.receipt.openReceipt}
                onCompleteOrder={flow.actions.completeOrder}
                editingOrderId={flow.ui.editingOrderId}
                editingOrderName={flow.ui.editingOrderName}
                setEditingOrderName={flow.ui.setEditingOrderName}
                onStartEditName={flow.actions.startEditOrderName}
                onCancelEditName={flow.actions.cancelEditOrderName}
                onSaveOrderName={flow.actions.saveOrderName}
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
OrdersListLayout.Search = Search;
OrdersListLayout.Pagination = Pagination;

export default OrdersListLayout;

