import React from 'react';
import { formatCurrency, formatDateTime, resolveEnumLabel } from '../../../common/formatters.js';
import LoadingIndicator from '../../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../../common/components/modals/PaymentReceiptModal.jsx';
import { getStatusColor } from '../../orderConstants.js';
import OrderDetailsModal from '../OrderDetailsModal.jsx';
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
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
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">{title}</h1>
            {showIndicator ? <span className="flex items-center justify-center w-1.5 h-1.5 bg-red-500 rounded-full" /> : null}
          </div>
          {subtitle ? <p className="text-xs text-gray-500 font-medium">{subtitle}</p> : null}
          {!subtitle && countText ? <p className="text-xs text-gray-500 font-medium">{countText}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {onAnalytics ? (
            <button
              type="button"
              onClick={onAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
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
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    );

    if (!sticky) {
      return <div className="flex items-center justify-between mb-8">{headerContent}</div>;
    }

    return (
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">{headerContent}</div>
      </div>
    );
  }
);

const OrderItemSkeleton = () => (
  <div className="bg-white border border-gray-200/60 rounded-lg p-5 animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
        <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-gray-100">
          <div className="w-8 h-8 rounded-md bg-gray-200" />
          <div className="flex-1 min-w-0">
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-2.5 w-1/2 bg-gray-100 rounded mt-1.5" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-md bg-gray-100" />
        <div className="w-9 h-9 rounded-md bg-gray-100" />
      </div>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
              disabled={searchLoading}
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter?.(e.target.value || '')}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white min-w-[140px]"
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
            className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
          {isSearchMode ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Show All
            </button>
          ) : null}
        </div>
      </form>
      {searchError ? (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{searchError}</p>
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || totalPages <= 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600 px-3">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1 || totalPages <= 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalElements} {totalElements === 1 ? 'order' : 'orders'}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Per page:
            </label>
            <select
              id="pageSize"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
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

    return (
      <div
        onClick={() => onOpenOrder(order)}
        className={`group bg-white border border-gray-200/60 rounded-lg p-5 cursor-pointer transition-all duration-200
          hover:border-gray-300 hover:shadow-md active:scale-[0.99]
          ${isCompleted ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200/60' : ''}`}
      >
        {/* Z-Pattern: Row 1 - Top left: Order name, Top right: Actions */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {viewMode === 'buyer' && editingOrderId === order.id ? (
              <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingOrderName}
                  onChange={(e) => setEditingOrderName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs font-medium text-gray-900 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Order name"
                  maxLength={100}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button onClick={(e) => onSaveOrderName(order.id, e)} className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 transition-colors">
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
                <button onClick={onCancelEditName} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {viewMode === 'seller' ? `Order #${order.orderNumber}` : order.name || `Order #${order.orderNumber}`}
                </h3>
                {viewMode === 'buyer' && order.name ? (
                  <span className="text-[10px] text-gray-500 font-medium shrink-0">#{order.orderNumber}</span>
                ) : null}
                {viewMode === 'buyer' ? (
                  <button
                    onClick={(e) => onStartEditName(order, e)}
                    className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Edit order name"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {viewMode === 'buyer' && isDelivered && (
              <button
                type="button"
                onClick={(e) => onCompleteOrder(order.id, e)}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1.5"
                title="Confirm Order"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Confirm
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenOrder(order); }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {order.paymentReference ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenReceipt(order.paymentReference); }}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="View Receipt"
              >
                <Receipt className="w-4 h-4" />
              </button>
            ) : null}
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </div>

        {/* Z-Pattern: Row 2 - Status badge + meta */}
        <div className="flex items-center gap-4 flex-wrap mb-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                order.status === 'COMPLETED' ? 'bg-emerald-500' :
                order.status === 'DELIVERED' ? 'bg-blue-500' :
                order.status === 'SHIPPED' ? 'bg-indigo-500' :
                order.status === 'PROCESSING' ? 'bg-amber-500' :
                order.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
              {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <CreditCard className="w-3 h-3" />
            <span className={`text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
              {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Package className="w-3 h-3" />
            <span className="text-xs text-gray-600">{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3 h-3" />
            <span className="text-xs text-gray-600">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Z-Pattern: Row 3 - Financial summary (image + price) */}
        {firstItem ? (
          <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
            <div className="overflow-hidden rounded-md flex-shrink-0">
              {firstItem?.listing?.imageUrl ? (
                <img
                  src={firstItem.listing.imageUrl}
                  alt={firstItem.listing.title}
                  className="w-10 h-10 rounded-md object-cover border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{firstItem?.listing?.title || 'Item'}</p>
              {itemsCount > 1 ? (
                <p className="text-[10px] text-gray-500 mt-0.5">+{itemsCount - 1} more {itemsCount === 2 ? 'item' : 'items'}</p>
              ) : null}
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-semibold font-mono ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
                {formatCurrency(viewMode === 'seller' ? sellerTotalAmount : order.totalAmount, order.currency)}
              </p>
            </div>
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
    <div className="bg-blue-50/80 border border-blue-200/60 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-900">Custom order names</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Click the edit icon to name your orders for easier identification.</p>
        </div>
      </div>
      <button
        onClick={flow.ui.dismissNameBanner}
        className="p-1 hover:bg-blue-100 rounded-md text-blue-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  const topSlot = isSellerView && !flow.escrow.isLoading ? (
    <div className={`p-4 rounded-lg border ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-blue-50/80 border-blue-200/60' : 'bg-gray-50 border-gray-200/60'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-md flex-shrink-0 ${flow.escrow.pendingEscrowAmount > 0 ? 'bg-blue-100' : 'bg-gray-200'}`}>
          <Wallet className={`w-3.5 h-3.5 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold mb-1 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-blue-900' : 'text-gray-700'}`}>Escrow Amount</div>
          <div className={`text-lg font-semibold font-mono mb-2 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-600'}`}>
            {formatCurrency(flow.escrow.pendingEscrowAmount)}
          </div>
          <div className={`text-[11px] mb-3 ${flow.escrow.pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
            {flow.escrow.pendingEscrowAmount > 0
              ? 'This amount will be released to your wallet when orders are completed'
              : 'No pending escrow amount at the moment'}
          </div>
          {flow.escrow.pendingEscrowAmount > 0 && flow.orders.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-blue-200/60">
              <div className="text-[10px] font-semibold text-blue-900 mb-2">Pending by Order:</div>
              <div className="space-y-1.5">
                {flow.orders
                  .filter((order) => (parseFloat(order.escrowAmount) || 0) > 0)
                  .map((order) => {
                    const escrowAmt = parseFloat(order.escrowAmount) || 0;
                    const deliveredAt = order.shipping?.deliveredAt;
                    const autoReleaseDate = deliveredAt ? new Date(new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000) : null;
                    const now = new Date();
                    const isAutoReleased = autoReleaseDate && now >= autoReleaseDate;

                    let tooltipText = '';
                    if (!deliveredAt) {
                      tooltipText = 'The escrow amount will be automatically released 48 hours after the order is delivered.';
                    } else if (isAutoReleased) {
                      tooltipText = 'The escrow amount has been automatically released (48 hours after delivery).';
                    } else {
                      const diffMs = autoReleaseDate - now;
                      const totalMinutes = Math.floor(diffMs / (1000 * 60));
                      const daysLeft = Math.floor(totalMinutes / (24 * 60));
                      const remainingMinutes = totalMinutes % (24 * 60);
                      const hoursLeft = Math.floor(remainingMinutes / 60);
                      const minutesLeft = remainingMinutes % 60;

                      const parts = [];
                      if (daysLeft > 0) parts.push(`${daysLeft} day${daysLeft !== 1 ? 's' : ''}`);
                      if (hoursLeft > 0) parts.push(`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`);
                      if (minutesLeft > 0) parts.push(`${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`);

                      if (parts.length > 0) {
                        const timeString = parts.join(', ');
                        tooltipText = `The escrow amount will be automatically released in ${timeString} (48 hours after delivery), if not confirmed earlier by the buyer.`;
                      } else {
                        tooltipText = 'The escrow amount will be automatically released soon (48 hours after delivery), if not confirmed earlier by the buyer.';
                      }
                    }

                    const progressPercent = deliveredAt && autoReleaseDate
                      ? isAutoReleased ? 100 : Math.max(0, 100 - ((autoReleaseDate - now) / (48 * 60 * 60 * 1000)) * 100)
                      : 0;

                    return (
                      <div key={order.id} className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => flow.modal.openOrderModal(order)}
                              className="text-blue-800 hover:text-blue-900 hover:underline cursor-pointer text-left font-medium"
                            >
                              Order #{order.orderNumber}
                            </button>
                            <div className="relative group">
                              <Info className="w-3 h-3 text-blue-600 cursor-help hover:text-blue-700 transition-colors" />
                              <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
                                <div className="space-y-1.5">
                                  <div className="font-semibold text-white">Escrow Release Information</div>
                                  <div className="text-slate-300 leading-relaxed">{tooltipText}</div>
                                </div>
                                <div className="absolute left-4 bottom-0 transform translate-y-full">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold font-mono text-blue-700">{formatCurrency(escrowAmt, order.currency)}</span>
                        </div>
                        {deliveredAt && !isAutoReleased && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-blue-200/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progressPercent)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-medium text-blue-700 whitespace-nowrap">
                              {Math.ceil((autoReleaseDate - now) / (60 * 60 * 1000))}h left
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
    <div className="min-h-screen bg-gray-50/50">
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

      <div className={containerClassName || (isSellerView ? 'max-w-7xl mx-auto px-6 py-6' : 'max-w-7xl mx-auto px-6 py-8')}>
        {banner ? <div className="mb-6">{banner}</div> : null}
        {topSlot ? <div className="mb-6">{topSlot}</div> : null}

        {flow.search ? (
          <div className="mb-6">
            <Search search={flow.search} onSearch={flow.search.handleSearch} onClearSearch={flow.search.clearSearch} />
          </div>
        ) : null}

        {flow.loading ? (
          <div className="space-y-3">
            {[...Array(isSellerView ? 2 : 3)].map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </div>
        ) : !flow.orders?.length && !flow.search?.isSearchMode ? (
          <div className="bg-white border border-gray-200/60 rounded-lg p-12 text-center">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-4">{emptyText || (isSellerView ? 'No sales yet' : 'No orders yet')}</p>
            {isBuyerView && emptyAction ? (
              <button
                onClick={emptyAction}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
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

