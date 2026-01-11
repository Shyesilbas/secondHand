import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {ROUTES} from '../../common/constants/routes.js';
import {RefreshCw, Eye, Receipt, ArrowUp, ArrowDown, CheckCircle, Pencil, X, Sparkles, AlertCircle, BarChart3, Package, Calendar, CreditCard, MoreVertical, ChevronRight} from 'lucide-react';

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
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    loadPage(0);
  };

  const handleStartEditName = (order, e) => {
    e.stopPropagation();
    setEditingOrderId(order.id);
    setEditingOrderName(order.name || '');
  };

  const handleCancelEditName = () => {
    setEditingOrderId(null);
    setEditingOrderName('');
  };

  const handleSaveOrderName = async (orderId, e) => {
    e.stopPropagation();
    try {
      await orderService.updateOrderName(orderId, editingOrderName);
      setEditingOrderId(null);
      setEditingOrderName('');
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order name');
    }
  };

  const navigate = useNavigate();

  return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-base font-semibold text-gray-900 tracking-tight">Orders</h1>
                {orders.some(order => order.status === 'DELIVERED' && order.status !== 'COMPLETED') && (
                  <span className="flex items-center justify-center w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                )}
              </div>
              {orders.length > 0 && (
                <p className="text-xs text-gray-500 font-medium">
                  {pagination?.totalElements || orders.length} {pagination?.totalElements === 1 ? 'order' : 'orders'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.BUYER_DASHBOARD)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {showNameBanner && (
            <div className="mb-6 bg-blue-50/80 border border-blue-200/60 rounded-lg p-4 flex items-center justify-between">
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
                onClick={() => setShowNameBanner(false)}
                className="p-1 hover:bg-blue-100 rounded-md text-blue-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="mb-6">
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
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-white border border-gray-200/60 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : !orders.length && !isSearchMode ? (
            <div className="bg-white border border-gray-200/60 rounded-lg p-12 text-center">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const itemsCount = order.orderItems?.length || 0;
                const firstItem = order.orderItems?.[0];
                const isCompleted = order.status === 'COMPLETED';
                
                return (
                  <div
                    key={order.id}
                    onClick={() => openOrderModal(order)}
                    className={`group bg-white border border-gray-200/60 rounded-lg p-5 cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm ${
                      isCompleted ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-200/60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-3">
                          {editingOrderId === order.id ? (
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
                              <button
                                onClick={(e) => handleSaveOrderName(order.id, e)}
                                className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEditName}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {order.name || `Order #${order.orderNumber}`}
                                </h3>
                                {order.name && (
                                  <span className="text-[10px] text-gray-500 font-medium">#{order.orderNumber}</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleStartEditName(order, e)}
                                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit order name"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'COMPLETED' ? 'bg-emerald-500' :
                              order.status === 'DELIVERED' ? 'bg-blue-500' :
                              order.status === 'SHIPPED' ? 'bg-indigo-500' :
                              order.status === 'PROCESSING' ? 'bg-amber-500' :
                              order.status === 'CONFIRMED' ? 'bg-green-500' :
                              'bg-gray-400'
                            }`}></div>
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

                        {firstItem && (
                          <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-gray-100">
                            {firstItem?.listing?.imageUrl && (
                              <img 
                                src={firstItem.listing.imageUrl} 
                                alt={firstItem.listing.title}
                                className="w-8 h-8 rounded-md object-cover border border-gray-200"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {firstItem?.listing?.title || 'Item'}
                              </p>
                              {itemsCount > 1 && (
                                <p className="text-[10px] text-gray-500 mt-0.5">+{itemsCount - 1} more {itemsCount === 2 ? 'item' : 'items'}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(order.totalAmount, order.currency)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {order.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={(e) => handleCompleteOrder(order.id, e)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
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
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !isSearchMode && (
            <OrdersPagination
              pagination={pagination}
              isSearchMode={isSearchMode}
              loading={loading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
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