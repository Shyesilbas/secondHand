import React, {useEffect, useMemo, useState} from 'react';
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../common/formatters.js';
import {ReviewButton} from '../../reviews/index.js';
import {
  getLastUpdateInfo,
  getStatusColor,
  isCancellableStatus,
  isModifiableStatus,
  isRefundableStatus
} from '../orderConstants.js';
import {
  ORDER_LIMITS,
  ORDER_STATUSES,
  ORDER_VIEW_MODES,
} from '../constants/orderUiConstants.js';
import {
  getOrderStatusIndicatorClass,
  getPaymentStatusIndicatorClass,
  getPaymentStatusTextClass,
} from '../utils/statusPresentation.js';
import { DeliveryCountdown, OrderProgressStepper } from './orderDetails/OrderTimeline.jsx';
import { AddressSection, NotesSection } from './orderDetails/OrderEditableSections.jsx';
import { ShippingDetailsSection } from './orderDetails/ShippingDetailsSection.jsx';
import { ShipOrderForm } from './orderDetails/ShipOrderForm.jsx';
import { OrderPaymentSummary } from './orderDetails/OrderPaymentSummary.jsx';
import { useOrderDetailActions } from '../hooks/useOrderDetailActions.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import {
  Check,
  CheckCircle,
  MapPin,
  Package,
  Package2,
  Pencil,
  RotateCcw,
  User,
  X,
} from 'lucide-react';
import CancelRefundModal from './CancelRefundModal.jsx';

