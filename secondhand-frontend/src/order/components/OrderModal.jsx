import React, {useState} from 'react'
import {formatCurrency, formatDateTime} from '../../common/formatters.js'
import {ReviewButton} from '../../reviews/index.js'
import {getEstimatedDeliveryTime, getStatusColor} from '../utils/orderUtils.js'
import {ChevronDown, ChevronUp, DollarSign, FileText, MapPin, Package, Truck} from 'lucide-react'

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
    if (!isOpen || !selectedOrder) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden"
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
                            { label: 'Payment', value: selectedOrder.paymentStatus },
                            { label: 'Shipping', value: selectedOrder.shippingStatus }
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
                </div>

                <div className="px-8 py-6 space-y-4 max-h-[65vh] overflow-y-auto">

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
                                            orderItem={{ ...item, shippingStatus: selectedOrder.shippingStatus }}
                                            existingReview={orderReviews[item.id]}
                                            onReviewCreated={onReviewSuccess}
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
        </div>
    )
})

export default OrderModal