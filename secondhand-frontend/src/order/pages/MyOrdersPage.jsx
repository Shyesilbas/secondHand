import React from 'react';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../../payments/services/paymentService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import { ReviewButton } from '../../reviews/index.js';
import { formatDateTime, formatCurrency, resolveEnumLabel } from '../../common/formatters.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useOrders } from '../hooks/useOrders.js';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  } = useOrders(0, 5);

  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const [receiptPayment, setReceiptPayment] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [orderModalOpen, setOrderModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState(null);
  const [isSearchMode, setIsSearchMode] = React.useState(false);

  const openReceipt = async (paymentReference) => {
    try {
      const payments = await paymentService.getMyPayments(0, 100);
      const list = payments.content || [];
      const payment = list.find(p => String(p.paymentId) === String(paymentReference));
      if (payment) {
        setReceiptPayment(payment);
        setReceiptOpen(true);
      }
    } catch (e) {}
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const order = await orderService.getByOrderNumber(searchTerm.trim());
      if (order) {
        setSearchOrder(order);
        setIsSearchMode(true);
        setSearchTerm('');
      }
    } catch (error) {
      setSearchError('Order not found. Please check the order number.');
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchError(null);
    setIsSearchMode(false);
    refresh();
  };

  const handlePageChange = (page) => {
    if (!isSearchMode) {
      loadPage(page);
    }
  };

  const getEstimatedDeliveryTime = (order) => {
    if (order.shippingStatus === 'DELIVERED' || order.shippingStatus === 'CANCELLED') {
      return null;
    }

    if (order.estimatedTransitDate && order.estimatedDeliveryDate) {
      const now = new Date();
      const transitDate = new Date(order.estimatedTransitDate);
      const deliveryDate = new Date(order.estimatedDeliveryDate);

      if (now < transitDate) {
        const hoursUntilTransit = Math.ceil((transitDate - now) / (1000 * 60 * 60));
        return `Est. in transit in ${hoursUntilTransit}h`;
      } else if (now < deliveryDate) {
        const hoursUntilDelivery = Math.ceil((deliveryDate - now) / (1000 * 60 * 60));
        return `Est. delivery in ${hoursUntilDelivery}h`;
      } else {
        return 'Est. delivery: Soon';
      }
    }

    return null;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'text-amber-700 bg-amber-50',
      'CONFIRMED': 'text-blue-700 bg-blue-50',
      'PROCESSING': 'text-indigo-700 bg-indigo-50',
      'SHIPPED': 'text-purple-700 bg-purple-50',
      'DELIVERED': 'text-green-700 bg-green-50',
      'CANCELLED': 'text-red-700 bg-red-50',
      'PAID': 'text-green-700 bg-green-50',
      'UNPAID': 'text-orange-700 bg-orange-50',
      'REFUNDED': 'text-gray-700 bg-gray-50'
    };
    return colors[status] || 'text-gray-700 bg-gray-50';
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <LoadingIndicator />
          </div>
        </div>
    );
  }

  if (!orders.length && !isSearchMode) {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
              <p className="text-gray-500">When you place your first order, it will appear here.</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600 mt-1">Track and manage your purchases</p>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
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
              <button
                  type="submit"
                  disabled={searchLoading || !searchTerm.trim()}
                  className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              {isSearchMode && (
                  <button
                      type="button"
                      onClick={clearSearch}
                      className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Show All
                  </button>
              )}
            </form>
            {searchError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{searchError}</p>
                </div>
            )}
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer" onClick={() => openOrderModal(order)}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {resolveEnumLabel(enums, 'listingStatuses', order.status)}
                      </span>
                        </div>
                        <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">{formatCurrency(order.totalAmount, order.currency)}</p>
                        {order.paymentReference && (
                            <button
                                className="text-sm text-gray-600 hover:text-gray-900 mt-1"
                                onClick={(e) => { e.stopPropagation(); openReceipt(order.paymentReference); }}
                            >
                              View receipt →
                            </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Payment:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus)}`}>
                      {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
                    </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Shipping:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.shippingStatus)}`}>
                      {resolveEnumLabel(enums, 'shippingStatuses', order.shippingStatus)}
                    </span>
                      </div>
                      {getEstimatedDeliveryTime(order) && (
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {getEstimatedDeliveryTime(order)}
                          </div>
                      )}
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <div className="space-y-3">
                            {order.orderItems.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  {/* Item Image */}
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.listing?.imageUrl ? (
                                        <img
                                            src={item.listing.imageUrl}
                                            alt={item.listing.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center ${item.listing?.imageUrl ? 'hidden' : 'flex'}`}>
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  </div>
                                  
                                  {/* Item Details */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.listing?.title || item.listing?.listingNo}</p>
                                    <p className="text-xs text-gray-500 mt-1">×{item.quantity} • {formatCurrency(item.totalPrice, order.currency)}</p>
                                  </div>
                                </div>
                            ))}
                            {order.orderItems.length > 2 && (
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-600">+{order.orderItems.length - 2}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-500">+{order.orderItems.length - 2} more items</p>
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                    )}
                  </div>
                </div>
            ))}
          </div>

          {/* Pagination */}
          {!isSearchMode && !loading && pagination.totalPages > 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(Math.max(0, pagination.number - 1))}
                        disabled={pagination.number === 0}
                        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                  Page {pagination.number + 1} of {pagination.totalPages}
                </span>
                    <button
                        onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.number + 1))}
                        disabled={pagination.number >= pagination.totalPages - 1}
                        className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {pagination.totalElements === 0 ? 0 : pagination.number * pagination.size + 1} to {Math.min((pagination.number + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements}
                </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Per page:</label>
                      <select
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white"
                          value={pagination.size || 5}
                          onChange={(e) => fetchOrders(0, Number(e.target.value))}
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
          )}
        </div>

        {/* Modals */}
        <PaymentReceiptModal isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} payment={receiptPayment} />

        {orderModalOpen && selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                        <p className="text-sm text-gray-600 mt-1">{formatDateTime(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                    <button
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                        onClick={closeOrderModal}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
                  {/* Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Order Status</p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Payment</p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.paymentStatus)}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Shipping</p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.shippingStatus)}`}>
                        {selectedOrder.shippingStatus}
                      </span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {getEstimatedDeliveryTime(selectedOrder) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-amber-800">Delivery Update</p>
                            <p className="text-xs text-amber-700 mt-1">{getEstimatedDeliveryTime(selectedOrder)}</p>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Detailed Shipping Timeline */}
                  {selectedOrder.estimatedTransitDate && selectedOrder.estimatedDeliveryDate && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-3">Shipping Timeline</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">Estimated In Transit:</span>
                            <span className="font-medium text-blue-900">{formatDateTime(selectedOrder.estimatedTransitDate)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">Estimated Delivery:</span>
                            <span className="font-medium text-blue-900">{formatDateTime(selectedOrder.estimatedDeliveryDate)}</span>
                          </div>
                        </div>
                      </div>
                  )}

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h4>
                      {selectedOrder.shippingAddress ? (
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="font-medium text-gray-900">{selectedOrder.shippingAddress.addressLine}</div>
                            <div>{selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</div>
                            <div className="text-gray-500">{selectedOrder.shippingAddress.country}</div>
                          </div>
                      ) : (
                          <p className="text-sm text-gray-500">Not provided</p>
                      )}
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h4>
                      {selectedOrder.billingAddress ? (
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="font-medium text-gray-900">{selectedOrder.billingAddress.addressLine}</div>
                            <div>{selectedOrder.billingAddress.city} {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.postalCode}</div>
                            <div className="text-gray-500">{selectedOrder.billingAddress.country}</div>
                          </div>
                      ) : (
                          <p className="text-sm text-gray-500">Same as shipping</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900">Order Items</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {(selectedOrder.orderItems || []).map((item, idx) => (
                          <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                              {/* Item Image */}
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.listing?.imageUrl ? (
                                    <img
                                        src={item.listing.imageUrl}
                                        alt={item.listing.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center ${item.listing?.imageUrl ? 'hidden' : 'flex'}`}>
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </div>
                              
                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <h5 className="text-lg font-semibold text-gray-900 mb-2">{item.listing?.title || item.listing?.listingNo}</h5>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-500">Listing ID: <span className="font-medium text-gray-700">{item.listing?.listingNo || item.listing?.id}</span></p>
                                  <p className="text-sm text-gray-600">
                                    Unit Price: <span className="font-medium text-gray-900">{formatCurrency(item.unitPrice, selectedOrder.currency)}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Quantity: <span className="font-medium text-gray-900">{item.quantity}</span>
                                  </p>
                                </div>
                              </div>
                              
                              {/* Price and Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(item.totalPrice, selectedOrder.currency)}</p>
                                <ReviewButton
                                    orderItem={{ ...item, shippingStatus: selectedOrder.shippingStatus }}
                                    onReviewCreated={() => {}}
                                />
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.notes || 'No notes provided'}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Reference</h4>
                      <div className="space-y-3">
                        <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">{selectedOrder.paymentReference || '—'}</p>
                        {selectedOrder.paymentReference && (
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => openReceipt(selectedOrder.paymentReference)}
                            >
                              View Receipt
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default MyOrdersPage;