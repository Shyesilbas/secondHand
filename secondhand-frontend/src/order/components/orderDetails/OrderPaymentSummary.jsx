/* eslint-disable no-unused-vars */
import { useTranslation } from "react-i18next";
import React from 'react';
import { FileText, Tag, Wallet, CreditCard } from 'lucide-react';

export const OrderPaymentSummary = React.memo(({
  CardComponent: Card,
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

  return (
    <Card className={`${isSellerView ? 'p-6' : 'p-5'}`}>
      <div className="flex items-center gap-2.5 mb-6 border-b border-border-light pb-4">
        <div className="p-2 bg-slate-50 rounded-lg border border-border-light">
          <Wallet className="w-4 h-4 text-text-secondary" />
        </div>
        <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest">{t("payment_summary")}</h3>
      </div>

      {selectedOrder.paymentStatus ? (
        <div className="mb-5 pb-5 border-b border-border-light">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted">{t("payment_status")}</span>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-border-light">
              <div className={`w-1.5 h-1.5 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)} shadow-sm`} />
              <span className={`text-caption uppercase tracking-wider font-bold ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
                {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {!isSellerView ? (
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted">{t("subtotal")}</span>
            <span className="text-xs font-bold font-mono text-text-primary">
              {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
            </span>
          </div>
        ) : null}

        {!isSellerView && selectedOrder.couponDiscount > 0 ? (
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-status-success flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />{t("discount")}
            </span>
            <span className="text-xs font-bold text-status-success font-mono">
              -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-text-muted">{t("payment_method")}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-border-light text-text-secondary">
            <CreditCard className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-caption font-bold tracking-wide">
              {selectedOrder.paymentMethod}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border-light">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{t("total")}</span>
            <span className="text-2xl font-bold font-mono text-text-primary tracking-tight">
              {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
            </span>
          </div>
        </div>
      </div>

      {selectedOrder.paymentReference && onOpenReceipt ? (
        <button 
          onClick={() => onOpenReceipt(selectedOrder.paymentReference)} 
          className="w-full mt-5 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 border border-border-light hover:border-border-dark text-text-secondary group"
        >
          <FileText className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
          <span>{t("view_digital_receipt")}</span>
        </button>
      ) : null}
    </Card>
  );
});

OrderPaymentSummary.displayName = 'OrderPaymentSummary';