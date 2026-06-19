import { useTranslation } from "react-i18next";
import { formatCurrency } from '../../common/formatters.js';
import PaymentAgreementsSection from './PaymentAgreementsSection.jsx';
import { PAYMENT_TYPES } from '../paymentSchema.js';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';
const PaymentPanel = ({
  selectedListing,
  feeConfig,
  paymentType,
  onPaymentTypeChange,
  isProcessingPayment,
  onPayment,
  eWallet,
  agreementsAccepted,
  acceptedAgreementIds,
  onAgreementToggle,
  onRequiredAgreementsChange
}) => {
  const {
    t
  } = useTranslation();
  return <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-3xl border border-slate-200/60 bg-white px-5 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">{t("payment_panel")}</h3>
                <p className="mb-6 text-xs text-slate-500">{t("review_the_fee_details_and_choose_a_secu")}</p>

                {selectedListing ? <>
                        <div className="mb-6 rounded-2xl bg-slate-50 px-4 py-3">
                            <h4 className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{t("chosen_listing")}</h4>
                            <p className="text-sm font-medium tracking-tight text-slate-900">
                                {selectedListing.title}
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            {!feeConfig ? <div className="space-y-2">
                                    <div className="h-4 rounded bg-slate-100 animate-pulse"></div>
                                    <div className="h-4 rounded bg-slate-100 animate-pulse"></div>
                                    <div className="h-4 rounded bg-slate-100 animate-pulse"></div>
                                </div> : <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{t("invoice_summary")}</span>
                                        <span className="text-[11px] text-slate-400">{t("listing_fee_breakdown")}</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span>{t("listing_fee")}</span>
                                            <span className="font-mono text-sm tracking-tight text-slate-800">
                                                {formatPaymentAmount(feeConfig.creationFee)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span>{t("tax")}{`(${feeConfig.taxPercentage}%)`}</span>
                                            <span className="font-mono text-sm tracking-tight text-slate-800">
                                                {formatPaymentAmount(feeConfig.creationFee * feeConfig.taxPercentage / 100)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 border-t border-slate-200 pt-3">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{t("total_due")}</span>
                                            <span className="font-mono text-lg font-semibold tracking-tighter text-slate-900">
                                                {formatPaymentAmount(feeConfig.totalCreationFee)}
                                            </span>
                                        </div>
                                    </div>
                                </div>}
                        </div>

                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-slate-600">{t("payment_type")}</label>
                            <div className="space-y-2">
                                <label className="flex items-center rounded-2xl border border-slate-200/80 p-3 cursor-pointer transition-colors hover:border-slate-300 hover:bg-slate-50">
                                    <input type="radio" name="paymentType" value={PAYMENT_TYPES.EWALLET} checked={paymentType === PAYMENT_TYPES.EWALLET} onChange={e => onPaymentTypeChange(e.target.value)} className="text-slate-900 focus:ring-indigo-500" />
                                    <div className="ml-3 flex items-center">
                                        <svg className="mr-2 h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900">{t("ewallet")}</span>
                                            {eWallet && <span className="text-xs text-slate-500">{t("balance")}{formatPaymentAmount(eWallet.balance)}
                                                </span>}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* eWallet Balance Warning */}
                        {paymentType === PAYMENT_TYPES.EWALLET && feeConfig && eWallet && <div className="mb-4">
                                {eWallet.balance >= feeConfig.totalCreationFee ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                                        <div className="flex items-center">
                                            <svg className="mr-2 h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs text-emerald-800">{t("sufficient_balance_available_for_payment")}</span>
                                        </div>
                                    </div> : <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5">
                                        <div className="flex items-center">
                                            <svg className="mr-2 h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-xs text-red-800">{t("insufficient_balance_you_need")}{formatPaymentAmount(feeConfig.totalCreationFee - eWallet.balance)}{t("more")}</span>
                                        </div>
                                    </div>}
                            </div>}

                        {/* Payment Agreements */}
                        {selectedListing && <div className="mb-6">
                                <PaymentAgreementsSection acceptedAgreements={acceptedAgreementIds} onToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} error={!agreementsAccepted ? "Please accept all payment agreements to proceed" : null} />
                            </div>}

                        <button onClick={onPayment} disabled={isProcessingPayment || !agreementsAccepted || paymentType === PAYMENT_TYPES.EWALLET && eWallet && eWallet.balance < feeConfig?.totalCreationFee} className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold tracking-tight text-white shadow-md transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                            {isProcessingPayment ? <div className="flex items-center justify-center">
                                    <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>{t("processing")}</div> : feeConfig ? `Pay ${formatPaymentAmount(feeConfig.totalCreationFee)}` : 'Pay Listing Fee'}
                        </button>

                        <div className="mt-3 flex flex-col items-center gap-1">
                            <p className="text-[11px] text-slate-500">{t("after_successful_payment_your_listing_wi")}</p>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500">
                                <div className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 bg-slate-50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    <span>{t("ssl_secured")}</span>
                                </div>
                                <div className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 bg-slate-50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                                    <span>{t("pci_dss_compliant")}</span>
                                </div>
                            </div>
                        </div>
                    </> : <div className="text-center py-8">
                        <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-text-muted text-sm">{t("chose_a_listing_to_pay_the_listing_fee")}</p>
                    </div>}
            </div>
        </div>;
};
export default PaymentPanel;