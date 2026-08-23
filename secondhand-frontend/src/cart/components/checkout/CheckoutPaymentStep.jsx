import { useTranslation } from "react-i18next";
import React, { useState, memo } from 'react';
import { Wallet, AlertCircle, Loader2, ArrowLeft, ArrowRight, PlusCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { formatCurrency } from '../../../common/formatters.js';
import { CART_PAYMENT_TYPES } from '../../cartConstants.js';
import { ewalletService } from '../../../ewallet/services/ewalletService.js';
import { ROUTES } from '../../../common/constants/routes.js';

const CheckoutPaymentStep = ({
 selectedPaymentType,
 setSelectedPaymentType,
 eWallet,
 calculateTotal,
 currency,
 onNext,
 onBack,
 acceptedAgreements,
 onAgreementToggle,
 onRequiredAgreementsChange,
 areAllAgreementsAccepted
}) => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const totalAmount = calculateTotal();
 const cur = currency || 'TRY';
 const [warningData, setWarningData] = useState(null);
 const [isCheckingWarning, setIsCheckingWarning] = useState(false);

 const walletBalance = Number(eWallet?.balance || 0);
 const hasEnoughBalance = !!eWallet && totalAmount <= walletBalance;
 const canProceed = hasEnoughBalance && areAllAgreementsAccepted();
 const remainingBalance = walletBalance - totalAmount;

 const handleNext = async () => {
 if (!canProceed) return;
 if (!warningData) {
 try {
 setIsCheckingWarning(true);
 const res = await ewalletService.checkSpendingWarning(totalAmount);
 if (res?.warningTriggered) {
 setWarningData(res);
 return;
 }
 } catch (e) {
 console.error('Failed to check spending warning', e);
 } finally {
 setIsCheckingWarning(false);
 }
 }
 onNext();
 };

 return (
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
 {/* Header */}
 <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
 <div>
 <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{t("payment", "Ödeme Yöntemi")}</h2>
 <p className="text-xs text-slate-500 font-medium mt-0.5">
 {t("secure_escrow_payment_desc", "Ödemeniz güvenli havuz hesabında (Escrow) bloke edilir, onayınızdan sonra satıcıya aktarılır.")}
 </p>
 </div>
 <div className="text-right">
 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t("order_total", "Ödenecek Tutar")}</span>
 <span className="text-lg font-extrabold text-slate-900">
 {formatCurrency(totalAmount, cur)}
 </span>
 </div>
 </div>

 {/* Payment Selection Box */}
 <div className="mb-6">
 <label className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-200 ${
 selectedPaymentType === CART_PAYMENT_TYPES.EWALLET
 ? 'border-slate-900 bg-slate-100/40 shadow-xs ring-1 ring-slate-900/10'
 : 'border-slate-200/80 bg-white hover:border-slate-300'
 }`}>
 <input
 type="radio"
 name="payment"
 value={CART_PAYMENT_TYPES.EWALLET}
 checked={selectedPaymentType === CART_PAYMENT_TYPES.EWALLET}
 onChange={event => setSelectedPaymentType(event.target.value)}
 className="sr-only"
 />
 <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-900 bg-slate-900 text-white shadow-xs">
 <Wallet className="h-5 w-5" />
 </div>

 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between">
 <span className="text-sm font-bold text-slate-900 tracking-tight">{t("wallet", "SecondHand Cüzdanım")}</span>
 <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-200/80 px-2.5 py-0.5 rounded-full border border-slate-300">
 <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
 Güvenli Ödeme
 </span>
 </div>

 <p className="mt-1 text-xs text-slate-600 font-medium">
 {eWallet ? (
 <>Mevcut Bakiye: <strong className="text-slate-900">{formatCurrency(walletBalance, cur)}</strong></>
 ) : (
 'Kayıtlı cüzdan bulunamadı'
 )}
 </p>
 </div>
 </label>

 {/* Balance Breakdown Card */}
 <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
 <div className="space-y-2.5 text-xs">
 <div className="flex justify-between items-center text-slate-600 font-medium">
 <span>{t("available", "Cüzdan Bakiyesi")}</span>
 <span className="font-bold text-slate-900">{formatCurrency(walletBalance, cur)}</span>
 </div>
 <div className="flex justify-between items-center text-slate-600 font-medium">
 <span>{t("order_total", "Sipariş Tutarı")}</span>
 <span className="font-bold text-slate-900">−{formatCurrency(totalAmount, cur)}</span>
 </div>
 <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
 <span className="font-bold text-slate-800">{hasEnoughBalance ? 'İşlem Sonrası Kalan Bakiye' : 'Eksik Tutar'}</span>
 <span className={`font-extrabold text-sm ${hasEnoughBalance ? 'text-slate-900' : 'text-rose-600'}`}>
 {hasEnoughBalance
 ? formatCurrency(remainingBalance, cur)
 : formatCurrency(Math.abs(remainingBalance), cur)}
 </span>
 </div>
 </div>

 {!hasEnoughBalance && (
 <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
 <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
 <span>{t("insufficient_wallet_balance_add_funds_to", "Cüzdan bakiyeniz bu sipariş için yetersiz.")}</span>
 </div>
 <button
 type="button"
 onClick={() => navigate(ROUTES.EWALLET || '/ewallet')}
 className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs transition-colors"
 >
 <PlusCircle className="h-3.5 w-3.5" />
 Bakiye Yükle
 </button>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Agreements Section */}
 <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5">
 <PaymentAgreementsSection
 acceptedAgreements={acceptedAgreements}
 onToggle={onAgreementToggle}
 onRequiredAgreementsChange={onRequiredAgreementsChange}
 />
 </div>

 {warningData ? (
 <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
 <div className="flex items-start gap-3">
 <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
 <div className="min-w-0">
 <h3 className="text-sm font-bold text-amber-900">{t("spending_limit_warning", "Harcama Limiti Uyarısı")}</h3>
 <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800">
 {t("with_this_order_monthly_spending_reaches", "Bu sipariş ile birlikte aylık harcama limitiniz")} {' '}
 <strong className="font-bold">{formatCurrency(warningData.projectedSpending, cur)}</strong> seviyesine ulaşacaktır.
 </p>
 <div className="mt-4 flex flex-wrap gap-2">
 <button
 type="button"
 onClick={() => setWarningData(null)}
 className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
 >
 {t("cancel", "İptal Et")}
 </button>
 <button
 type="button"
 onClick={handleNext}
 className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-amber-700 shadow-xs"
 >
 {t("continue_anyway", "Yine de Devam Et")}
 </button>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <>
 {/* Navigation — desktop */}
 <div className="hidden items-center justify-between border-t border-slate-100 pt-6 sm:flex">
 <button
 type="button"
 onClick={onBack}
 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <button
 type="button"
 onClick={handleNext}
 disabled={!canProceed || isCheckingWarning}
 className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98]"
 >
 {isCheckingWarning ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 Kontrol Ediliyor...
 </>
 ) : (
 <>
 {t("continue", "Siparişi İncele")}
 <ArrowRight className="h-4 w-4" strokeWidth={2} />
 </>
 )}
 </button>
 </div>

 {/* Navigation — mobile */}
 <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-5 sm:hidden">
 <button
 type="button"
 onClick={onBack}
 className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 <button
 type="button"
 onClick={handleNext}
 disabled={!canProceed || isCheckingWarning}
 className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white disabled:bg-slate-200 disabled:text-slate-400"
 >
 {isCheckingWarning ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <>
 {t("continue", "Devam Et")}
 <ArrowRight className="h-4 w-4" strokeWidth={2} />
 </>
 )}
 </button>
 </div>
 </>
 )}
 </div>
 );
};

export default memo(CheckoutPaymentStep);