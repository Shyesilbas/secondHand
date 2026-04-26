import React from 'react';
import { FileText, Tag } from 'lucide-react';

export const OrderPaymentSummary = React.memo(({
  CardComponent,
  isSellerView,
  selectedOrder,
  sellerTotalAmount,
  onOpenReceipt,
  resolveEnumLabel,
  formatCurrency,
  getPaymentStatusIndicatorClass,
  getPaymentStatusTextClass,
}) => {
  return (
    <CardComponent critical className={`${isSellerView ? 'p-6' : 'p-5'}`}>
      <h3
        className={`${
          isSellerView
            ? 'text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5'
            : 'text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-5'
        }`}
      >
        Payment Summary
      </h3>
      {selectedOrder.paymentStatus ? (
        <div className="mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Payment Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)}`} />
              <span className={`text-[10px] font-medium ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
                {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
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
          className={`w-full mt-5 py-2.5 bg-white/10 hover:bg-white/20 ${
            isSellerView ? 'rounded-xl' : 'rounded-md'
          } text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10`}
        >
          <FileText className="w-3.5 h-3.5" /> View Digital Receipt
        </button>
      ) : null}
    </CardComponent>
  );
});
OrderPaymentSummary.displayName = 'OrderPaymentSummary';
