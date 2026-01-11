import React, {useEffect, useState} from 'react'
import {formatCurrency, formatDateTime} from '../../common/formatters.js'
import {ReviewButton} from '../../reviews/index.js'
import {getEstimatedDeliveryTime, getStatusColor} from '../utils/orderUtils.js'
import {orderService} from '../services/orderService.js'
import {useNotification} from '../../notification/NotificationContext.jsx'
import {
    AlertCircle,
    Check,
    CheckCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Home,
    MapPin,
    Package,
    Package2,
    Pencil,
    Receipt,
    RotateCcw,
    Tag,
    Timer,
    Truck,
    X
} from 'lucide-react'
import CancelRefundModal from './CancelRefundModal.jsx'

// --- Alt Bileşen: Geri Sayım (Modern Versiyon) ---
const DeliveryCountdown = ({ deliveredAt }) => {
    const [timeRemaining, setTimeRemaining] = useState(null)

    useEffect(() => {
        if (!deliveredAt) return;
        const update = () => {
            const deadline = new Date(new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000)
            const diff = deadline - new Date()
            if (diff <= 0) { setTimeRemaining({ expired: true }); return; }
            setTimeRemaining({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
                expired: false
            })
        }
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [deliveredAt])

    if (!timeRemaining) return null;

    return (
        <div className={`mt-5 p-4 rounded-lg border transition-all ${
            timeRemaining.expired ? "bg-gray-50/80 border-gray-200/60" : "bg-indigo-50/80 border-indigo-200/60"
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md ${timeRemaining.expired ? "bg-gray-200" : "bg-indigo-100"}`}>
                        <Timer className={`w-3.5 h-3.5 ${timeRemaining.expired ? "text-gray-600" : "text-indigo-600"}`} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-900">Confirmation Window</p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {timeRemaining.expired ? "Window closed. Order finalizing..." : "Verify your items before the timer ends"}
                        </p>
                    </div>
                </div>
                {!timeRemaining.expired && (
                    <div className="flex gap-1.5 items-baseline">
                        <span className="text-lg font-mono font-semibold text-indigo-600">{String(timeRemaining.h).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">h</span>
                        <span className="text-lg font-mono font-semibold text-indigo-600">{String(timeRemaining.m).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">m</span>
                    </div>
                )}
            </div>
        </div>
    )
}

const OrderProgressStepper = ({ currentStatus }) => {
    const steps = [
        { key: 'PENDING', label: 'Placed', icon: Clock },
        { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
        { key: 'PROCESSING', label: 'Preparing', icon: Package2 },
        { key: 'SHIPPED', label: 'On Way', icon: Truck },
        { key: 'DELIVERED', label: 'Delivered', icon: Home },
        { key: 'COMPLETED', label: 'Finalized', icon: Check },
    ]

    const currentIndex = steps.findIndex(s => s.key === currentStatus)
    const isFailed = currentStatus === 'CANCELLED' || currentStatus === 'REFUNDED'

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
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                    isDone ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" :
                                        "bg-white border-gray-200 text-gray-400"
                                } ${isCurrent && !isDone ? "border-indigo-500 text-indigo-500 ring-2 ring-indigo-50" : ""}`}>
                                    <Icon className="w-4 h-4 stroke-[2]" />
                                </div>
                                <span className={`mt-2 text-[10px] font-medium uppercase tracking-wide ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {!isLast && (
                                <div className="flex-1 mx-1.5 relative" style={{ height: '1.5px' }}>
                                    <div className="absolute top-0 left-0 w-full h-full bg-gray-100" />
                                    {isDone && (
                                        <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 w-full" />
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
            {isFailed && (
                <div className="mt-4 flex justify-center">
                    <span className="px-2.5 py-1 bg-rose-50/80 text-rose-600 text-[10px] font-medium rounded-md border border-rose-200/60 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" /> {currentStatus}
                    </span>
                </div>
            )}
        </div>
    )
}

// --- Ana Modal Bileşeni ---
const OrderModal = React.memo(({ isOpen, selectedOrder, orderReviews, onClose, onOpenReceipt, onReviewSuccess }) => {
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [refundModalOpen, setRefundModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [orderName, setOrderName] = useState(selectedOrder?.name || '')
    const [isSavingName, setIsSavingName] = useState(false)
    const notification = useNotification()

    useEffect(() => {
        if (selectedOrder) {
            setOrderName(selectedOrder.name || '')
        }
    }, [selectedOrder])

    const handleSaveName = async () => {
        if (orderName.length > 100) {
            notification.showError('Error', 'Order name must be 100 characters or less')
            return
        }
        setIsSavingName(true)
        try {
            await orderService.updateOrderName(selectedOrder.id, orderName)
            setIsEditingName(false)
            notification.showSuccess('Success', 'Order name updated successfully')
            if (onReviewSuccess) {
                onReviewSuccess()
            }
        } catch (error) {
            notification.showError('Error', error?.response?.data?.message || 'Failed to update order name')
        } finally {
            setIsSavingName(false)
        }
    }

    const handleCancelEdit = () => {
        setOrderName(selectedOrder?.name || '')
        setIsEditingName(false)
    }

    const handleCancelOrder = async (payload) => {
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
    }

    const handleRefundOrder = async (payload) => {
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
    }

    if (!isOpen || !selectedOrder) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            <div className="w-full max-w-6xl max-h-[92vh] bg-white rounded-xl shadow-xl shadow-gray-900/20 overflow-hidden flex flex-col border border-gray-200/60">

                <div className="px-6 py-5 bg-white border-b border-gray-200/60 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-200/60 flex items-center justify-center">
                            <Package className="text-gray-700 w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                {isEditingName ? (
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
                                        <h2 className="text-base font-semibold text-gray-900">
                                            {selectedOrder.name || `Order #${selectedOrder.orderNumber}`}
                                        </h2>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                                            title="Edit order name"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        {selectedOrder.name && (
                                            <span className="text-xs text-gray-500 font-medium">#{selectedOrder.orderNumber}</span>
                                        )}
                                    </>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        selectedOrder.status === 'COMPLETED' ? 'bg-emerald-500' :
                                        selectedOrder.status === 'DELIVERED' ? 'bg-blue-500' :
                                        selectedOrder.status === 'SHIPPED' ? 'bg-indigo-500' :
                                        selectedOrder.status === 'PROCESSING' ? 'bg-amber-500' :
                                        selectedOrder.status === 'CONFIRMED' ? 'bg-green-500' :
                                        'bg-gray-400'
                                    }`}></div>
                                    <span className={`text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{formatDateTime(selectedOrder.createdAt)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6">
                        <div className="bg-white rounded-lg border border-gray-200/60 p-6 mb-6">
                            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Tracking Progress</h3>
                            <OrderProgressStepper currentStatus={selectedOrder.status} />

                            {selectedOrder.status === 'DELIVERED' && selectedOrder.shipping?.deliveredAt && (
                                <DeliveryCountdown deliveredAt={selectedOrder.shipping.deliveredAt} />
                            )}

                            <div className="mt-6 flex justify-center gap-3">
                                {selectedOrder.status === 'CONFIRMED' && (
                                    <button onClick={() => setCancelModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200/60 hover:bg-rose-50/80 rounded-md transition-all">
                                        <X className="w-3.5 h-3.5" /> Cancel Order
                                    </button>
                                )}
                                {selectedOrder.status === 'DELIVERED' && (
                                    <>
                                        <button 
                                            onClick={async () => {
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
                                            }}
                                            disabled={isProcessing}
                                            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approve & Complete
                                        </button>
                                        <button onClick={() => setRefundModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-all">
                                            <RotateCcw className="w-3.5 h-3.5" /> Request Refund
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-lg border border-gray-200/60 p-5">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                                            <Package2 className="w-3.5 h-3.5 text-gray-600" /> Order Items
                                        </h3>
                                        <span className="text-[10px] text-gray-500 font-medium">{selectedOrder.orderItems?.length} {selectedOrder.orderItems?.length === 1 ? 'item' : 'items'}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {selectedOrder.orderItems?.map((item, idx) => {
                                            const isCancelled = item.cancelledQuantity && item.cancelledQuantity > 0;
                                            const isRefunded = item.refundedQuantity && item.refundedQuantity > 0;
                                            const isFullyCancelled = isCancelled && item.cancelledQuantity >= item.quantity;
                                            const isFullyRefunded = isRefunded && item.refundedQuantity >= item.quantity;
                                            const isPartiallyCancelled = isCancelled && item.cancelledQuantity < item.quantity;
                                            const isPartiallyRefunded = isRefunded && item.refundedQuantity < item.quantity;
                                            
                                            return (
                                                <div key={idx} className={`py-4 first:pt-0 last:pb-0 flex gap-3 ${isFullyCancelled || isFullyRefunded ? 'opacity-60' : ''}`}>
                                                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-200/60 flex-shrink-0 relative">
                                                        <img src={item.listing?.imageUrl} className="w-full h-full object-cover" />
                                                        {(isFullyCancelled || isFullyRefunded) && (
                                                            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                                                                <X className="w-5 h-5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.listing?.title}</h4>
                                                            {isFullyCancelled && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium text-rose-600 bg-rose-50/80 rounded-md border border-rose-200/60">
                                                                    Cancelled
                                                                </span>
                                                            )}
                                                            {isFullyRefunded && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium text-amber-600 bg-amber-50/80 rounded-md border border-amber-200/60">
                                                                    Refunded
                                                                </span>
                                                            )}
                                                            {isPartiallyCancelled && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium text-rose-600 bg-rose-50/80 rounded-md border border-rose-200/60">
                                                                    Partially Cancelled
                                                                </span>
                                                            )}
                                                            {isPartiallyRefunded && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium text-amber-600 bg-amber-50/80 rounded-md border border-amber-200/60">
                                                                    Partially Refunded
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-gray-600 mt-1 font-medium">
                                                            Qty: {item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
                                                            {isCancelled && (
                                                                <span className="ml-2 text-rose-600">({item.cancelledQuantity} cancelled)</span>
                                                            )}
                                                            {isRefunded && (
                                                                <span className="ml-2 text-amber-600">({item.refundedQuantity} refunded)</span>
                                                            )}
                                                        </p>
                                                        {item.campaignName && <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 bg-emerald-50/80 text-emerald-600 font-medium rounded-md border border-emerald-200/60">PROMO: {item.campaignName}</span>}
                                                    </div>
                                                    <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
                                                        <span className="text-xs font-semibold text-gray-900">{formatCurrency(item.totalPrice, selectedOrder.currency)}</span>
                                                        <ReviewButton
                                                            orderItem={item}
                                                            existingReview={orderReviews[item.id]}
                                                            onReviewCreated={onReviewSuccess}
                                                            orderStatus={selectedOrder.status}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" /> Shipping Address
                                        </h4>
                                        <p className="text-xs font-semibold text-gray-900">{selectedOrder.shippingAddress?.addressLine}</p>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                            <Receipt className="w-3 h-3" /> Billing Details
                                        </h4>
                                        <p className="text-xs font-semibold text-gray-900">{selectedOrder.billingAddress?.addressLine || 'Same as shipping'}</p>
                                        <p className="text-[11px] text-gray-500 mt-1 font-medium">TR VAT: {selectedOrder.orderNumber}</p>
                                    </div>
                                </div>

                                {selectedOrder.notes && (
                                    <div className="p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
                                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" /> Order Notes
                                        </h4>
                                        <p className="text-xs text-gray-900 font-medium leading-relaxed whitespace-pre-wrap">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-900 rounded-lg p-5 text-white">
                                    <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-5">Payment Summary</h3>
                                    {selectedOrder.paymentStatus && (
                                        <div className="mb-4 pb-4 border-b border-white/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-400">Payment Status</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-400' :
                                                        selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED' ? 'bg-amber-400' :
                                                        selectedOrder.paymentStatus === 'REFUNDED' ? 'bg-rose-400' :
                                                        selectedOrder.paymentStatus === 'PENDING' ? 'bg-slate-400' :
                                                        'bg-red-400'
                                                    }`}></div>
                                                    <span className={`text-[10px] font-medium ${
                                                        selectedOrder.paymentStatus === 'PAID' ? 'text-emerald-400' :
                                                        selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED' ? 'text-amber-400' :
                                                        selectedOrder.paymentStatus === 'REFUNDED' ? 'text-rose-400' :
                                                        selectedOrder.paymentStatus === 'PENDING' ? 'text-slate-400' :
                                                        'text-red-400'
                                                    }`}>
                                                        {selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED' ? 'Partially Refunded' :
                                                         selectedOrder.paymentStatus === 'REFUNDED' ? 'Refunded' :
                                                         selectedOrder.paymentStatus === 'PAID' ? 'Paid' :
                                                         selectedOrder.paymentStatus === 'PENDING' ? 'Pending' :
                                                         selectedOrder.paymentStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-medium">Subtotal</span>
                                            <span className="font-mono text-slate-300">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}</span>
                                        </div>
                                        {selectedOrder.couponDiscount > 0 && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-emerald-400 flex items-center gap-1 font-medium"><Tag className="w-3 h-3" /> Discount</span>
                                                <span className="text-emerald-400 font-mono">-{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-white/10 my-2" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-[11px] font-medium text-slate-400">Total Amount</span>
                                            <span className="text-xl font-semibold font-mono tracking-tight">
                                                {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedOrder.paymentReference && (
                                        <button
                                            onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
                                            className="w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> View Digital Receipt
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CancelRefundModal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} onSubmit={handleCancelOrder} type="cancel" order={selectedOrder} />
            <CancelRefundModal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} onSubmit={handleRefundOrder} type="refund" order={selectedOrder} />
        </div>
    )
})

export default OrderModal