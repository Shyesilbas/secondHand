import { useTranslation } from "react-i18next";
import PaymentAgreementsSection from './PaymentAgreementsSection.jsx';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';
import { ArrowRight, Loader2 } from 'lucide-react';
import Button from '../../common/components/ui/Button.jsx';
import Card from '../../common/components/ui/Card.jsx';

const PaymentPanel = ({
 selectedListing,
 feeConfig,
 feeQuote,
 isProcessingPayment,
 onPayment,
 eWallet,
 agreementsAccepted,
 acceptedAgreementIds,
 onAgreementToggle,
 onRequiredAgreementsChange
}) => {
 const { t } = useTranslation();

 // Backend fee quote decides coverage; the panel never compares balance and fee itself.
 const hasSufficientEWalletBalance = feeQuote?.sufficientBalance === true;

 const isButtonDisabled =
 isProcessingPayment ||
 !agreementsAccepted ||
 (eWallet && !hasSufficientEWalletBalance);

 return (
 <div className="lg:col-span-5 xl:col-span-5">
 <Card className="sticky top-20 space-y-4">
 <div className="flex items-center justify-between gap-3">
 <h3 className="text-base font-semibold text-text-primary">
 {t("payment_panel")}
 </h3>
 <span className="text-sm text-text-tertiary">{t("instant_activation")}</span>
 </div>

 {selectedListing ? (
 <div className="space-y-4">
 <div className="space-y-2 rounded bg-background-secondary p-4">
 <div className="flex items-center justify-between gap-2 text-sm text-text-tertiary">
 <span>{t("chosen_listing")}</span>
 <span className="tabular-nums">
 #{selectedListing.id ? selectedListing.id.substring(0, 6).toUpperCase() : ''}
 </span>
 </div>
 <h4 className="truncate text-sm font-semibold text-text-primary">
 {selectedListing.title}
 </h4>

 {feeConfig && (
 <div className="flex items-baseline justify-between pt-2">
 <span className="text-sm text-text-secondary">
 {t("total_due")}
 </span>
 <span className="text-lg font-semibold tabular-nums text-text-price">
 {formatPaymentAmount(feeConfig.totalCreationFee)}
 </span>
 </div>
 )}
 </div>

 <div className="flex items-center justify-between gap-3 text-sm">
 <div>
 <span className="block font-medium text-text-primary">{t("ewallet")}</span>
 {eWallet && (
 <span className="tabular-nums text-text-tertiary">
 {formatPaymentAmount(eWallet?.balance)}
 </span>
 )}
 </div>

 {eWallet && (
 <span className="inline-flex items-center gap-1.5 text-text-tertiary">
 <span
 className={`h-1.5 w-1.5 shrink-0 rounded-full ${hasSufficientEWalletBalance ? 'bg-status-success' : 'bg-status-warning'}`}
 aria-hidden
 />
 {hasSufficientEWalletBalance ? t("sufficient_balance") : t("insufficient_balance")}
 </span>
 )}
 </div>

 <PaymentAgreementsSection
 acceptedAgreements={acceptedAgreementIds}
 onToggle={onAgreementToggle}
 onRequiredAgreementsChange={onRequiredAgreementsChange}
 error={!agreementsAccepted ? t("payment_accept_agreements", "Ödeme sözleşmelerini onaylamalısın") : null}
 />

 <Button onClick={onPayment} disabled={isButtonDisabled} className="w-full">
 {isProcessingPayment ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden />
 <span>{t("processing")}...</span>
 </>
 ) : (
 <>
 <span>
 {feeConfig
 ? t('pay_and_publish', { defaultValue: '{{amount}} öde ve yayınla', amount: formatPaymentAmount(feeConfig.totalCreationFee) })
 : t('pay_listing_fee', 'İlan ücretini öde')}
 </span>
 <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 </>
 )}
 </Button>

 <p className="text-center text-sm text-text-tertiary">
 {t("ssl_secured")} · {t("pci_dss_compliant")}
 </p>
 </div>
 ) : (
 <div className="py-6 text-center">
 <h4 className="mb-1 text-sm font-semibold text-text-primary">
 {t("no_listing_selected")}
 </h4>
 <p className="mx-auto max-w-xs text-sm text-text-tertiary">
 {t("choose_a_listing_to_pay_the_listing_fee")}
 </p>
 </div>
 )}
 </Card>
 </div>
 );
};

export default PaymentPanel;
