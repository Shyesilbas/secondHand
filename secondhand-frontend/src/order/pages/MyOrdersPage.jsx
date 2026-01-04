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
import {RefreshCw, Eye, Receipt, ArrowUp, ArrowDown, CheckCircle, Pencil, X, Sparkles, AlertCircle} from 'lucide-react';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const [sortField, setSortField] = useState(null); // 'createdAt' or 'totalAmount'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOrderName, setEditingOrderName] = useState('');
  const [showNameBanner, setShowNameBanner] = useState(true);
  
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
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-text-primary">My Orders</h1>
                {orders.some(order => order.status === 'DELIVERED' && order.status !== 'COMPLETED') && (
                  <span className="flex items-center justify-center w-4 h-4 text-[10px] font-semibold text-white bg-red-500 rounded-full">!</span>
                )}
              </div>
              {orders.length > 0 && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {pagination?.totalElements || orders.length} total
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {showNameBanner && (
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Now you can name your orders!</p>
                  <p className="text-xs text-blue-700 mt-0.5">Give your orders custom names to easily identify them later. Click the edit icon next to any order name to get started.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNameBanner(false)}
                className="p-1 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

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
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Payment</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Items</th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none border-r border-gray-200"
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
                      className="px-4 py-2 text-left text-xs font-semibold text-text-secondary cursor-pointer hover:bg-secondary-100 select-none border-r border-gray-200"
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
                    <th className="px-4 py-2 text-right text-xs font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {orders.map((order) => {
                    const itemsCount = order.orderItems?.length || 0;
                    const firstItem = order.orderItems?.[0];
                    
                    return (
                      <tr key={order.id} className="hover:bg-secondary-50 cursor-pointer" onClick={() => openOrderModal(order)}>
                        <td className="px-4 py-2.5">
                          {editingOrderId === order.id ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingOrderName}
                                onChange={(e) => setEditingOrderName(e.target.value)}
                                className="flex-1 px-2 py-1 text-xs font-medium text-text-primary border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="Order name"
                                maxLength={100}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => handleSaveOrderName(order.id, e)}
                                className="p-1 hover:bg-blue-50 rounded text-blue-600"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                onClick={handleCancelEditName}
                                className="p-1 hover:bg-slate-50 rounded text-slate-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-text-primary">
                                {order.name || `Order #${order.orderNumber}`}
                              </span>
                              {order.name && (
                                <span className="text-[10px] text-text-secondary">#{order.orderNumber}</span>
                              )}
                              <button
                                onClick={(e) => handleStartEditName(order, e)}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Edit order name"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                            {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
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