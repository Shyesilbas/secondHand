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
import {orderService} from '../services/orderService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {useEnums} from '../../common/hooks/useEnums.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import {
  AlertCircle,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  Home,
  MapPin,
  Package,
  Package2,
  Pencil,
  Receipt,
  RotateCcw,
  Save,
  Tag,
  Timer,
  Truck,
  User,
  X,
} from 'lucide-react';
import CancelRefundModal from './CancelRefundModal.jsx';

const StatusBadge = ({ label, type = 'rose' }) => {
  const styles = { rose: 'bg-rose-50/80 border-rose-200/60 text-rose-600', amber: 'bg-amber-50/80 border-amber-200/60 text-amber-600' };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${styles[type]}`}>{label}</span>
  );
};

const GlassCard = ({ children, className = '', critical = false }) => (
  <div
    className={`rounded-2xl border backdrop-blur-sm transition-all ${
      critical
        ? 'bg-slate-900 text-white border-white/10 shadow-lg shadow-slate-900/10'
        : 'bg-white/80 border-slate-200/60 shadow-sm'
    } ${className}`}
  >
    {children}
  </div>
);

const DeliveryCountdown = ({ deliveredAt }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!deliveredAt) return;

    const update = () => {
      const deadline = new Date(new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000);
      const diff = deadline - new Date();
      if (diff <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }
      setTimeRemaining({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [deliveredAt]);

  if (!timeRemaining) return null;

  const critical = !timeRemaining.expired;
  return (
    <GlassCard critical={critical} className="mt-5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${critical ? 'bg-white/10' : 'bg-slate-200'}`}>
            <Timer className={`w-3.5 h-3.5 ${critical ? 'text-emerald-400' : 'text-slate-600'}`} />
          </div>
          <div>
            <p className={`text-xs font-semibold ${critical ? 'text-white' : 'text-slate-900'}`}>Confirmation Window</p>
            <p className={`text-[11px] font-medium mt-0.5 ${critical ? 'text-slate-400' : 'text-slate-500'}`}>
              {timeRemaining.expired ? 'Window closed. Order finalizing...' : 'Verify your items before the timer ends'}
            </p>
          </div>
        </div>
        {critical ? (
          <div className="flex gap-1.5 items-baseline">
            <span className="text-lg font-mono font-semibold text-emerald-400">{String(timeRemaining.h).padStart(2, '0')}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">h</span>
            <span className="text-lg font-mono font-semibold text-emerald-400">{String(timeRemaining.m).padStart(2, '0')}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">m</span>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
};

const OrderProgressStepper = ({ currentStatus, variant = 'compact' }) => {
  const steps = [
    { key: 'PENDING', label: 'Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PROCESSING', label: 'Preparing', icon: Package2 },
    { key: 'SHIPPED', label: 'On Way', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
    { key: 'COMPLETED', label: 'Finalized', icon: Check },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStatus);
  const isFailed = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED';

  if (variant === 'wide') {
    return (
      <div className="py-8 px-2">
        <div className="relative flex justify-between">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
          <div
            className="absolute top-5 left-0 h-[2px] bg-emerald-500 transition-all duration-1000 -z-10"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" aria-hidden />
                  )}
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100'
                        : 'bg-white/90 backdrop-blur-sm border-slate-200/80 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-500/30 ring-offset-2 ring-offset-white' : ''}`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.5px]" />
                  </div>
                </div>
                <span
                  className={`mt-3 text-[11px] font-semibold uppercase tracking-tight ${
                    isDone ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        {isFailed ? (
          <div className="mt-4 flex justify-center">
            <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-100 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Status: {currentStatus}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="py-6 px-1">
      <div className="relative flex items-center">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center group relative z-10">
                <div className="relative">
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" aria-hidden />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white/90 backdrop-blur-sm border-slate-200/80 text-slate-400'
                    } ${isCurrent ? 'ring-2 ring-emerald-500/30 ring-offset-1' : ''}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium uppercase tracking-wide ${
                    isDone ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast ? (
                <div className="flex-1 mx-1.5 relative" style={{ height: '1.5px' }}>
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
                  {isDone ? <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 w-full" /> : null}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      {isFailed ? (
        <div className="mt-4 flex justify-center">
          <span className="px-2.5 py-1 bg-rose-50/80 text-rose-600 text-[10px] font-medium rounded-md border border-rose-200/60 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3" /> {currentStatus}
          </span>
        </div>
      ) : null}
    </div>
  );
};

const OrderDetailsModal = React.memo(
  ({
    isOpen,
    selectedOrder,
    onClose,
    onOpenReceipt,
    viewMode = 'buyer',
    orderReviews = {},
    reviewsLoading = false,
    onReviewSuccess,
  }) => {
    const isSellerView = viewMode === 'seller';
    const { enums } = useEnums();
    const notification = useNotification();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [orderName, setOrderName] = useState(selectedOrder?.name || '');
    const [isSavingName, setIsSavingName] = useState(false);

    // --- Address editing state ---
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // --- Notes editing state ---
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [orderNotes, setOrderNotes] = useState(selectedOrder?.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

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

    const handleSaveName = async () => {
      if (isSellerView) return;
      if (orderName.length > 100) {
        notification.showError('Error', 'Order name must be 100 characters or less');
        return;
      }
      setIsSavingName(true);
      try {
        await orderService.updateOrderName(selectedOrder.id, orderName);
        setIsEditingName(false);
        notification.showSuccess('Success', 'Order name updated successfully');
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to update order name');
      } finally {
        setIsSavingName(false);
      }
    };

    const handleCancelEdit = () => {
      setOrderName(selectedOrder?.name || '');
      setIsEditingName(false);
    };

    const handleCancelOrder = async (payload) => {
      if (isSellerView) return;
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        await orderService.cancelOrder(selectedOrder.id, payload);
        notification.showSuccess('Success', 'Order cancelled successfully');
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to cancel order');
        throw error;
      } finally {
        setIsProcessing(false);
      }
    };

    const handleRefundOrder = async (payload) => {
      if (isSellerView) return;
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        await orderService.refundOrder(selectedOrder.id, payload);
        notification.showSuccess('Success', 'Refund requested successfully');
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to request refund');
        throw error;
      } finally {
        setIsProcessing(false);
      }
    };

    const handleCompleteOrder = async () => {
      if (isSellerView) return;
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        await orderService.completeOrder(selectedOrder.id);
        notification.showSuccess('Success', 'Order completed successfully');
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to complete order');
      } finally {
        setIsProcessing(false);
      }
    };

    const handleStartEditAddress = () => {
      setSelectedShippingAddressId(selectedOrder.shippingAddress?.id || null);
      setSelectedBillingAddressId(selectedOrder.billingAddress?.id || null);
      setIsEditingAddress(true);
    };

    const handleCancelEditAddress = () => {
      setIsEditingAddress(false);
    };

    const handleSaveAddress = async () => {
      if (!selectedShippingAddressId) {
        notification.showError('Error', 'Please select a shipping address');
        return;
      }
      setIsSavingAddress(true);
      try {
        await orderService.updateOrderAddress(selectedOrder.id, selectedShippingAddressId, selectedBillingAddressId);
        setIsEditingAddress(false);
        notification.showSuccess('Success', 'Order address updated successfully');
        if (onReviewSuccess) onReviewSuccess();
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to update address');
      } finally {
        setIsSavingAddress(false);
      }
    };

    const handleStartEditNotes = () => {
      setOrderNotes(selectedOrder.notes || '');
      setIsEditingNotes(true);
    };

    const handleCancelEditNotes = () => {
      setOrderNotes(selectedOrder.notes || '');
      setIsEditingNotes(false);
    };

    const handleSaveNotes = async () => {
      if (orderNotes.length > 1000) {
        notification.showError('Error', 'Notes must be 1000 characters or less');
        return;
      }
      setIsSavingNotes(true);
      try {
        await orderService.updateOrderNotes(selectedOrder.id, orderNotes);
        setIsEditingNotes(false);
        notification.showSuccess('Success', 'Order notes updated successfully');
        if (onReviewSuccess) onReviewSuccess();
      } catch (error) {
        notification.showError('Error', error?.response?.data?.message || 'Failed to update notes');
      } finally {
        setIsSavingNotes(false);
      }
    };

    if (!isOpen || !selectedOrder) return null;

    const headerTitle = isSellerView
      ? `Order #${selectedOrder.orderNumber}`
      : selectedOrder.name || `Order #${selectedOrder.orderNumber}`;

    const stepperVariant = isSellerView ? 'wide' : 'compact';

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          isSellerView ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-gray-900/40 backdrop-blur-sm'
        } animate-in fade-in duration-300`}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      >
        <div
          className={`w-full ${isSellerView ? 'max-w-5xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-900/20' : 'max-w-6xl rounded-xl border border-gray-200/60 shadow-xl shadow-gray-900/20'} max-h-[92vh] bg-white overflow-hidden flex flex-col`}
        >
          <div
            className={`${
              isSellerView ? 'px-8 py-6 bg-slate-50/50 border-b border-slate-100' : 'px-6 py-5 bg-white border-b border-gray-200/60'
            } flex items-center justify-between group`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isSellerView ? 'w-12 h-12 rounded-2xl shadow-sm border border-slate-200 bg-white' : 'w-10 h-10 rounded-lg border border-gray-200/60 bg-gray-50'
                } flex items-center justify-center`}
              >
                <Package className={`${isSellerView ? 'text-slate-700 w-6 h-6' : 'text-gray-700 w-5 h-5'}`} />
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
                        maxLength={100}
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
                        onClick={handleCancelEdit}
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
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
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
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            selectedOrder.status === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : selectedOrder.status === 'DELIVERED'
                                ? 'bg-blue-500'
                                : selectedOrder.status === 'SHIPPED'
                                  ? 'bg-indigo-500'
                                  : selectedOrder.status === 'PROCESSING'
                                    ? 'bg-amber-500'
                                    : selectedOrder.status === 'CONFIRMED'
                                      ? 'bg-green-500'
                                      : 'bg-gray-400'
                          }`}
                        />
                        <span className={`${isSellerView ? 'text-[10px] font-semibold uppercase rounded-md border px-2 py-0.5' : 'text-xs font-medium'} ${getStatusColor(selectedOrder.status)}`}>
                          {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <p className={`${isSellerView ? 'text-sm text-slate-500 font-normal' : 'text-xs text-gray-500 font-medium mt-0.5'}`}>
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${isSellerView ? 'p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200' : 'p-1.5 hover:bg-gray-100 rounded-md transition-colors'} text-gray-400 hover:text-gray-600`}
            >
              <X className={`${isSellerView ? 'w-6 h-6 text-slate-400' : 'w-5 h-5'}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className={`${isSellerView ? 'p-8' : 'p-6'}`}>
              <GlassCard className={`p-6 mb-8`}>
                <h3 className={`${isSellerView ? 'text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4' : 'text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-5'}`}>
                  Tracking Progress
                </h3>
                <OrderProgressStepper currentStatus={selectedOrder.status} variant={stepperVariant} />
                <div className={`${isSellerView ? 'text-xs text-slate-500' : 'text-xs text-gray-500 font-medium'} mt-2`}>
                  Last update: {resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}
                  {lastUpdate.updatedAt ? ` • ${formatDateTime(lastUpdate.updatedAt)}` : ''}
                </div>

                {!isSellerView && selectedOrder.status === 'DELIVERED' && selectedOrder.shipping?.deliveredAt ? (
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

                  {!isSellerView ? (
                    <>
                      {isEditingAddress ? (
                        <GlassCard className="p-4">
                          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Edit Addresses
                          </h4>
                          {addressesLoading ? (
                            <p className="text-xs text-slate-500">Loading addresses...</p>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Shipping Address *</label>
                                <select
                                  value={selectedShippingAddressId || ''}
                                  onChange={(e) => setSelectedShippingAddressId(Number(e.target.value))}
                                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
                                >
                                  <option value="">Select address...</option>
                                  {addresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                      {addr.addressLine} — {addr.city}, {addr.postalCode}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Billing Address (optional)</label>
                                <select
                                  value={selectedBillingAddressId || ''}
                                  onChange={(e) => setSelectedBillingAddressId(e.target.value ? Number(e.target.value) : null)}
                                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
                                >
                                  <option value="">Same as shipping</option>
                                  {addresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                      {addr.addressLine} — {addr.city}, {addr.postalCode}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={handleSaveAddress}
                                  disabled={isSavingAddress || addressesLoading}
                                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save Address
                                </button>
                                <button
                                  onClick={handleCancelEditAddress}
                                  disabled={isSavingAddress}
                                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <GlassCard className="p-4">
                              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Shipping Address
                              </h4>
                              <p className="text-xs font-semibold text-slate-900">{selectedOrder.shippingAddress?.addressLine}</p>
                              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                              </p>
                            </GlassCard>
                            <GlassCard className="p-4">
                              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                <Receipt className="w-3 h-3" /> Billing Details
                              </h4>
                              <p className="text-xs font-semibold text-slate-900">{selectedOrder.billingAddress?.addressLine || 'Same as shipping'}</p>
                              <p className="text-[11px] text-slate-500 mt-1 font-medium">TR VAT: {selectedOrder.orderNumber}</p>
                            </GlassCard>
                          </div>
                          {isModifiable ? (
                            <button
                              onClick={handleStartEditAddress}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50/80 border border-blue-200/60 hover:bg-blue-100/80 rounded-lg transition-all"
                            >
                              <MapPin className="w-3.5 h-3.5" /> Change Address
                            </button>
                          ) : null}
                        </>
                      )}

                      {isEditingNotes ? (
                        <GlassCard className="p-4">
                          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Edit Order Notes
                          </h4>
                          <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            maxLength={1000}
                            rows={3}
                            className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white resize-none"
                            placeholder="Add a note to your order..."
                          />
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-slate-400">{orderNotes.length}/1000</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Save className="w-3.5 h-3.5" /> Save Notes
                              </button>
                              <button
                                onClick={handleCancelEditNotes}
                                disabled={isSavingNotes}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      ) : (
                        <GlassCard className="p-4">
                          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" /> Order Notes
                          </h4>
                          {selectedOrder.notes ? (
                            <p className="text-xs text-slate-900 font-medium leading-relaxed whitespace-pre-wrap mb-3">{selectedOrder.notes}</p>
                          ) : (
                            <p className="text-xs text-slate-400 italic mb-3">No notes.</p>
                          )}
                          {isModifiable ? (
                            <button
                              onClick={handleStartEditNotes}
                              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50/80 border border-blue-200/60 hover:bg-blue-100/80 rounded-lg transition-all"
                            >
                              <FileText className="w-3.5 h-3.5" /> {selectedOrder.notes ? 'Edit Notes' : 'Add Note'}
                            </button>
                          ) : null}
                        </GlassCard>
                      )}
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

                  <GlassCard critical className={`${isSellerView ? 'p-6' : 'p-5'}`}>
                    <h3 className={`${isSellerView ? 'text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5' : 'text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-5'}`}>
                      Payment Summary
                    </h3>
                    {selectedOrder.paymentStatus ? (
                      <div className="mb-4 pb-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-400">Payment Status</span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                selectedOrder.paymentStatus === 'PAID'
                                  ? 'bg-emerald-400'
                                  : selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED'
                                    ? 'bg-amber-400'
                                    : selectedOrder.paymentStatus === 'REFUNDED'
                                      ? 'bg-rose-400'
                                      : selectedOrder.paymentStatus === 'PENDING'
                                        ? 'bg-slate-400'
                                        : 'bg-red-400'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-medium ${
                                selectedOrder.paymentStatus === 'PAID'
                                  ? 'text-emerald-400'
                                  : selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED'
                                    ? 'text-amber-400'
                                    : selectedOrder.paymentStatus === 'REFUNDED'
                                      ? 'text-rose-400'
                                      : selectedOrder.paymentStatus === 'PENDING'
                                        ? 'text-slate-400'
                                        : 'text-red-400'
                              }`}
                            >
                              {resolveEnumLabel(enums, 'paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {!isSellerView ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-medium">Subtotal</span>
                          <span className="font-mono text-slate-300">
                            {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
                          </span>
                        </div>
                      ) : null}

                      {!isSellerView && selectedOrder.couponDiscount > 0 ? (
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <Tag className="w-3 h-3" /> Discount
                          </span>
                          <span className="text-emerald-400 font-mono">
                            -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
                          </span>
                        </div>
                      ) : null}

                      <div className="h-px bg-white/10 my-2" />

                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-medium text-slate-400">Total Amount</span>
                        <span className="text-xl font-semibold font-mono tracking-tight">
                          {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-medium text-slate-400">Payment Method</span>
                        <span className="text-xl font-semibold font-mono tracking-tight">{selectedOrder.paymentMethod}</span>
                      </div>
                    </div>

                    {selectedOrder.paymentReference && onOpenReceipt ? (
                      <button
                        onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
                        className={`w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 ${isSellerView ? 'rounded-xl' : 'rounded-md'} text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10`}
                      >
                        <FileText className="w-3.5 h-3.5" /> View Digital Receipt
                      </button>
                    ) : null}
                  </GlassCard>
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

