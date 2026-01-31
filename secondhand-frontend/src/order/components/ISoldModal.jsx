import React from 'react'
import {formatCurrency, formatDateTime, resolveEnumLabel} from '../../common/formatters.js'
import {getStatusColor} from '../utils/orderUtils.js'
import {useEnums} from '../../common/hooks/useEnums.js'
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Home,
    Package,
    Package2,
    User,
    Truck,
    X
} from 'lucide-react'

const getLastUpdateInfo = (order) => {
    const status = order?.status;
    const shipping = order?.shipping;

    if (status === 'DELIVERED' && shipping?.deliveredAt) {
        return { status, updatedAt: shipping.deliveredAt };
    }
    if (status === 'SHIPPED' && shipping?.inTransitAt) {
        return { status, updatedAt: shipping.inTransitAt };
    }
    if (shipping?.updatedAt) {
        return { status, updatedAt: shipping.updatedAt };
    }
    if (order?.updatedAt) {
        return { status, updatedAt: order.updatedAt };
    }
    return { status, updatedAt: order?.createdAt };
};

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

const ISoldModal = React.memo(({ isOpen, selectedOrder, onClose, onOpenReceipt }) => {
    const { enums } = useEnums();
    
    if (!isOpen || !selectedOrder) return null

    const sellerOrderItems = selectedOrder.orderItems || [];
    const sellerTotalAmount = sellerOrderItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    const lastUpdate = getLastUpdateInfo(selectedOrder);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
            <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col border border-white/20">

                <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
                            <Package className="text-slate-700 w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Order #{selectedOrder.orderNumber}
                                </h2>
                                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${getStatusColor(selectedOrder.status)}`}>
                                    {resolveEnumLabel(enums, 'orderStatuses', selectedOrder.status) || selectedOrder.status}
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
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Tracking Progress</h3>
                            <OrderProgressStepper currentStatus={selectedOrder.status} />
                            <div className="mt-2 text-xs text-slate-500">
                                Last update: {resolveEnumLabel(enums, 'orderStatuses', lastUpdate.status) || lastUpdate.status}
                                {lastUpdate.updatedAt ? ` • ${formatDateTime(lastUpdate.updatedAt)}` : ''}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Buyer</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 truncate">
                                        {(selectedOrder.buyerName || selectedOrder.buyerSurname)
                                            ? `${selectedOrder.buyerName || ''} ${selectedOrder.buyerSurname || ''}`.trim()
                                            : `User #${selectedOrder.userId}`}
                                    </div>
                                    {selectedOrder.buyerEmail && (
                                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                                            {selectedOrder.buyerEmail}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Package2 className="w-4 h-4 text-indigo-500" /> Sold Items
                                </h3>
                                <span className="text-xs text-slate-400 font-normal">{sellerOrderItems.length} items</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {sellerOrderItems.map((item, idx) => {
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
                                            <div className="text-right flex flex-col justify-end">
                                                <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.totalPrice, selectedOrder.currency)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

ISoldModal.displayName = 'ISoldModal'

export default ISoldModal

