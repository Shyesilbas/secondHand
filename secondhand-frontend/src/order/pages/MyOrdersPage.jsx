import React from 'react';
import {orderService} from '../services/orderService.js';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import PaymentReceiptModal from '../../common/components/modals/PaymentReceiptModal.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import {useOrders} from '../hooks/useOrders.js';
import OrdersHeader from '../components/OrdersHeader.jsx';
import OrdersSearch from '../components/OrdersSearch.jsx';
import OrdersList from '../components/OrdersList.jsx';
import OrdersPagination from '../components/OrdersPagination.jsx';
import OrderModal from '../components/OrderModal.jsx';
import {useOrdersSearch} from '../hooks/useOrdersSearch.js';
import {useOrdersModal} from '../hooks/useOrdersModal.js';
import {useOrdersReceipt} from '../hooks/useOrdersReceipt.js';
import {useOrdersReviews} from '../hooks/useOrdersReviews.js';
import {getEstimatedDeliveryTime, getStatusColor} from '../utils/orderUtils.js';

const MyOrdersPage = () => {
  const { enums } = useEnums();
  const {
    orders,
    loading,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  } = useOrders(0, 5);

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

  const handlePageChange = (page) => {
    if (!isSearchMode) {
      loadPage(page);
    }
  };

  const handlePageSizeChange = (size) => {
    fetchOrders(0, size);
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
          <OrdersHeader />

          <OrdersSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchLoading={searchLoading}
            searchError={searchError}
            isSearchMode={isSearchMode}
            onSearch={handleSearch}
            onClearSearch={clearSearch}
          />

          <OrdersList
            orders={orders}
            enums={enums}
            onOpenOrderModal={openOrderModal}
            onOpenReceipt={openReceipt}
            getStatusColor={getStatusColor}
            getEstimatedDeliveryTime={getEstimatedDeliveryTime}
          />

          <OrdersPagination
            pagination={pagination}
            isSearchMode={isSearchMode}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
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