const StatusBadge = ({ label, type = 'rose' }) => {
  const styles = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${styles[type]}`}>{label}</span>
  );
};

const GlassCard = React.memo(({ children, className = '', critical = false }) => (
  <div
    className={`rounded-3xl border transition-all duration-300 ${
      critical
        ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800 shadow-lg'
        : 'bg-white/60 backdrop-blur-lg border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
    } ${className}`}
  >
    {children}
  </div>
));
GlassCard.displayName = 'GlassCard';

const OrderDetailsModal = React.memo(
  ({
    isOpen,
    selectedOrder,
    onClose,
    onOpenReceipt,
    viewMode = ORDER_VIEW_MODES.BUYER,
    orderReviews = {},
    reviewsLoading = false,
    onReviewSuccess,
  }) => {
    const isSellerView = viewMode === ORDER_VIEW_MODES.SELLER;
    const { enums } = useEnums();
    const notification = useNotification();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [orderName, setOrderName] = useState(selectedOrder?.name || '');

    // --- Address editing state ---
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

    // --- Notes editing state ---
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [orderNotes, setOrderNotes] = useState(selectedOrder?.notes || '');
    const {
      flags: { isSavingName, isProcessing, isSavingAddress, isSavingNotes },
      actions: {
        handleSaveName,
        handleCancelEditName,
        handleCancelOrder,
        handleRefundOrder,
        handleCompleteOrder,
        handleSaveAddress,
        handleSaveNotes,
      },
    } = useOrderDetailActions({
      isSellerView,
      selectedOrder,
      orderName,
      orderNotes,
      selectedShippingAddressId,
      selectedBillingAddressId,
      onReviewSuccess,
      notification,
      setIsEditingName,
      setOrderName,
      setIsEditingAddress,
      setIsEditingNotes,
    });

    const isModifiable = !isSellerView && isModifiableStatus(selectedOrder?.status, enums);

    const { addresses, loading: addressesLoading } = useAddresses({ enabled: isEditingAddress });

    useEffect(() => {
      if (selectedOrder) {
        setOrderName(selectedOrder.name || '');
        setOrderNotes(selectedOrder.notes || '');
        setIsEditingAddress(false);
        setIsEditingNotes(false);
      }
    }, [selectedOrder]);

    const orderItems = useMemo(() => selectedOrder?.orderItems || [], [selectedOrder]);

    const sellerTotalAmount = useMemo(() => {
      if (!isSellerView) return null;
      return orderItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    }, [isSellerView, orderItems]);

    const lastUpdate = useMemo(() => getLastUpdateInfo(selectedOrder), [selectedOrder]);


    const handleStartEditAddress = () => {
      setSelectedShippingAddressId(selectedOrder.shippingAddress?.id || null);
      setSelectedBillingAddressId(selectedOrder.billingAddress?.id || null);
      setIsEditingAddress(true);
    };

    const handleCancelEditAddress = () => {
      setIsEditingAddress(false);
    };


    const handleStartEditNotes = () => {
      setOrderNotes(selectedOrder.notes || '');
      setIsEditingNotes(true);
    };

    const handleCancelEditNotes = () => {
      setOrderNotes(selectedOrder.notes || '');
      setIsEditingNotes(false);
    };


    if (!isOpen || !selectedOrder) return null;

    const headerTitle = isSellerView
      ? `Order #${selectedOrder.orderNumber}`
      : selectedOrder.name || `Order #${selectedOrder.orderNumber}`;

    const stepperVariant = isSellerView ? 'wide' : 'compact';

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <div
          className={`w-full ${isSellerView ? 'max-w-5xl' : 'max-w-6xl'} max-h-[92vh] rounded-[2rem] border border-white/40 shadow-2xl shadow-indigo-900/20 bg-[#f8fafc]/95 backdrop-blur-xl overflow-hidden flex flex-col relative`}
        >
          {/* Decorative glows inside the modal */}
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-indigo-400/5 blur-[80px] rounded-full pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-400/5 blur-[60px] rounded-full pointer-events-none mix-blend-multiply" />

          <div
            className={`relative z-10 ${
              isSellerView ? 'px-8 py-6' : 'px-6 py-5'
            } bg-white/50 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between group`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isSellerView ? 'w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50' : 'w-10 h-10 rounded-lg border border-slate-200 bg-slate-50'
                } flex items-center justify-center`}
              >
                <Package className={`${isSellerView ? 'text-slate-600 w-6 h-6' : 'text-slate-600 w-5 h-5'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {!isSellerView && isEditingName ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                      <input
                        type="text"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-sm font-semibold text-gray-900 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Order name"
                        maxLength={ORDER_LIMITS.ORDER_NAME_MAX_LENGTH}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName}
                        className="p-1.5 hover:bg-blue-50 rounded-md transition-colors text-blue-600 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEditName}
                        disabled={isSavingName}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className={`${isSellerView ? 'text-xl font-semibold text-slate-900' : 'text-base font-semibold text-gray-900'}`}>
                        {headerTitle}
                      </h2>
                      {!isSellerView ? (
                        <>
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100"
                            title="Edit order name"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {selectedOrder.name ? (
                            <span className="text-xs text-gray-500 font-medium">#{selectedOrder.orderNumber}</span>
                          ) : null}
                        </>
                      ) : null}
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${getOrderStatusIndicatorClass(selectedOrder.status)}`} />
                        <span className={`${isSellerView ? 'text-[10px] font-semibold uppercase rounded-md border px-2 py-0.5' : 'text-xs font-medium'} ${getStatusColor(selectedOrder.status)}`}>
                          {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className={`${isSellerView ? 'text-sm text-slate-500 font-normal' : 'text-xs text-slate-500 font-medium mt-0.5'}`}>
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${isSellerView ? 'p-2 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200' : 'p-1.5 hover:bg-slate-100 rounded-md transition-colors'} text-slate-400 hover:text-slate-600`}
            >
              <X className={`${isSellerView ? 'w-6 h-6 text-slate-500' : 'w-5 h-5'}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className={`${isSellerView ? 'p-8' : 'p-6 sm:p-8'}`}>
              <GlassCard className={`p-6 mb-8`}>
                <h3 className={`${isSellerView ? 'text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4' : 'text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-5'}`}>
                  Tracking Progress
                </h3>
                <OrderProgressStepper currentStatus={selectedOrder.status} variant={stepperVariant} />
                <div className={`${isSellerView ? 'text-xs text-slate-500' : 'text-xs text-slate-500 font-medium'} mt-2`}>
                  Last update: {resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}
                  {lastUpdate.updatedAt ? ` • ${formatDateTime(lastUpdate.updatedAt)}` : ''}
                </div>

                {!isSellerView && selectedOrder.status === ORDER_STATUSES.DELIVERED && selectedOrder.shipping?.deliveredAt ? (
                  <DeliveryCountdown deliveredAt={selectedOrder.shipping.deliveredAt} />
                ) : null}

                {!isSellerView ? (
                  <div className="mt-6 flex justify-center gap-3">
                    {isCancellableStatus(selectedOrder.status, enums) ? (
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200/60 hover:bg-rose-50/80 rounded-md transition-all"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel Order
                      </button>
                    ) : null}
                    {isRefundableStatus(selectedOrder.status, enums) ? (
                      <>
                        <button
                          onClick={handleCompleteOrder}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve & Complete
                        </button>
                        <button
                          onClick={() => setRefundModalOpen(true)}
                          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Request Refund
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </GlassCard>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <GlassCard className={`p-6`}>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className={`${isSellerView ? 'text-sm font-semibold text-slate-900 flex items-center gap-2' : 'text-xs font-semibold text-gray-900 flex items-center gap-2'}`}>
                        <Package2 className={`${isSellerView ? 'w-4 h-4 text-indigo-500' : 'w-3.5 h-3.5 text-gray-600'}`} />{' '}
                        {isSellerView ? 'Sold Items' : 'Order Items'}
                      </h3>
                      <span className={`${isSellerView ? 'text-xs text-slate-400 font-normal' : 'text-[10px] text-gray-500 font-medium'}`}>
                        {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className={`${isSellerView ? 'divide-y divide-slate-50' : 'divide-y divide-gray-100'}`}>
                      {orderItems.map((item, idx) => {
                        const isCancelled = item.cancelledQuantity && item.cancelledQuantity > 0;
                        const isRefunded = item.refundedQuantity && item.refundedQuantity > 0;
                        const isFullyCancelled = isCancelled && item.cancelledQuantity >= item.quantity;
                        const isFullyRefunded = isRefunded && item.refundedQuantity >= item.quantity;
                        const isPartiallyCancelled = isCancelled && item.cancelledQuantity < item.quantity;
                        const isPartiallyRefunded = isRefunded && item.refundedQuantity < item.quantity;

                        return (
                          <div
                            key={idx}
                            className={`py-4 first:pt-0 last:pb-0 flex gap-3 ${isFullyCancelled || isFullyRefunded ? 'opacity-60' : ''}`}
                          >
                            <div
                              className={`${
                                isSellerView ? 'w-20 h-20 rounded-xl border border-slate-100 bg-slate-50' : 'w-16 h-16 rounded-lg border border-gray-200/60 bg-gray-50'
                              } overflow-hidden flex-shrink-0 relative`}
                            >
                              <img src={item.listing?.imageUrl} className="w-full h-full object-cover" alt={item.listing?.title || 'Listing'} />
                              {isFullyCancelled || isFullyRefunded ? (
                                <div className={`absolute inset-0 ${isSellerView ? 'bg-slate-900/40' : 'bg-gray-900/40'} flex items-center justify-center`}>
                                  <X className={`${isSellerView ? 'w-6 h-6' : 'w-5 h-5'} text-white`} />
                                </div>
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`${isSellerView ? 'text-sm font-semibold text-slate-900' : 'text-xs font-semibold text-gray-900'} line-clamp-1`}>
                                  {item.listing?.title}
                                </h4>
                                {isFullyCancelled ? <StatusBadge label="Cancelled" type="rose" /> : null}
                                {isFullyRefunded ? <StatusBadge label="Refunded" type="amber" /> : null}
                                {isPartiallyCancelled ? <StatusBadge label="Partially Cancelled" type="rose" /> : null}
                                {isPartiallyRefunded ? <StatusBadge label="Partially Refunded" type="amber" /> : null}
                              </div>
                              <p className={`${isSellerView ? 'text-xs text-slate-500 mt-1 font-normal' : 'text-[11px] text-gray-600 mt-1 font-medium'}`}>
                                Qty: {item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
                                {isCancelled ? <span className="ml-2 text-rose-600">({item.cancelledQuantity} cancelled)</span> : null}
                                {isRefunded ? <span className="ml-2 text-amber-600">({item.refundedQuantity} refunded)</span> : null}
                              </p>
                              {!isSellerView ? (
                                <p className="text-[11px] text-gray-600 mt-1 font-medium">
                                  Seller:{' '}
                                  <span className="font-semibold">
                                    {[item.sellerName, item.sellerSurname].filter(Boolean).join(' ') || '—'}
                                  </span>
                                </p>
                              ) : null}
                              {item.campaignName ? (
                                <span
                                  className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 ${
                                    isSellerView ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'bg-emerald-50/80 text-emerald-600 font-medium border border-emerald-200/60'
                                  } rounded-md`}
                                >
                                  PROMO: {item.campaignName}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
                              <span className={`${isSellerView ? 'text-sm font-semibold text-slate-900' : 'text-xs font-semibold text-gray-900'}`}>
                                {formatCurrency(item.totalPrice, selectedOrder.currency)}
                              </span>
                              {!isSellerView ? (
                                <ReviewButton
                                  orderItem={item}
                                  existingReview={orderReviews[item.id]}
                                  reviewsLoading={reviewsLoading}
                                  skipIndividualFetch
                                  onReviewCreated={onReviewSuccess}
                                  orderStatus={selectedOrder.status}
                                />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  {selectedOrder.shipping && (
                    <ShippingDetailsSection 
                      shipping={selectedOrder.shipping} 
                      CardComponent={GlassCard} 
                    />
                  )}

                  {isSellerView && (selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
                    <ShipOrderForm 
                      carriers={enums.carriers || []}
                      isProcessing={actions.flags.isProcessing}
                      onShip={actions.actions.handleShipOrder}
                      CardComponent={GlassCard}
                    />
                  )}

                  {!isSellerView ? (
                    <>
                      <AddressSection
                        CardComponent={GlassCard}
                        isEditingAddress={isEditingAddress}
                        addressesLoading={addressesLoading}
                        addresses={addresses}
                        selectedShippingAddressId={selectedShippingAddressId}
                        selectedBillingAddressId={selectedBillingAddressId}
                        setSelectedShippingAddressId={setSelectedShippingAddressId}
                        setSelectedBillingAddressId={setSelectedBillingAddressId}
                        handleSaveAddress={handleSaveAddress}
                        handleCancelEditAddress={handleCancelEditAddress}
                        handleStartEditAddress={handleStartEditAddress}
                        isSavingAddress={isSavingAddress}
                        selectedOrder={selectedOrder}
                        isModifiable={isModifiable}
                      />

                      <NotesSection
                        CardComponent={GlassCard}
                        isEditingNotes={isEditingNotes}
                        orderNotes={orderNotes}
                        setOrderNotes={setOrderNotes}
                        handleSaveNotes={handleSaveNotes}
                        handleCancelEditNotes={handleCancelEditNotes}
                        handleStartEditNotes={handleStartEditNotes}
                        isSavingNotes={isSavingNotes}
                        selectedOrder={selectedOrder}
                        isModifiable={isModifiable}
                      />
                    </>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {isSellerView ? (
                    <GlassCard className="p-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Buyer</h3>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {selectedOrder.buyerName || selectedOrder.buyerSurname
                              ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim()
                              : `User #${selectedOrder.userId}`}
                          </div>
                          {selectedOrder.buyerEmail ? (
                            <div className="text-xs text-slate-500 mt-0.5 truncate">{selectedOrder.buyerEmail}</div>
                          ) : null}
                        </div>
                      </div>
                    </GlassCard>
                  ) : null}

                  <OrderPaymentSummary
                    CardComponent={GlassCard}
                    isSellerView={isSellerView}
                    selectedOrder={selectedOrder}
                    sellerTotalAmount={sellerTotalAmount}
                    onOpenReceipt={onOpenReceipt}
                    resolveEnumLabel={(group, value) => resolveEnumLabel(enums, group, value)}
                    formatCurrency={formatCurrency}
                    getPaymentStatusIndicatorClass={getPaymentStatusIndicatorClass}
                    getPaymentStatusTextClass={getPaymentStatusTextClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {!isSellerView ? (
            <>
              <CancelRefundModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onSubmit={handleCancelOrder}
                type="cancel"
                order={selectedOrder}
              />
              <CancelRefundModal
                isOpen={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                onSubmit={handleRefundOrder}
                type="refund"
                order={selectedOrder}
              />
            </>
          ) : null}
        </div>
      </div>
    );
  }
);

OrderDetailsModal.displayName = 'OrderDetailsModal';

export default OrderDetailsModal;

