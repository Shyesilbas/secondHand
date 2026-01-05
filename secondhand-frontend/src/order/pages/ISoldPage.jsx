import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import {orderService} from '../services/orderService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useSellerOrders} from '../hooks/useSellerOrders.js';
import OrdersSearch from '../components/OrdersSearch.jsx';
import OrdersPagination from '../components/OrdersPagination.jsx';
import ISoldModal from '../components/ISoldModal.jsx';
import {useOrdersSearch} from '../hooks/useOrdersSearch.js';
import {useOrdersReceipt} from '../hooks/useOrdersReceipt.js';
import {getStatusColor} from '../utils/orderUtils.js';
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../common/formatters.js';
import {ROUTES} from '../../common/constants/routes.js';
import {RefreshCw, Eye, Receipt, ArrowUp, ArrowDown, Wallet, Info, BarChart3} from 'lucide-react';

const ISoldPage = () => {
  const { enums } = useEnums();
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');
  const [pendingEscrowAmount, setPendingEscrowAmount] = useState(null);
  const [loadingEscrow, setLoadingEscrow] = useState(true);
  
  const {
    orders,
    loading,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  } = useSellerOrders(0, 5, sortField, sortDirection);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const { receiptOpen, receiptPayment, openReceipt, closeReceipt } = useOrdersReceipt();
  
  const openOrderModal = async (order) => {
    try {
      const freshOrder = await orderService.getById(order.id);
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

  useEffect(() => {
    const fetchPendingEscrowAmount = async () => {
      try {
        setLoadingEscrow(true);
        const response = await orderService.getPendingEscrowAmount();
        setPendingEscrowAmount(response.amount || 0);
      } catch (err) {
        console.error('Error fetching pending escrow amount:', err);
        setPendingEscrowAmount(0);
      } finally {
        setLoadingEscrow(false);
      }
    };
    fetchPendingEscrowAmount();
    const interval = setInterval(fetchPendingEscrowAmount, 30000);
    return () => clearInterval(interval);
  }, []);


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
    orderService.getPendingEscrowAmount()
      .then(response => setPendingEscrowAmount(response.amount || 0))
      .catch(err => console.error('Error fetching pending escrow amount:', err));
  };

  return (
      <div className="min-h-screen bg-background-secondary">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-sm font-semibold text-text-primary">I Sold</h1>
              {orders.length > 0 && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {pagination?.totalElements || orders.length} total
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(ROUTES.SELLER_DASHBOARD)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Check Your Analytics</span>
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {!loadingEscrow && pendingEscrowAmount !== null && (
            <div className={`mb-6 p-5 rounded-xl border-2 ${
              pendingEscrowAmount > 0 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  pendingEscrowAmount > 0 ? 'bg-blue-100' : 'bg-gray-200'
                }`}>
                  <Wallet className={`w-6 h-6 ${
                    pendingEscrowAmount > 0 ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold mb-1 ${
                    pendingEscrowAmount > 0 ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Escrow Amount
                  </div>
                  <div className={`text-2xl font-bold mb-2 ${
                    pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {formatCurrency(pendingEscrowAmount)}
                  </div>
                  <div className={`text-xs mb-3 ${
                    pendingEscrowAmount > 0 ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {pendingEscrowAmount > 0 
                      ? 'This amount will be released to your wallet when orders are completed'
                      : 'No pending escrow amount at the moment'
                    }
                  </div>
                  {pendingEscrowAmount > 0 && orders.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs font-semibold text-blue-900 mb-2">Pending by Order:</div>
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
                              <div key={order.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => openOrderModal(order)}
                                    className="text-blue-800 hover:text-blue-900 hover:underline cursor-pointer text-left"
                                  >
                                    Order #{order.orderNumber}
                                  </button>
                                  <div className="relative group">
                                    <Info className="w-3.5 h-3.5 text-blue-600 cursor-help hover:text-blue-700 transition-colors" />
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
                                <span className="font-semibold text-blue-700">{formatCurrency(escrowAmt, order.currency)}</span>
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

          <OrdersSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSearch={handleSearch}
            onClear={clearSearch}
            loading={searchLoading}
            error={searchError}
          />

          {loading && !searchLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingIndicator />
            </div>
          )}

          {!loading && !searchLoading && orders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">No sales found</p>
            </div>
          )}

          {!loading && !searchLoading && orders.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Order</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">Status</th>
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
                    <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary border-r border-gray-200">Last Update</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {orders.map((order) => {
                    const sellerOrderItems = order.orderItems || [];
                    const sellerTotalAmount = sellerOrderItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
                    const itemsCount = sellerOrderItems.length;
                    const firstItem = sellerOrderItems?.[0];
                    const isCompleted = order.status === 'COMPLETED';
                    
                    return (
                      <tr key={order.id} className={`cursor-pointer ${isCompleted ? 'bg-gradient-to-r from-emerald-50 to-green-50/80 hover:from-emerald-100 hover:to-green-100' : 'hover:bg-secondary-50'}`} onClick={() => openOrderModal(order)}>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-text-primary">
                              Order #{order.orderNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                            {resolveEnumLabel(enums, 'orderStatuses', order.status) || order.status}
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
                            {formatCurrency(sellerTotalAmount, order.currency)}
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
                          <span className="text-xs text-gray-600">
                            {formatDateTime(order.updatedAt)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
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

