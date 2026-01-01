import React, { useState } from 'react';
import {orderService} from '../services/orderService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useOrders} from '../hooks/useOrders.js';
import OrdersSearch from '../components/OrdersSearch.jsx';
import OrdersPagination from '../components/OrdersPagination.jsx';
import OrderModal from '../components/OrderModal.jsx';
import {useOrdersSearch} from '../hooks/useOrdersSearch.js';
import {useOrdersModal} from '../hooks/useOrdersModal.js';
import {useOrdersReceipt} from '../hooks/useOrdersReceipt.js';
import {useOrdersReviews} from '../hooks/useOrdersReviews.js';
import {getStatusColor} from '../utils/orderUtils.js';
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../common/formatters.js';
import {RefreshCw, Eye, Receipt, ArrowUp, ArrowDown, CheckCircle} from 'lucide-react';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const [sortField, setSortField] = useState(null); // 'createdAt' or 'totalAmount'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  
  const {
    orders,
    loading,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  } = useOrders(0, 5, sortField, sortDirection);

  const { orderReviews, reviewsLoading, fetchReviewsData, clearReviews } = useOrdersReviews();
  const { selectedOrder, setSelectedOrder, orderModalOpen, openOrderModal, closeOrderModal } = useOrdersModal(fetchReviewsData);
  const { receiptOpen, receiptPayment, openReceipt, closeReceipt } = useOrdersReceipt();
  const { 
    searchTerm, 
    setSearchTerm, 
    searchLoading, 
    searchError, 
    isSearchMode, 
    handleSearch, 
    clearSearch 
  } = useOrdersSearch(setSearchOrder, refresh);

  const handleReviewSuccess = async () => {
    refresh();
    if (selectedOrder) {
      const updatedOrder = await orderService.getById(selectedOrder.id);
      setSelectedOrder(updatedOrder);
      await fetchReviewsData(updatedOrder);
    }
  };

  const handleCompleteOrder = async (orderId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to complete this order? This action cannot be undone.')) {
      return;
    }
    try {
      await orderService.completeOrder(orderId);
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to complete order');
    }
  };

  const handlePageChange = (page) => {
    if (!isSearchMode) {
      loadPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    fetchOrders(0, size, sortField, sortDirection);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      // New field, default to desc
      setSortField(field);
      setSortDirection('desc');
    }
    // Reset to first page when sorting changes
    loadPage(0);
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-sm font-semibold text-gray-900">My Orders</h1>
              {orders.length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {pagination?.totalElements || orders.length} total
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <OrdersSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchLoading={searchLoading}
              searchError={searchError}
              isSearchMode={isSearchMode}
              onSearch={handleSearch}
              onClearSearch={clearSearch}
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-white border border-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : !orders.length && !isSearchMode ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-xs text-gray-600">No orders yet</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Payment</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Items</th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSort('totalAmount');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Total</span>
                        {sortField === 'totalAmount' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSort('createdAt');
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const itemsCount = order.orderItems?.length || 0;
                    const firstItem = order.orderItems?.[0];
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openOrderModal(order)}>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-medium text-gray-900">#{order.orderNumber}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.status)}`}>
                            {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusColor(order.paymentStatus)}`}>
                            {resolveEnumLabel(enums, 'paymentStatuses', order.paymentStatus) || order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {firstItem?.listing?.imageUrl && (
                              <img 
                                src={firstItem.listing.imageUrl} 
                                alt={firstItem.listing.title}
                                className="w-6 h-6 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-gray-600 truncate block">
                                {firstItem?.listing?.title || 'Item'}
                              </span>
                              {itemsCount > 1 && (
                                <span className="text-[10px] text-gray-500">+{itemsCount - 1} more</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td 
                          className="px-4 py-2.5 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSort('totalAmount');
                          }}
                        >
                          <span className="text-xs font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount, order.currency)}
                          </span>
                        </td>
                        <td 
                          className="px-4 py-2.5 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSort('createdAt');
                          }}
                        >
                          <span className="text-xs text-gray-600">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {order.status === 'DELIVERED' && (
                              <button
                                type="button"
                                onClick={(e) => handleCompleteOrder(order.id, e)}
                                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                title="Complete Order"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openOrderModal(order);
                              }}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.paymentReference && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReceipt(order.paymentReference);
                                }}
                                className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="View Receipt"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {orders.length > 0 && (
            <div className="mt-4">
              <OrdersPagination
                pagination={pagination}
                isSearchMode={isSearchMode}
                loading={loading}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>

        <PaymentReceiptModal isOpen={receiptOpen} onClose={closeReceipt} payment={receiptPayment} />
        
        <OrderModal
            isOpen={orderModalOpen}
            selectedOrder={selectedOrder}
            orderReviews={orderReviews}
            onClose={closeOrderModal}
            onOpenReceipt={openReceipt}
            onReviewSuccess={handleReviewSuccess}
        />
      </div>
  );
};

export default MyOrdersPage;