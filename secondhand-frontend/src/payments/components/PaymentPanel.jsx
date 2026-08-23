import React from 'react';
import { useTranslation } from "react-i18next";
import PaymentAgreementsSection from './PaymentAgreementsSection.jsx';
import { PAYMENT_TYPES } from '../paymentSchema.js';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';

const PaymentPanel = ({
 selectedListing,
 feeConfig,
 isProcessingPayment,
 onPayment,
 eWallet,
 agreementsAccepted,
 acceptedAgreementIds,
 onAgreementToggle,
 onRequiredAgreementsChange
}) => {
 const { t } = useTranslation();

 const totalFee = feeConfig?.totalCreationFee || 0;
 const eWalletBalance = eWallet?.balance || 0;
 const hasSufficientEWalletBalance = eWalletBalance >= totalFee;

 const isButtonDisabled =
 isProcessingPayment ||
 !agreementsAccepted ||
 (eWallet && !hasSufficientEWalletBalance);

 return (
 <div className="lg:col-span-5 xl:col-span-5">
 <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40 space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-100">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
 {t("payment_panel")}
 </h3>
 <span className="text-[11px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300/60">
 {t("instant_activation")}
 </span>
 </div>

 {selectedListing ? (
 <div className="space-y-3.5">
 {/* Listing Summary Card */}
 <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
 {t("chosen_listing")}
 </span>
 <span className="text-[10px] font-semibold text-slate-500">
 #{selectedListing.id ? selectedListing.id.substring(0, 6).toUpperCase() : ''}
 </span>
 </div>
 <h4 className="text-xs font-bold text-slate-900 truncate">
 {selectedListing.title}
 </h4>

 {feeConfig && (
 <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
 <span className="text-xs font-semibold text-slate-600">
 {t("total_due")}
 </span>
 <span className="text-lg font-extrabold text-slate-900">
 {formatPaymentAmount(feeConfig.totalCreationFee)}
 </span>
 </div>
 )}
 </div>

 {/* E-Wallet Balance Info */}
 <div className="rounded-xl border border-slate-200/80 bg-white p-3 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-900 flex items-center justify-center font-bold">
 ₺
 </div>
 <div>
 <span className="font-bold text-slate-800 block">{t("ewallet")}</span>
 {eWallet && (
 <span className="text-[11px] text-slate-500 ">
 {formatPaymentAmount(eWalletBalance)}
 </span>
 )}
 </div>
 </div>

 {eWallet && (
 hasSufficientEWalletBalance ? (
 <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
 {t("sufficient_balance")}
 </span>
 ) : (
 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
 {t("insufficient_balance")}
 </span>
 )
 )}
 </div>

 {/* Agreements Checklist */}
 <div className="pt-1">
 <PaymentAgreementsSection
 acceptedAgreements={acceptedAgreementIds}
 onToggle={onAgreementToggle}
 onRequiredAgreementsChange={onRequiredAgreementsChange}
 error={!agreementsAccepted ? "Please accept payment agreements" : null}
 />
 </div>

 {/* Pay Button */}
 <button
 onClick={onPayment}
 disabled={isButtonDisabled}
 className="w-full rounded-xl bg-slate-900 hover:bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 flex items-center justify-center gap-2"
 >
 {isProcessingPayment ? (
 <>
 <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 <span>{t("processing")}...</span>
 </>
 ) : (
 <>
 <span>
 {feeConfig
 ? `Pay ${formatPaymentAmount(feeConfig.totalCreationFee)} & Publish`
 : 'Pay Listing Fee'}
 </span>
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </>
 )}
 </button>

 {/* Security Badges */}
 <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
 <span>🔒 {t("ssl_secured")}</span>
 <span>•</span>
 <span>{t("pci_dss_compliant")}</span>
 </div>
 </div>
 ) : (
 <div className="text-center py-8">
 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400 font-bold">
 ?
 </div>
 <h4 className="text-xs font-bold text-slate-800 mb-1">
 {t("no_listing_selected")}
 </h4>
 <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
 {t("choose_a_listing_to_pay_the_listing_fee")}
 </p>
 </div>
 )}
 </div>
 </div>
 );
};

export default PaymentPanel;