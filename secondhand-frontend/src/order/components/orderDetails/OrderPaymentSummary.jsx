import React from 'react';
import { FileText, Tag, Wallet, CreditCard } from 'lucide-react';

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
    <CardComponent critical className={`${isSellerView ? 'p-6' : 'p-5'} border border-white/5 bg-white/[0.02]`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-white/10 rounded-lg border border-white/5">
          <Wallet className="w-4 h-4 text-slate-300" />
        </div>
        <h3
          className={`${
            isSellerView
              ? 'text-xs font-semibold text-slate-300 uppercase tracking-widest'
              : 'text-[10px] font-semibold text-slate-300 uppercase tracking-wide'
          }`}
        >
          Payment Summary
        </h3>
      </div>
      {selectedOrder.paymentStatus ? (
        <div className="mb-5 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <span className="text-xs font-medium text-slate-400">Payment Status</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/20 border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)} shadow-[0_0_8px_currentColor]`} />
              <span className={`text-[10px] uppercase tracking-wider font-bold ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
                {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {!isSellerView ? (
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-slate-400 font-medium">Subtotal</span>
            <span className="font-mono text-slate-300">
              {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
            </span>
          </div>
        ) : null}

        {!isSellerView && selectedOrder.couponDiscount > 0 ? (
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <Tag className="w-3.5 h-3.5" /> Discount
            </span>
            <span className="text-emerald-400 font-mono font-medium">
              -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-center text-sm px-1">
          <span className="text-slate-400 font-medium">Payment Method</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold tracking-wide">
              {selectedOrder.paymentMethod}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight drop-shadow-sm">
                {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder.paymentReference && onOpenReceipt ? (
        <button
          onClick={() => onOpenReceipt(selectedOrder.paymentReference)}
          className={`w-full mt-5 py-3 bg-white/5 hover:bg-white/10 ${
            isSellerView ? 'rounded-xl' : 'rounded-lg'
          } text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 hover:text-white text-slate-300 group`}
        >
          <FileText className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          <span>View Digital Receipt</span>
        </button>
      ) : null}
    </CardComponent>
  );
});
OrderPaymentSummary.displayName = 'OrderPaymentSummary';
