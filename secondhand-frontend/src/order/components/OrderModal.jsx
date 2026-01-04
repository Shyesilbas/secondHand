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
        <div className={`mt-6 p-4 rounded-xl border transition-all ${
            timeRemaining.expired ? "bg-slate-50 border-slate-200" : "bg-indigo-50/50 border-indigo-100"
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${timeRemaining.expired ? "bg-slate-200" : "bg-indigo-100"}`}>
                        <Timer className={`w-5 h-5 ${timeRemaining.expired ? "text-slate-600" : "text-indigo-600"}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Confirmation Window</p>
                        <p className="text-xs text-slate-500 font-normal">
                            {timeRemaining.expired ? "Window closed. Order finalizing..." : "Verify your items before the timer ends"}
                        </p>
                    </div>
                </div>
                {!timeRemaining.expired && (
                    <div className="flex gap-2 items-baseline">
                        <span className="text-xl font-mono font-semibold text-indigo-600">{String(timeRemaining.h).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">h</span>
                        <span className="text-xl font-mono font-semibold text-indigo-600">{String(timeRemaining.m).padStart(2, '0')}</span>
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">m</span>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Alt Bileşen: Progress Stepper (Minimal & Elegant) ---
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
        <div className="py-8 px-2">
            <div className="relative flex justify-between">
                {/* Connector Line Base */}
                <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-10" />
                {/* Active Connector Line */}
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
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isDone ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" :
                                    "bg-white border-slate-200 text-slate-400"
                            } ${isCurrent && !isDone ? "border-indigo-500 text-indigo-500 ring-4 ring-indigo-50" : ""}`}>
                                <Icon className="w-5 h-5 stroke-[2.5px]" />
                            </div>
                            <span className={`mt-3 text-[11px] font-semibold uppercase tracking-tight ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>
            {isFailed && (
                <div className="mt-4 flex justify-center">
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-100 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Status: {currentStatus}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col border border-white/20">

                {/* Header: Modern & Clean */}
                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                            <Package className="text-slate-700 w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                {isEditingName ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                        <input
                                            type="text"
                                            value={orderName}
                                            onChange={(e) => setOrderName(e.target.value)}
                                            className="flex-1 px-3 py-1 text-xl font-semibold text-slate-900 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Order name"
                                            maxLength={100}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveName}
                                            disabled={isSavingName}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 disabled:opacity-50"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSavingName}
                                            className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-600 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-semibold text-slate-900">
                                            {selectedOrder.name || `Order #${selectedOrder.orderNumber}`}
                                        </h2>
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                                            title="Edit order name"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {selectedOrder.name && (
                                            <span className="text-sm text-slate-400 font-normal">#{selectedOrder.orderNumber}</span>
                                        )}
                                    </>
                                )}
                                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${getStatusColor(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-normal">{formatDateTime(selectedOrder.createdAt)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8">
                        {/* Status & Stepper Card */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Tracking Progress</h3>
                            <OrderProgressStepper currentStatus={selectedOrder.status} />

                            {selectedOrder.status === 'DELIVERED' && selectedOrder.shipping?.deliveredAt && (
                                <DeliveryCountdown deliveredAt={selectedOrder.shipping.deliveredAt} />
                            )}

                            {/* Action Buttons: Context Aware */}
                            <div className="mt-8 flex justify-center gap-4">
                                {selectedOrder.status === 'CONFIRMED' && (
                                    <button onClick={() => setCancelModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-rose-600 bg-white border border-rose-100 hover:bg-rose-50 rounded-xl transition-all">
                                        <X className="w-4 h-4" /> Cancel Order
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
                                            className="flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve & Complete
                                        </button>
                                        <button onClick={() => setRefundModalOpen(true)} className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                                            <RotateCcw className="w-4 h-4" /> Request Refund
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Main Grid Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left: Items (2/3 width) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                            <Package2 className="w-4 h-4 text-indigo-500" /> Order Items
                                        </h3>
                                        <span className="text-xs text-slate-400 font-normal">{selectedOrder.orderItems?.length} items</span>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {selectedOrder.orderItems?.map((item, idx) => {
                                            const isCancelled = item.cancelledQuantity && item.cancelledQuantity > 0;
                                            const isRefunded = item.refundedQuantity && item.refundedQuantity > 0;
                                            const isFullyCancelled = isCancelled && item.cancelledQuantity >= item.quantity;
                                            const isFullyRefunded = isRefunded && item.refundedQuantity >= item.quantity;
                                            const isPartiallyCancelled = isCancelled && item.cancelledQuantity < item.quantity;
                                            const isPartiallyRefunded = isRefunded && item.refundedQuantity < item.quantity;
                                            
                                            return (
                                                <div key={idx} className={`py-5 first:pt-0 last:pb-0 flex gap-4 ${isFullyCancelled || isFullyRefunded ? 'opacity-60' : ''}`}>
                                                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
                                                        <img src={item.listing?.imageUrl} className="w-full h-full object-cover" />
                                                        {(isFullyCancelled || isFullyRefunded) && (
                                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                                                <X className="w-6 h-6 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.listing?.title}</h4>
                                                            {isFullyCancelled && (
                                                                <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                                                                    Cancelled
                                                                </span>
                                                            )}
                                                            {isFullyRefunded && (
                                                                <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-md border border-amber-200">
                                                                    Refunded
                                                                </span>
                                                            )}
                                                            {isPartiallyCancelled && (
                                                                <span className="px-2 py-0.5 text-[10px] font-semibold text-rose-600 bg-rose-50 rounded-md border border-rose-200">
                                                                    Partially Cancelled
                                                                </span>
                                                            )}
                                                            {isPartiallyRefunded && (
                                                                <span className="px-2 py-0.5 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded-md border border-amber-200">
                                                                    Partially Refunded
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-1 font-normal">
                                                            Qty: {item.quantity} × {formatCurrency(item.unitPrice, selectedOrder.currency)}
                                                            {isCancelled && (
                                                                <span className="ml-2 text-rose-600">({item.cancelledQuantity} cancelled)</span>
                                                            )}
                                                            {isRefunded && (
                                                                <span className="ml-2 text-amber-600">({item.refundedQuantity} refunded)</span>
                                                            )}
                                                        </p>
                                                        {item.campaignName && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-semibold rounded-md">PROMO: {item.campaignName}</span>}
                                                    </div>
                                                    <div className="text-right flex flex-col justify-between items-end">
                                                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice, selectedOrder.currency)}</span>
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

                                {/* Delivery & Address Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Shipping Address
                                        </h4>
                                        <p className="text-xs font-semibold text-slate-900">{selectedOrder.shippingAddress?.addressLine}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 font-normal">
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Receipt className="w-3 h-3" /> Billing Details
                                        </h4>
                                        <p className="text-xs font-semibold text-slate-900">{selectedOrder.billingAddress?.addressLine || 'Same as shipping'}</p>
                                        <p className="text-[11px] text-slate-500 mt-1 font-normal">TR VAT: {selectedOrder.orderNumber}</p>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {selectedOrder.notes && (
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Order Notes
                                        </h4>
                                        <p className="text-xs text-slate-900 font-normal leading-relaxed whitespace-pre-wrap">{selectedOrder.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Summary & Info (1/3 width) */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Payment Summary</h3>
                                    {selectedOrder.paymentStatus && (
                                        <div className="mb-4 pb-4 border-b border-white/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-slate-400">Payment Status</span>
                                                <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${
                                                    selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED' ? 'bg-amber-500/20 text-amber-400' :
                                                    selectedOrder.paymentStatus === 'REFUNDED' ? 'bg-rose-500/20 text-rose-400' :
                                                    selectedOrder.paymentStatus === 'PENDING' ? 'bg-slate-500/20 text-slate-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {selectedOrder.paymentStatus === 'PARTIALLY_REFUNDED' ? 'Partially Refunded' :
                                                     selectedOrder.paymentStatus === 'REFUNDED' ? 'Refunded' :
                                                     selectedOrder.paymentStatus === 'PAID' ? 'Paid' :
                                                     selectedOrder.paymentStatus === 'PENDING' ? 'Pending' :
                                                     selectedOrder.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Subtotal</span>
                                            <span className="font-mono">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}</span>
                                        </div>
                                        {selectedOrder.couponDiscount > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-emerald-400 flex items-center gap-1"><Tag className="w-3 h-3" /> Discount</span>
                                                <span className="text-emerald-400 font-mono">-{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-white/10 my-2" />
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-normal text-slate-400">Total Amount</span>
                                            <span className="text-2xl font-semibold font-mono tracking-tighter">
                                                {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedOrder.paymentReference && (
                                        <button
                                            onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
                                            className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10"
                                        >
                                            <FileText className="w-4 h-4" /> View Digital Receipt
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                                    <h4 className="text-xs font-semibold text-slate-900 mb-4">Support & Info</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <CreditCard className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">Reference ID</p>
                                                <p className="text-[11px] font-mono text-slate-700 mt-1 truncate max-w-[140px] font-normal">{selectedOrder.paymentReference || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Truck className="w-4 h-4 text-slate-400" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none">Est. Delivery</p>
                                                <p className="text-[11px] text-slate-700 mt-1 font-semibold">{getEstimatedDeliveryTime(selectedOrder) || 'TBD'}</p>
                                            </div>
                                        </div>
                                    </div>
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