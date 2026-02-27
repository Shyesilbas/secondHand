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
          <h1 className="text-[15px] font-semibold text-gray-900 tracking-[-0.01em]">{title}</h1>
          {showIndicator ? <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> : null}
          {subtitle ? (
            <span className="text-xs text-gray-400 font-normal hidden sm:inline">{subtitle}</span>
          ) : countText ? (
            <span className="text-[11px] text-gray-400 font-normal tabular-nums hidden sm:inline">· {countText}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {onAnalytics ? (
            <button
              type="button"
              onClick={onAnalytics}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 rounded-md transition-colors"
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
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    );

    if (!sticky) {
      return <div className="mb-6">{headerContent}</div>;
    }

    return (
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3">{headerContent}</div>
      </div>
    );
  }
);

const OrderItemSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="h-[14px] w-28 bg-gray-100 rounded-sm" />
        <div className="h-[12px] w-14 bg-gray-50 rounded-sm" />
      </div>
      <div className="flex items-center gap-1">
        <div className="w-7 h-7 rounded bg-gray-50" />
        <div className="w-7 h-7 rounded bg-gray-50" />
      </div>
    </div>
    <div className="flex items-center gap-3 mb-3">
      <div className="h-[10px] w-16 bg-gray-100 rounded-sm" />
      <div className="h-[10px] w-14 bg-gray-50 rounded-sm" />
      <div className="h-[10px] w-10 bg-gray-50 rounded-sm" />
      <div className="h-[10px] w-20 bg-gray-50 rounded-sm" />
    </div>
    <div className="flex items-center gap-2.5 pt-3 border-t border-gray-50">
      <div className="w-9 h-9 rounded bg-gray-100" />
      <div className="flex-1 min-w-0">
        <div className="h-[12px] w-2/3 bg-gray-100 rounded-sm" />
        <div className="h-[10px] w-1/3 bg-gray-50 rounded-sm mt-1.5" />
      </div>
      <div className="h-[14px] w-14 bg-gray-100 rounded-sm" />
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
    <div>
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[13px] placeholder:text-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 transition-colors"
              disabled={searchLoading}
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter?.(e.target.value || '')}
            className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[13px] text-gray-600 focus:bg-white focus:ring-1 focus:ring-gray-200 focus:border-gray-200 transition-colors min-w-[130px]"
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
            className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {searchLoading ? 'Searching…' : 'Search'}
          </button>
          {isSearchMode ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-700 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              Clear
            </button>
          ) : null}
        </div>
      </form>
      {searchError ? (
        <div className="mt-2 px-3 py-2 bg-red-50/80 border border-red-100 rounded-lg">
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
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4 px-1">
      <p className="text-[11px] text-gray-400 tabular-nums">
        {startItem}–{endItem} of {totalElements}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || totalPages <= 1}
          className="px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <span className="text-[11px] text-gray-400 tabular-nums px-2">
          {currentPage + 1} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1 || totalPages <= 1}
          className="px-2.5 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-900 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <span className="w-px h-3.5 bg-gray-100 mx-1.5" />

        <select
          id="pageSize"
          className="px-2 py-1 text-[11px] text-gray-500 border border-gray-100 rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-200 cursor-pointer"
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
        className={`group bg-white border border-gray-100 border-l-2 ${accentClass} rounded-lg px-4 py-3.5 cursor-pointer transition-all duration-150
          hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-gray-150
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
                  className="flex-1 px-2 py-1 text-[13px] font-medium text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  placeholder="Order name"
                  maxLength={100}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={(e) => onSaveOrderName(order.id, e)} className="p-1 hover:bg-gray-50 rounded text-gray-600 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
                <button onClick={onCancelEditName} className="p-1 hover:bg-gray-50 rounded text-gray-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[13px] font-semibold text-gray-900 truncate tracking-[-0.01em]">
                  {viewMode === 'seller' ? `#${order.orderNumber}` : order.name || `#${order.orderNumber}`}
                </h3>
                {viewMode === 'buyer' && order.name ? (
                  <span className="text-[10px] text-gray-400 font-mono shrink-0">#{order.orderNumber}</span>
                ) : null}
                {viewMode === 'buyer' ? (
                  <button
                    onClick={(e) => onStartEditName(order, e)}
                    className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
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
                className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors flex items-center gap-1 mr-1"
                title="Confirm Order"
              >
                <CheckCircle className="w-3 h-3" /> Confirm
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }}
              className="p-1.5 text-gray-300 hover:text-gray-600 rounded transition-colors"
              title="View Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {order.paymentReference ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenReceipt(order.paymentReference); }}
                className="p-1.5 text-gray-300 hover:text-gray-600 rounded transition-colors"
                title="View Receipt"
              >
                <Receipt className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150 ml-0.5" />
          </div>
        </div>

        {/* Row 2 — Status + meta data inline */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] mb-2.5">
          <span className={`font-medium ${getStatusColor(order.status)}`}>
            {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
          </span>
          <span className="w-px h-3 bg-gray-100" />
          <span className={`font-medium ${getStatusColor(order.paymentStatus)}`}>
            {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
          </span>
          <span className="w-px h-3 bg-gray-100" />
          <span className="text-gray-400 tabular-nums">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
          <span className="w-px h-3 bg-gray-100" />
          <span className="text-gray-400 tabular-nums">{formatDateTime(order.createdAt)}</span>
        </div>

        {/* Row 3 — Product preview + price */}
        {firstItem ? (
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-gray-50">
            {firstItem?.listing?.imageUrl ? (
              <img
                src={firstItem.listing.imageUrl}
                alt={firstItem.listing.title}
                className="w-8 h-8 rounded object-cover border border-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-3.5 h-3.5 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-gray-700 truncate">{firstItem?.listing?.title || 'Item'}</p>
              {itemsCount > 1 ? (
                <p className="text-[10px] text-gray-400 mt-0.5">+{itemsCount - 1} more</p>
              ) : null}
            </div>
            <p className={`text-[13px] font-semibold tabular-nums tracking-tight ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
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
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <p className="text-[12px] text-gray-500">
          <span className="font-medium text-gray-700">Tip:</span> Click the edit icon to name your orders for easier identification.
        </p>
      </div>
      <button
        onClick={flow.ui.dismissNameBanner}
        className="p-0.5 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-500 transition-colors ml-3"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  const topSlot = isSellerView && !flow.escrow.isLoading ? (
    <div className={`px-4 py-3.5 rounded-lg border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-gray-50 border-gray-100' : 'bg-gray-50/50 border-gray-100'}`}>
      <div className="flex items-start gap-3">
        <Wallet className={`w-4 h-4 mt-0.5 flex-shrink-0 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-gray-600' : 'text-gray-300'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Escrow</span>
            <span className={`text-lg font-semibold tabular-nums tracking-tight ${flow.escrow.pendingEscrowAmount > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
              {formatCurrency(flow.escrow.pendingEscrowAmount)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mb-0">
            {flow.escrow.pendingEscrowAmount > 0
              ? 'Released to your wallet when orders are completed'
              : 'No pending escrow'}
          </p>
          {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">By Order</div>
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
                              className="text-gray-700 hover:text-gray-900 hover:underline cursor-pointer text-left font-medium tabular-nums"
                            >
                              #{order.orderNumber}
                            </button>
                            <div className="relative group">
                              <Info className="w-2.5 h-2.5 text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 w-56 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg">
                                <p className="leading-relaxed">{tooltipText}</p>
                                <div className="absolute left-3 bottom-0 transform translate-y-full">
                                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-gray-900" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold tabular-nums text-gray-700">{formatCurrency(escrowAmt, order.currency)}</span>
                        </div>
                        {deliveredAt && !isAutoReleased && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gray-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progressPercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
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
    <div className="min-h-screen bg-[#fafafa]">
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
            <Package className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-[13px] text-gray-400 mb-4">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</p>
            {isBuyerView && emptyAction ? (
              <button
                onClick={emptyAction}
                className="px-4 py-2 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors"
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

