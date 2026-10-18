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
 <Card className="p-6">
 <div className="flex items-center gap-3 mb-6 border-b border-border-light pb-4">
 <Wallet className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
 <div>
 <h3 className="text-xs font-semibold text-text-primary">{t("payment_summary", "Ödeme Özeti")}</h3>
 <p className="text-xs text-text-tertiary font-medium">Escrow Havuz Güvencesi</p>
 </div>
 </div>

 {selectedOrder.paymentStatus ? (
 <div className="mb-5 pb-5 border-b border-border-light">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-text-tertiary">{t("payment_status", "Ödeme Durumu")}</span>
 <div className="flex items-center gap-2 px-3 py-1 rounded bg-background-secondary border border-border">
 <div className={`w-2 h-2 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)}`} />
 <span className={`text-xs font-semibold ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
 {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
 </span>
 </div>
 </div>
 </div>
 ) : null}

 <div className="space-y-3.5">
 {!isSellerView ? (
 <div className="flex justify-between items-center text-xs">
 <span className="font-semibold text-text-tertiary">{t("subtotal", "Ara Toplam")}</span>
 <span className="font-semibold text-text-primary">
 {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
 </span>
 </div>
 ) : null}

 {!isSellerView && selectedOrder.couponDiscount > 0 ? (
 <div className="flex justify-between items-center text-xs">
 <span className="font-semibold text-text-primary flex items-center gap-1.5">
 <Tag className="w-3.5 h-3.5" />{t("discount", "Kupon İndirimi")}
 </span>
 <span className="font-semibold text-text-primary ">
 -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
 </span>
 </div>
 ) : null}

 <div className="flex justify-between items-center text-xs">
 <span className="font-semibold text-text-tertiary">{t("payment_method", "Ödeme Yöntemi")}</span>
 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-background-tertiary/80 border border-border text-text-primary">
 <CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
 <span className="text-xs font-semibold tracking-wide">
 {selectedOrder.paymentMethod || 'E-Wallet Escrow'}
 </span>
 </div>
 </div>

 <div className="mt-6 pt-5 border-t border-border-light">
 <div className="flex items-baseline justify-between">
 <span className="text-xs font-semibold text-text-tertiary">{t("total", "Toplam")}</span>
 <span className="text-2xl font-semibold text-text-primary tracking-tight">
 {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
 </span>
 </div>
 </div>
 </div>

 {selectedOrder.paymentReference && onOpenReceipt ? (
 <button 
 onClick={() => onOpenReceipt(selectedOrder.paymentReference)} 
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3 w-full mt-5 group"
 >
 <FileText className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
 <span>{t("view_digital_receipt", "Dijital Fişi Görüntüle")}</span>
 </button>
 ) : null}
 </Card>
 );
});

OrderPaymentSummary.displayName = 'OrderPaymentSummary';