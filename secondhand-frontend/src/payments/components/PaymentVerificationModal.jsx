import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { Button, Modal, Skeleton } from '../../common/components/ui/index.js';
import { EMAIL_TYPES } from '../../emails/emails.js';
import { OTP_CODE_LENGTH, VERIFICATION_STEPS, PAYMENT_TYPES } from '../paymentSchema.js';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';
import { sanitizeOtpInput, findLatestOtpFromEmails } from '../utils/otp.js';
import OtpDigitInputGroup from './verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from './verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../hooks/useOtpValidityCountdown.js';

const toNumber = value => {
 const n = Number(value);
 return Number.isFinite(n) ? n : 0;
};

const PaymentMethodsLoading = () => {
 const { t } = useTranslation();
 return (
 <Skeleton className="h-16 w-full" aria-label={t("loading")} />
 );
};

const EWalletPaymentMethod = ({ eWallet, feeConfig }) => {
 const { t } = useTranslation();
 if (!eWallet) {
 return (
 <div className="rounded border border-dashed border-border py-6 text-center">
 <p className="mb-1 text-sm font-medium text-text-primary">{t("ewallet_not_found")}</p>
 <p className="text-xs text-text-tertiary max-w-xs mx-auto">{t("you_need_to_create_an_ewallet_first_to_u")}</p>
 </div>
 );
 }
 const balance = toNumber(eWallet?.balance);
 const totalFee = toNumber(feeConfig?.totalCreationFee);
 const hasSufficientBalance = balance >= totalFee;

 return (
 <div className="flex items-center justify-between rounded border border-border p-4">
 <div>
 <p className="text-sm font-medium text-text-primary">{t("ewallet")}</p>
 <p className="text-xs text-text-tertiary">{t("digital_wallet")}</p>
 </div>
 <div className="text-right">
 <p className="text-base font-semibold tabular-nums text-text-primary">{formatPaymentAmount(balance)}</p>
 <p className={`text-xs ${hasSufficientBalance ? 'text-text-secondary' : 'text-status-warning-text'}`}>
 {hasSufficientBalance ? t("sufficient_balance") : t("insufficient_balance")}
 </p>
 </div>
 </div>
 );
};

const PaymentMethodDetails = ({
 isLoadingPaymentMethods,
 eWallet,
 feeConfig
}) => {
 if (isLoadingPaymentMethods) {
 return <PaymentMethodsLoading />;
 }
 return <EWalletPaymentMethod eWallet={eWallet} feeConfig={feeConfig} />;
};

const canProceedWithPaymentMethod = ({
 isLoadingPaymentMethods,
 eWallet,
 feeConfig
}) => {
 if (isLoadingPaymentMethods) return false;
 return !!eWallet && toNumber(eWallet.balance) >= toNumber(feeConfig?.totalCreationFee);
};

