import React, {useState, useEffect} from 'react'
import {formatCurrency, formatDateTime} from '../../common/formatters.js'
import {ReviewButton} from '../../reviews/index.js'
import {getEstimatedDeliveryTime, getStatusColor} from '../utils/orderUtils.js'
import {ChevronDown, ChevronUp, DollarSign, FileText, MapPin, Package, Truck, X, RotateCcw, CheckCircle, Clock, CheckCircle2, Package2, Home, Check} from 'lucide-react'
import CancelRefundModal from './CancelRefundModal.jsx'
import {orderService} from '../services/orderService.js'

const DeliveryCountdown = ({ deliveredAt }) => {
    const [timeRemaining, setTimeRemaining] = useState(null)

    useEffect(() => {
        if (!deliveredAt) {
            setTimeRemaining(null)
            return
        }

        const updateCountdown = () => {
            const delivered = new Date(deliveredAt)
            const deadline = new Date(delivered.getTime() + 48 * 60 * 60 * 1000)
            const now = new Date()
            const diff = deadline - now

            if (diff <= 0) {
                setTimeRemaining({ expired: true })
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeRemaining({ hours, minutes, seconds, expired: false })
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [deliveredAt])

    if (!timeRemaining) return null

    if (timeRemaining.expired) {
        return (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                    <Clock className="w-5 h-5" />
                    <p className="text-sm font-medium">
                        The 48-hour window has expired. Order will be automatically completed.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                            Time to Complete Order
                        </p>
                        <p className="text-xs text-blue-700 mt-0.5">
                            Complete your order within 48 hours of delivery
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{String(timeRemaining.hours).padStart(2, '0')}</div>
                        <div className="text-xs text-blue-600 font-medium">Hours</div>
                    </div>
                    <div className="text-blue-400 text-xl font-bold">:</div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                        <div className="text-xs text-blue-600 font-medium">Minutes</div>
                    </div>
                    <div className="text-blue-400 text-xl font-bold">:</div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                        <div className="text-xs text-blue-600 font-medium">Seconds</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const OrderProgressStepper = ({ currentStatus }) => {
    const steps = [
        { key: 'PENDING', label: 'Pending', icon: Clock },
        { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
        { key: 'PROCESSING', label: 'Processing', icon: Package2 },
        { key: 'SHIPPED', label: 'Shipped', icon: Truck },
        { key: 'DELIVERED', label: 'Delivered', icon: Home },
        { key: 'COMPLETED', label: 'Completed', icon: Check },
    ]

    const getStatusIndex = (status) => {
        return steps.findIndex(step => step.key === status)
    }

    const isCancelled = currentStatus === 'CANCELLED'
    const isRefunded = currentStatus === 'REFUNDED'
    const isCompleted = currentStatus === 'COMPLETED'
    
    let displayIndex = getStatusIndex(currentStatus)
    let cancelledAtStep = null
    let refundedAtStep = null

    if (isCancelled) {
        displayIndex = getStatusIndex('CONFIRMED')
        cancelledAtStep = displayIndex
    } else if (isRefunded) {
        displayIndex = getStatusIndex('DELIVERED')
        refundedAtStep = displayIndex
    } else if (isCompleted) {
        displayIndex = getStatusIndex('COMPLETED')
    }

    return (
        <div className="relative">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const stepCompleted = index < displayIndex || (isCompleted && index === displayIndex)
                    const isCurrent = index === displayIndex && !isCancelled && !isRefunded && !isCompleted
                    const isCancelledAtThisStep = cancelledAtStep === index
                    const isRefundedAtThisStep = refundedAtStep === index
                    const isPending = index > displayIndex

                    return (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center flex-1 relative z-10">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isCancelledAtThisStep || isRefundedAtThisStep
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : stepCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : isCurrent
                                            ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100'
                                            : 'bg-slate-100 border-slate-300 text-slate-400'
                                    }`}
                                >
                                    {isCancelledAtThisStep || isRefundedAtThisStep ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="mt-3 text-center">
                                    <p
                                        className={`text-xs font-semibold ${
                                            stepCompleted || isCurrent || isCancelledAtThisStep || isRefundedAtThisStep
                                                ? 'text-slate-900'
                                                : 'text-slate-400'
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                    {isCancelledAtThisStep && (
                                        <p className="text-[10px] text-red-600 mt-0.5 font-medium">
                                            Cancelled
                                        </p>
                                    )}
                                    {isRefundedAtThisStep && (
                                        <p className="text-[10px] text-red-600 mt-0.5 font-medium">
                                            Refunded
                                        </p>
                                    )}
                                    {isCurrent && !isCancelledAtThisStep && !isRefundedAtThisStep && (
                                        <p className="text-[10px] text-blue-600 mt-0.5 font-medium">
                                            Current
                                        </p>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-2 -mt-6 relative z-0 ${
                                        stepCompleted
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-slate-600" />}
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <div className="px-6 py-5 border-t border-slate-100">
                    {children}
                </div>
            )}
        </div>
    )
}

const OrderModal = React.memo(({
                                   isOpen,
                                   selectedOrder,
                                   orderReviews,
                                   onClose,
                                   onOpenReceipt,
                                   onReviewSuccess
                               }) => {
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [refundModalOpen, setRefundModalOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [actionError, setActionError] = useState('')

    if (!isOpen || !selectedOrder) return null

    const canCancel = selectedOrder.status === 'CONFIRMED'
    const canRefund = selectedOrder.status === 'DELIVERED'
    const canComplete = selectedOrder.status === 'DELIVERED'

    const handleCancel = async (payload) => {
        setIsProcessing(true)
        setActionError('')
        try {
            const updatedOrder = await orderService.cancelOrder(selectedOrder.id, payload)
            onReviewSuccess()
            setCancelModalOpen(false)
        } catch (err) {
            setActionError(err.response?.data?.message || err.message || 'Failed to cancel order')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRefund = async (payload) => {
        setIsProcessing(true)
        setActionError('')
        try {
            const updatedOrder = await orderService.refundOrder(selectedOrder.id, payload)
            onReviewSuccess()
            setRefundModalOpen(false)
        } catch (err) {
            setActionError(err.response?.data?.message || err.message || 'Failed to refund order')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleComplete = async () => {
        setIsProcessing(true)
        setActionError('')
        try {
            const updatedOrder = await orderService.completeOrder(selectedOrder.id)
            onReviewSuccess()
        } catch (err) {
            setActionError(err.response?.data?.message || err.message || 'Failed to complete order')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Order #{selectedOrder.orderNumber}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1.5 font-medium">
                                {formatDateTime(selectedOrder.createdAt)}
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                        {[
                            { label: 'Order Status', value: selectedOrder.status },
                            { label: 'Payment', value: selectedOrder.paymentStatus }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    {item.label}
                                </p>
                                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusColor(item.value)}`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}

                        <div className="bg-white border border-slate-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Total</p>
                            <p className="text-lg font-bold text-slate-900">
                                {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                            </p>
                            {(selectedOrder.campaignDiscount > 0 || selectedOrder.couponDiscount > 0) && (
                                <p className="text-xs text-emerald-600 mt-1 font-medium">
                                    Saved {formatCurrency(
                                    selectedOrder.discountTotal ||
                                    (selectedOrder.campaignDiscount + selectedOrder.couponDiscount),
                                    selectedOrder.currency
                                )}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                            Order Progress
                        </h3>
                        <OrderProgressStepper currentStatus={selectedOrder.status} />
                        
                        {selectedOrder.status === 'DELIVERED' && selectedOrder.shipping?.deliveredAt && (
                            <DeliveryCountdown deliveredAt={selectedOrder.shipping.deliveredAt} />
                        )}
                        
                        {selectedOrder.status === 'CONFIRMED' && (
                            <div className="mt-6 flex items-center justify-center">
                                <button
                                    onClick={() => setCancelModalOpen(true)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            </div>
                        )}

                        {selectedOrder.status === 'DELIVERED' && (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <button
                                    onClick={handleComplete}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Complete Order
                                </button>
                                <button
                                    onClick={() => setRefundModalOpen(true)}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Request Refund
                                </button>
                            </div>
                        )}

                        {actionError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">{actionError}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-8 py-6 space-y-4">

                    <CollapsibleSection title="Pricing Summary" icon={DollarSign} defaultOpen={true}>
                        <div className="space-y-3">
                            {selectedOrder.couponCode && (
                                <div className="mb-4">
                                    <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                        Coupon: {selectedOrder.couponCode}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-slate-600">Subtotal</span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(
                                        selectedOrder.subtotal ?? selectedOrder.totalAmount,
                                        selectedOrder.currency
                                    )}
                                </span>
                            </div>

                            {selectedOrder.campaignDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Campaign discount</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        -{formatCurrency(selectedOrder.campaignDiscount, selectedOrder.currency)}
                                    </span>
                                </div>
                            )}

                            {selectedOrder.couponDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-600">Coupon discount</span>
                                    <span className="text-sm font-semibold text-emerald-600">
                                        -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                <span className="text-base font-bold text-slate-900">Total</span>
                                <span className="text-base font-bold text-slate-900">
                                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                                </span>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Order Items" icon={Package} defaultOpen={true}>
                        <div className="space-y-4">
                            {(selectedOrder.orderItems || []).map((item, idx) => (
                                <div key={idx} className="flex items-start gap-5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.listing?.imageUrl && (
                                            <img
                                                src={item.listing.imageUrl}
                                                alt={item.listing.title}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-base font-semibold text-slate-900">
                                            {item.listing?.title || item.listing?.listingNo}
                                        </h5>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Unit: {formatCurrency(item.unitPrice, selectedOrder.currency)} · Qty {item.quantity}
                                        </p>
                                        {item.campaignName && (
                                            <p className="text-sm text-emerald-600 mt-1 font-medium">
                                                Campaign: {item.campaignName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right space-y-3 flex-shrink-0">
                                        <p className="text-base font-bold text-slate-900">
                                            {formatCurrency(item.totalPrice, selectedOrder.currency)}
                                        </p>
                                        <ReviewButton
                                            orderItem={item}
                                            existingReview={orderReviews[item.id]}
                                            onReviewCreated={onReviewSuccess}
                                            orderStatus={selectedOrder.status}
                                            shippingStatus={selectedOrder.shipping?.status}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    {getEstimatedDeliveryTime(selectedOrder) && (
                        <CollapsibleSection title="Delivery Information" icon={Truck} defaultOpen={false}>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                                    Estimated Delivery
                                </p>
                                <p className="text-sm text-blue-700 font-medium">
                                    {getEstimatedDeliveryTime(selectedOrder)}
                                </p>
                            </div>
                        </CollapsibleSection>
                    )}

                    <CollapsibleSection title="Addresses" icon={MapPin} defaultOpen={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[{
                                title: 'Shipping Address',
                                data: selectedOrder.shippingAddress
                            }, {
                                title: 'Billing Address',
                                data: selectedOrder.billingAddress
                            }].map((block, idx) => (
                                <div key={idx} className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                        {block.title}
                                    </h4>
                                    {block.data ? (
                                        <div className="text-sm text-slate-700 space-y-0.5">
                                            <div className="font-semibold text-slate-900">{block.data.addressLine}</div>
                                            <div>{block.data.city} {block.data.state} {block.data.postalCode}</div>
                                            <div>{block.data.country}</div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Not provided</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Additional Information" icon={FileText} defaultOpen={false}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Order Notes
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {selectedOrder.notes || 'No notes provided'}
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                    Payment Reference
                                </h4>
                                <p className="text-sm font-mono text-slate-900 mb-3">
                                    {selectedOrder.paymentReference || '—'}
                                </p>
                                {selectedOrder.paymentReference && (
                                    <button
                                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                                        onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
                                    >
                                        View Receipt
                                    </button>
                                )}
                            </div>
                        </div>

                    </CollapsibleSection>

                </div>
            </div>

            <CancelRefundModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false)
                    setActionError('')
                }}
                onSubmit={handleCancel}
                type="cancel"
                order={selectedOrder}
            />

            <CancelRefundModal
                isOpen={refundModalOpen}
                onClose={() => {
                    setRefundModalOpen(false)
                    setActionError('')
                }}
                onSubmit={handleRefund}
                type="refund"
                order={selectedOrder}
            />
        </div>
    )
})

export default OrderModal