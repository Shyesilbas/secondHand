import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import {orderService} from '../services/orderService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useSellerOrders} from '../hooks/useSellerOrders.js';
import {usePendingEscrowAmount} from '../hooks/usePendingEscrowAmount.js';
import OrdersSearch from '../components/OrdersSearch.jsx';
import OrdersPagination from '../components/OrdersPagination.jsx';
import ISoldModal from '../components/ISoldModal.jsx';
import {useOrdersSearch} from '../hooks/useOrdersSearch.js';
import {useOrdersReceipt} from '../hooks/useOrdersReceipt.js';
import {getStatusColor} from '../utils/orderUtils.js';
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';
import {RefreshCw, Eye, Receipt, Wallet, Info, BarChart3, Package, Calendar, CreditCard, ChevronRight} from 'lucide-react';

const ISoldPage = () => {
  const { enums } = useEnums();
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  
  const {
    orders,
    loading,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  } = useSellerOrders(0, 5, sortField, sortDirection);

  const { 
    pendingEscrowAmount, 
    isLoading: loadingEscrow, 
    refetch: refetchEscrow 
  } = usePendingEscrowAmount();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const { receiptOpen, receiptPayment, openReceipt, closeReceipt } = useOrdersReceipt();
  
  const openOrderModal = async (order) => {
    try {
      const freshOrder = await orderService.getSellerOrderById(order.id);
      setSelectedOrder(freshOrder);
      setOrderModalOpen(true);
    } catch (error) {
      console.error('Error fetching order:', error);
      setSelectedOrder(order);
      setOrderModalOpen(true);
    }
  };
  
  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setSelectedOrder(null);
  };
  const { 
    searchTerm, 
    setSearchTerm, 
    searchLoading, 
    searchError, 
    isSearchMode, 
    handleSearch, 
    clearSearch 
  } = useOrdersSearch(setSearchOrder, refresh);

  const navigate = useNavigate();


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

  const handleRefresh = () => {
    refresh();
    refetchEscrow();
  };

  return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold text-gray-900 tracking-tight mb-0.5">I Sold</h1>
                {orders.length > 0 && (
                  <p className="text-xs text-gray-500 font-medium">
                    {pagination?.totalElements || orders.length} {pagination?.totalElements === 1 ? 'sale' : 'sales'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.SELLER_DASHBOARD)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {!loadingEscrow && (
            <div className={`mb-6 p-4 rounded-lg border ${
              pendingEscrowAmount > 0 
                ? 'bg-blue-50/80 border-blue-200/60' 
                : 'bg-gray-50 border-gray-200/60'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md flex-shrink-0 ${
                  pendingEscrowAmount > 0 ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <Wallet className={`w-3.5 h-3.5 ${
                    pendingEscrowAmount > 0 ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold mb-1 ${
                    pendingEscrowAmount > 0 ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Escrow Amount
                  </div>
                  <div className={`text-lg font-semibold font-mono mb-2 ${
                    pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {formatCurrency(pendingEscrowAmount)}
                  </div>
                  <div className={`text-[11px] mb-3 ${
                    pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {pendingEscrowAmount > 0 
                      ? 'This amount will be released to your wallet when orders are completed'
                      : 'No pending escrow amount at the moment'
                    }
                  </div>
                  {pendingEscrowAmount > 0 && orders.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200/60">
                      <div className="text-[10px] font-semibold text-blue-900 mb-2">Pending by Order:</div>
                      <div className="space-y-1.5">
                        {orders
                          .filter(order => {
                            const escrowAmt = parseFloat(order.escrowAmount) || 0;
                            return escrowAmt > 0;
                          })
                          .map(order => {
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
                              if (daysLeft > 0) {
                                parts.push(`${daysLeft} day${daysLeft !== 1 ? 's' : ''}`);
                              }
                              if (hoursLeft > 0) {
                                parts.push(`${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`);
                              }
                              if (minutesLeft > 0) {
                                parts.push(`${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`);
                              }
                              
                              if (parts.length > 0) {
                                const timeString = parts.join(', ');
                                tooltipText = `The escrow amount will be automatically released in ${timeString} (48 hours after delivery), if not confirmed earlier by the buyer.`;
                              } else {
                                tooltipText = 'The escrow amount will be automatically released soon (48 hours after delivery), if not confirmed earlier by the buyer.';
                              }
                            }
                            
                            return (
                              <div key={order.id} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => openOrderModal(order)}
                                    className="text-blue-800 hover:text-blue-900 hover:underline cursor-pointer text-left font-medium"
                                  >
                                    Order #{order.orderNumber}
                                  </button>
                                  <div className="relative group">
                                    <Info className="w-3 h-3 text-blue-600 cursor-help hover:text-blue-700 transition-colors" />
                                    <div className="absolute left-0 bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl">
                                      <div className="space-y-1.5">
                                        <div className="font-semibold text-white">Escrow Release Information</div>
                                        <div className="text-slate-300 leading-relaxed">
                                          {tooltipText}
                                        </div>
                                      </div>
                                      <div className="absolute left-4 bottom-0 transform translate-y-full">
                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <span className="font-semibold font-mono text-blue-700">{formatCurrency(escrowAmt, order.currency)}</span>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
              <p className="text-xs font-medium text-gray-500">No sales yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const sellerOrderItems = order.orderItems || [];
                const sellerTotalAmount = sellerOrderItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
                const itemsCount = sellerOrderItems.length;
                const firstItem = sellerOrderItems?.[0];
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
                          <h3 className="text-sm font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
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
                              <p className="text-sm font-semibold text-gray-900 font-mono">
                                {formatCurrency(sellerTotalAmount, order.currency)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
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
        
        <ISoldModal
            isOpen={orderModalOpen}
            selectedOrder={selectedOrder}
            onClose={closeOrderModal}
            onOpenReceipt={openReceipt}
        />
      </div>
  );
};

export default ISoldPage;