const PaymentVerificationModal = ({
 isOpen,
 selectedListing,
 feeConfig,
 paymentType = PAYMENT_TYPES.EWALLET,
 paymentMethods,
 isLoadingPaymentMethods,
 eWallet,
 onStartVerification,
 onVerifyAndPay,
 onCancel,
 isProcessing,
 verificationCode,
 onChangeVerificationCode,
 codeExpiryTime,
 onResendCode,
 isResendingCode,
 emails,
 onFetchEmails,
 onClearEmails,
 onNavigateToPaymentMethods
}) => {
 const { t } = useTranslation();
 const [step, setStep] = useState(VERIFICATION_STEPS.REVIEW);

 useEffect(() => {
 if (!isOpen) return;
 setStep(VERIFICATION_STEPS.REVIEW);
 }, [isOpen]);

 const suggestedFromInbox = useMemo(() => findLatestOtpFromEmails(emails, {
 emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
 maxScan: 16
 }), [emails]);

 const otpExpiresAtMsVerify = useMemo(() => {
 if (step !== VERIFICATION_STEPS.VERIFY || !codeExpiryTime) return null;
 const tVal = codeExpiryTime instanceof Date ? codeExpiryTime.getTime() : new Date(codeExpiryTime).getTime();
 return Number.isFinite(tVal) ? tVal : null;
 }, [step, codeExpiryTime]);

 const {
 formatted: otpTtlFormatted,
 isExpired: otpTtlExpired,
 active: otpTtlActive
 } = useOtpValidityCountdown(otpExpiresAtMsVerify);

 useOtpSuggestedToast({
 suggestedCode: suggestedFromInbox,
 enabled: Boolean(isOpen && step === VERIFICATION_STEPS.VERIFY)
 });

 useEffect(() => {
 if (isOpen && step === VERIFICATION_STEPS.VERIFY && !suggestedFromInbox) {
 onFetchEmails?.().catch(() => {});
 let count = 0;
 const interval = setInterval(async () => {
 if (count >= 6 || suggestedFromInbox) {
 clearInterval(interval);
 return;
 }
 count++;
 try {
 await onFetchEmails?.();
 } catch (err) {
 console.debug('Polling verification emails failed:', err);
 }
 }, 2000);
 return () => clearInterval(interval);
 }
 }, [isOpen, step, suggestedFromInbox, onFetchEmails]);

 const canStartPayment = canProceedWithPaymentMethod({
 isLoadingPaymentMethods,
 eWallet,
 feeConfig
 });

 const handleClose = () => {
 onClearEmails?.();
 onCancel?.();
 };

 const handleStart = async () => {
 const startTime = Date.now() - 3000;
 const ok = await onStartVerification?.();
 if (!ok) return;
 setStep(VERIFICATION_STEPS.VERIFY);
 try {
 await onFetchEmails?.(startTime);
 } catch (err) {
 console.debug('Fetch emails on start failed:', err);
 }
 };

 const handleVerify = async () => {
 const ok = await onVerifyAndPay?.();
 if (!ok) return;
 onClearEmails?.();
 };

 const handleResend = async () => {
 const startTime = Date.now() - 3000;
 await onResendCode?.();
 try {
 await onFetchEmails?.(startTime);
 } catch (err) {
 console.debug('Fetch emails on resend failed:', err);
 }
 };

 const isReview = step === VERIFICATION_STEPS.REVIEW;
 return (
 <Modal
 isOpen={isOpen}
 onClose={handleClose}
 title={isReview ? 'Payment confirmation' : 'Verify security code'}
 description={isReview ? 'Review payment details before initiating' : 'Enter the code sent to your email'}
 size="md"
 footer={
 <>
 <Button variant="secondary" onClick={handleClose}>{t("cancel")}</Button>
 {isReview ? (
 <Button onClick={handleStart} disabled={!canStartPayment || isProcessing}>
 {isProcessing ? 'Processing...' : 'Confirm and proceed'}
 </Button>
 ) : (
 <Button onClick={handleVerify} disabled={isProcessing || (verificationCode || '').length !== OTP_CODE_LENGTH || otpTtlExpired}>
 {isProcessing ? 'Verifying...' : 'Verify and pay fee'}
 </Button>
 )}
 </>
 }
 >
 <div className="space-y-5">
 <dl className="flex items-start justify-between gap-4 border-b border-border-light pb-4">
 <div className="min-w-0">
 <dt className="text-sm text-text-secondary">{t("listing")}</dt>
 <dd className="mt-0.5 truncate text-sm font-medium text-text-primary">{selectedListing?.title}</dd>
 </div>
 <div className="shrink-0 text-right">
 <dt className="text-sm text-text-secondary">{t("amount")}</dt>
 <dd className="mt-0.5 text-base font-semibold tabular-nums text-text-primary">
 {feeConfig ? formatPaymentAmount(feeConfig.totalCreationFee) : ''}
 </dd>
 </div>
 </dl>

 {isReview ? (
 <div className="space-y-3">
 <p className="text-sm font-medium text-text-primary">{t("payment_method")}</p>
 <PaymentMethodDetails
 paymentType={paymentType}
 paymentMethods={paymentMethods}
 isLoadingPaymentMethods={isLoadingPaymentMethods}
 eWallet={eWallet}
 feeConfig={feeConfig}
 onNavigateToPaymentMethods={onNavigateToPaymentMethods}
 />
 </div>
 ) : (
 <div className="space-y-4">
 {suggestedFromInbox && (
 <OtpSuggestionBanner suggestedCode={suggestedFromInbox} onApply={onChangeVerificationCode} />
 )}
 <div className="space-y-3">
 <p className="text-sm font-medium text-text-primary">{t("verification_code")}</p>
 <OtpDigitInputGroup
 value={verificationCode}
 onChange={v => onChangeVerificationCode?.(sanitizeOtpInput(v, OTP_CODE_LENGTH))}
 dataSlotPrefix="listing-fee-otp"
 disabled={!!isProcessing || otpTtlExpired}
 />
 <div className="flex items-center justify-between">
 <button
 type="button"
 onClick={handleResend}
 disabled={isResendingCode}
 className="text-sm text-text-secondary underline-offset-2 transition-colors hover:text-text-primary hover:underline disabled:opacity-50"
 >
 {isResendingCode ? 'Sending code...' : 'Resend verification code'}
 </button>
 {otpTtlActive && (
 <span className={`text-sm tabular-nums ${otpTtlExpired ? 'text-status-warning-text' : 'text-text-tertiary'}`}>
 {otpTtlExpired ? 'Code expired' : <>{t("expires_in")}: {otpTtlFormatted}</>}
 </span>
 )}
 </div>
 </div>
 </div>
 )}
 </div>
 </Modal>
 );
};

export default PaymentVerificationModal;
