import { useTranslation } from "react-i18next";
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
  getPaymentStatusTextClass
}) => {
  const { t } = useTranslation();
  return <CardComponent critical className={`${isSellerView ? 'p-6' : 'p-5'} border border-white/5`}>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 bg-background-primary/10 rounded-xl border border-white/10">
          <Wallet className="w-4 h-4 text-slate-200" />
        </div>
        <h3 className="text-sm font-medium text-text-primary uppercase tracking-widest">{t("payment_summary")}</h3>
      </div>

      {selectedOrder.paymentStatus ? <div className="mb-5 pb-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t("payment_status")}</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/20 border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)} shadow-sm`} />
              <span className={`text-caption uppercase tracking-wider font-bold ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
                {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div> : null}

      <div className="space-y-3.5">
        {!isSellerView ? <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{t("subtotal")}</span>
            <span className="text-sm font-semibold font-mono text-slate-300">
              {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
            </span>
          </div> : null}

        {!isSellerView && selectedOrder.couponDiscount > 0 ? <div className="flex justify-between items-center">
            <span className="text-sm text-emerald-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />{t("discount")}</span>
            <span className="text-sm text-emerald-400 font-mono font-semibold">
              -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
            </span>
          </div> : null}

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">{t("payment_method")}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background-primary/5 border border-white/10 text-slate-300">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold tracking-wide">
              {selectedOrder.paymentMethod}
            </span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("total")}</span>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
            </span>
          </div>
        </div>
      </div>

      {selectedOrder.paymentReference && onOpenReceipt ? <button onClick={() => onOpenReceipt(selectedOrder.paymentReference)} className="w-full mt-5 py-3 bg-background-primary/5 hover:bg-background-primary/10 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white group">
          <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
          <span>{t("view_digital_receipt")}</span>
        </button> : null}
    </CardComponent>;
});
OrderPaymentSummary.displayName = 'OrderPaymentSummary';