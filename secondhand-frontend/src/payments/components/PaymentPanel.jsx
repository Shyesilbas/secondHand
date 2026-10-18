import { useTranslation } from "react-i18next";
import PaymentAgreementsSection from './PaymentAgreementsSection.jsx';
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
 <div className="sticky top-20 rounded-md border border-border bg-white p-5 shadow-md space-y-4">
 {/* Header */}
 <div className="flex items-center justify-between pb-3 border-b border-border-light">
 <h3 className="text-sm font-semibold text-text-primary">
 {t("payment_panel")}
 </h3>
 <span className="text-xs font-semibold text-text-primary bg-background-tertiary px-2 py-0.5 rounded border border-card-border-hover/60">
 {t("instant_activation")}
 </span>
 </div>

 {selectedListing ? (
 <div className="space-y-3.5">
 {/* Listing Summary Card */}
 <div className="rounded border border-border/80 bg-background-secondary/70 p-3.5 space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-semibold text-text-muted">
 {t("chosen_listing")}
 </span>
 <span className="text-xs font-semibold text-text-tertiary">
 #{selectedListing.id ? selectedListing.id.substring(0, 6).toUpperCase() : ''}
 </span>
 </div>
 <h4 className="text-xs font-semibold text-text-primary truncate">
 {selectedListing.title}
 </h4>

 {feeConfig && (
 <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
 <span className="text-xs font-semibold text-text-secondary">
 {t("total_due")}
 </span>
 <span className="text-lg font-semibold text-text-primary">
 {formatPaymentAmount(feeConfig.totalCreationFee)}
 </span>
 </div>
 )}
 </div>

 {/* E-Wallet Balance Info */}
 <div className="rounded border border-border/80 bg-white p-3 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded bg-secondary-200 text-text-primary flex items-center justify-center font-semibold">
 ₺
 </div>
 <div>
 <span className="font-semibold text-text-primary block">{t("ewallet")}</span>
 {eWallet && (
 <span className="text-xs text-text-tertiary ">
 {formatPaymentAmount(eWalletBalance)}
 </span>
 )}
 </div>
 </div>

 {eWallet && (
 hasSufficientEWalletBalance ? (
 <span className="text-xs font-semibold text-text-primary bg-background-tertiary px-2 py-0.5 rounded border border-card-border-hover">
 {t("sufficient_balance")}
 </span>
 ) : (
 <span className="text-xs font-semibold text-status-warning-text bg-background-secondary px-2 py-0.5 rounded border border-border">
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
 className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 w-full"
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
 <div className="flex items-center justify-center gap-3 text-xs text-text-muted font-medium pt-1">
 <span>{t("ssl_secured")}</span>
 <span>•</span>
 <span>{t("pci_dss_compliant")}</span>
 </div>
 </div>
 ) : (
 <div className="text-center py-8">
 <div className="w-10 h-10 bg-background-tertiary rounded flex items-center justify-center mx-auto mb-2 text-text-muted font-semibold">
 ?
 </div>
 <h4 className="text-xs font-semibold text-text-primary mb-1">
 {t("no_listing_selected")}
 </h4>
 <p className="text-xs text-text-tertiary max-w-48 mx-auto">
 {t("choose_a_listing_to_pay_the_listing_fee")}
 </p>
 </div>
 )}
 </div>
 </div>
 );
};

export default PaymentPanel;