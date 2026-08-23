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
 <Card className="p-6">
 <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
 <div className="w-9 h-9 bg-slate-100 rounded-xl border border-slate-300/80 flex items-center justify-center">
 <Wallet className="w-4 h-4 text-slate-900" />
 </div>
 <div>
 <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">{t("payment_summary", "Ödeme Özeti")}</h3>
 <p className="text-[11px] text-slate-500 font-medium">Escrow Havuz Güvencesi</p>
 </div>
 </div>

 {selectedOrder.paymentStatus ? (
 <div className="mb-5 pb-5 border-b border-slate-100">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-slate-500">{t("payment_status", "Ödeme Durumu")}</span>
 <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200">
 <div className={`w-2 h-2 rounded-full ${getPaymentStatusIndicatorClass(selectedOrder.paymentStatus)} shadow-xs`} />
 <span className={`text-xs uppercase tracking-wider font-extrabold ${getPaymentStatusTextClass(selectedOrder.paymentStatus)}`}>
 {resolveEnumLabel('paymentStatuses', selectedOrder.paymentStatus) || selectedOrder.paymentStatus}
 </span>
 </div>
 </div>
 </div>
 ) : null}

 <div className="space-y-3.5">
 {!isSellerView ? (
 <div className="flex justify-between items-center text-xs">
 <span className="font-semibold text-slate-500">{t("subtotal", "Ara Toplam")}</span>
 <span className="font-bold text-slate-900">
 {formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount, selectedOrder.currency)}
 </span>
 </div>
 ) : null}

 {!isSellerView && selectedOrder.couponDiscount > 0 ? (
 <div className="flex justify-between items-center text-xs">
 <span className="font-bold text-slate-900 flex items-center gap-1.5">
 <Tag className="w-3.5 h-3.5" />{t("discount", "Kupon İndirimi")}
 </span>
 <span className="font-bold text-slate-900 ">
 -{formatCurrency(selectedOrder.couponDiscount, selectedOrder.currency)}
 </span>
 </div>
 ) : null}

 <div className="flex justify-between items-center text-xs">
 <span className="font-semibold text-slate-500">{t("payment_method", "Ödeme Yöntemi")}</span>
 <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200 text-slate-800">
 <CreditCard className="w-3.5 h-3.5 text-slate-500" />
 <span className="text-[11px] font-bold tracking-wide">
 {selectedOrder.paymentMethod || 'E-Wallet Escrow'}
 </span>
 </div>
 </div>

 <div className="mt-6 pt-5 border-t border-slate-100">
 <div className="flex items-baseline justify-between">
 <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{t("total", "Toplam")}</span>
 <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
 {formatCurrency(isSellerView ? sellerTotalAmount : selectedOrder.totalAmount, selectedOrder.currency)}
 </span>
 </div>
 </div>
 </div>

 {selectedOrder.paymentReference && onOpenReceipt ? (
 <button 
 onClick={() => onOpenReceipt(selectedOrder.paymentReference)} 
 className="w-full mt-5 py-2.5 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs group"
 >
 <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
 <span>{t("view_digital_receipt", "Dijital Fişi Görüntüle")}</span>
 </button>
 ) : null}
 </Card>
 );
});

OrderPaymentSummary.displayName = 'OrderPaymentSummary';