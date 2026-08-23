import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from 'framer-motion';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
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
 <div className="flex items-center justify-center py-6">
 <LoadingIndicator size="h-6 w-6" />
 <span className="ml-2 text-sm font-medium text-slate-600">{t("loading")}</span>
 </div>
 );
};

const EWalletPaymentMethod = ({ eWallet, feeConfig }) => {
 const { t } = useTranslation();
 if (!eWallet) {
 return (
 <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
 <p className="text-sm font-bold text-slate-700 mb-1">{t("ewallet_not_found")}</p>
 <p className="text-xs text-slate-500 max-w-xs mx-auto">{t("you_need_to_create_an_ewallet_first_to_u")}</p>
 </div>
 );
 }
 const balance = toNumber(eWallet?.balance);
 const totalFee = toNumber(feeConfig?.totalCreationFee);
 const hasSufficientBalance = balance >= totalFee;

 return (
 <div className="space-y-3">
 <div className={`border rounded-2xl p-4 transition-all ${hasSufficientBalance ? 'bg-slate-100/60 border-slate-300' : 'bg-amber-50/60 border-amber-200'}`}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${hasSufficientBalance ? 'bg-slate-200 text-slate-900' : 'bg-amber-100 text-amber-700'}`}>
 ₺
 </div>
 <div>
 <p className="font-bold text-slate-900 text-sm">{t("ewallet")}</p>
 <p className="text-xs text-slate-500">{t("digital_wallet")}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-base font-bold text-slate-900">
 {formatPaymentAmount(balance)}
 </p>
 <span className={`text-xs font-semibold ${hasSufficientBalance ? 'text-slate-900' : 'text-amber-700'}`}>
 {hasSufficientBalance ? t("sufficient_balance") : t("insufficient_balance")}
 </span>
 </div>
 </div>
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

 if (!isOpen) return null;

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ duration: 0.25, ease: "easeOut" }}
 className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
 >
 {/* Header */}
 <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-xl bg-slate-100 text-slate-900">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
 </svg>
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 tracking-tight">
 {step === VERIFICATION_STEPS.REVIEW ? 'Payment Confirmation' : 'Verify Security Code'}
 </h3>
 <p className="text-xs text-slate-500">
 {step === VERIFICATION_STEPS.REVIEW ? 'Review payment details before initiating' : 'Enter the code sent to your email'}
 </p>
 </div>
 </div>
 <button
 onClick={handleClose}
 className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Content */}
 <div className="p-6 space-y-5">
 {/* Listing Spotlight Banner */}
 <div className="rounded-2xl border border-slate-200 bg-slate-100/50 p-4 flex items-center justify-between">
 <div className="min-w-0 pr-3">
 <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{t("listing")}</p>
 <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{selectedListing?.title}</p>
 </div>
 <div className="text-right flex-shrink-0">
 <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{t("amount")}</p>
 <p className="text-base font-black text-slate-900">
 {feeConfig ? formatPaymentAmount(feeConfig.totalCreationFee) : ''}
 </p>
 </div>
 </div>

 {step === VERIFICATION_STEPS.REVIEW ? (
 <div className="space-y-4">
 <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("payment_method")}</p>
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
 <div className="space-y-5">
 {suggestedFromInbox && (
 <OtpSuggestionBanner suggestedCode={suggestedFromInbox} onApply={onChangeVerificationCode} />
 )}

 <div className="space-y-3">
 <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
 {t("verification_code")}
 </label>
 <OtpDigitInputGroup
 value={verificationCode}
 onChange={v => onChangeVerificationCode?.(sanitizeOtpInput(v, OTP_CODE_LENGTH))}
 dataSlotPrefix="listing-fee-otp"
 disabled={!!isProcessing || otpTtlExpired}
 />

 <div className="flex items-center justify-between pt-2">
 <button
 type="button"
 onClick={handleResend}
 disabled={isResendingCode}
 className="text-xs font-bold text-slate-900 hover:text-slate-900 disabled:opacity-50 transition-colors"
 >
 {isResendingCode ? 'Sending Code...' : 'Resend Verification Code'}
 </button>

 {otpTtlActive && (
 <div className={`text-xs font-medium tabular-nums ${otpTtlExpired ? 'text-amber-700' : 'text-slate-500'}`}>
 {otpTtlExpired ? 'Code expired' : <>{t("expires_in")}: <span className="font-bold text-slate-700">{otpTtlFormatted}</span></>}
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
 <button
 onClick={handleClose}
 className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all"
 >
 {t("cancel")}
 </button>

 {step === VERIFICATION_STEPS.REVIEW ? (
 <button
 onClick={handleStart}
 disabled={!canStartPayment || isProcessing}
 className="px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-extrabold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-900 active:translate-y-0 disabled:opacity-50 transition-all"
 >
 {isProcessing ? 'Processing...' : 'Confirm & Proceed'}
 </button>
 ) : (
 <button
 onClick={handleVerify}
 disabled={isProcessing || (verificationCode || '').length !== OTP_CODE_LENGTH || otpTtlExpired}
 className="px-5 py-2.5 rounded-xl bg-slate-900 text-xs font-extrabold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-900 disabled:opacity-50 transition-all"
 >
 {isProcessing ? 'Verifying...' : 'Verify & Pay Fee'}
 </button>
 )}
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
};

export default PaymentVerificationModal;