import { Check, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { membershipService } from '../../services/membershipService';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import PaymentAgreementsSection from '../../../payments/components/PaymentAgreementsSection.jsx';
import { useAgreementsState } from '../../../payments/hooks/useListingPaymentFlow.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { OTP_CODE_LENGTH } from '../../constants/otp.js';
import { orderService } from '../../../order/services/orderService.js';
import { useEmails } from '../../../payments/hooks/useEmails.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';
import { sanitizeOtpInput, findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../../payments/paymentSchema.js';
import { useEWallet } from '../../../ewallet/hooks/useEWallet.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { authService } from '../../../auth/services/authService.js';

const PREMIUM_PRICE = 100;

const PremiumUpgradeModal = ({ isOpen, onClose, featureHint }) => {
 const { t } = useTranslation();
 const queryClient = useQueryClient();
 const { showSuccess } = useNotification();
 const { updateUser } = useAuth();

 const FEATURES = useMemo(() => [
 { label: 'Aura AI', free: t("daily_4_messages"), premium: t("daily_10_messages") },
 { label: 'AI İlan Oluşturma', free: t("monthly_1_credit"), premium: t("monthly_4_credits") },
 { label: 'Showcase Slot', free: t("1_slot"), premium: t("3_slots") },
 { label: 'Gelişmiş Analitik', free: t("basic_view"), premium: t("full_access") },
 { label: 'Hızlı Teslimat', free: t("3_business_days"), premium: t("1_business_day") },
 ], [t]);

 const STEPS = useMemo(() => [
 { id: 1, label: t("step_plan") },
 { id: 2, label: t("step_agreements") },
 { id: 3, label: t("step_verification") },
 ], [t]);

 const [step, setStep] = useState(1);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [verificationCode, setVerificationCode] = useState('');
 const [otpExpiresAtMs, setOtpExpiresAtMs] = useState(null);
 const [localEmails, setLocalEmails] = useState(null);

 const { emails, fetchEmails } = useEmails();
 const { eWallet, refreshWallet } = useEWallet({ enabled: isOpen });

 const {
 acceptedAgreements,
 onAgreementToggle,
 onRequiredAgreementsChange,
 areAllAgreementsAccepted,
 getAcceptedAgreementIds,
 } = useAgreementsState();

 const inboxMatch = useMemo(
 () => findLatestOtpWithEmail(localEmails || emails, { emailType: EMAIL_TYPES.PAYMENT_VERIFICATION, maxScan: 16 }),
 [emails, localEmails]
 );
 const suggestedFromInbox = inboxMatch?.code;
 const suggestedEmail = inboxMatch?.email;

 const { formatted: otpTtlFormatted, isExpired: otpTtlExpired, active: otpTtlActive } =
 useOtpValidityCountdown(step === 3 ? otpExpiresAtMs : null);

 useEffect(() => {
 if (isOpen) {
 refreshWallet();
 setStep(1);
 setError(null);
 setVerificationCode('');
 setOtpExpiresAtMs(null);
 setLocalEmails(null);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isOpen]);

 useEffect(() => {
 if (step !== 3) {
 setVerificationCode('');
 setOtpExpiresAtMs(null);
 setError(null);
 }
 }, [step]);

 const canAfford = Number(eWallet?.balance || 0) >= PREMIUM_PRICE;

 const sendVerificationCode = async () => {
 setLoading(true);
 setError(null);
 const startTime = Date.now() - 3000; // 3 seconds buffer for clock skew
 try {
 await orderService.initiatePaymentVerification({
 transactionType: 'MEMBERSHIP_PAYMENT',
 amount: PREMIUM_PRICE,
 });
 const res = await fetchEmails(startTime);
 setLocalEmails(res);
 setOtpExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
 setStep(3);
 } catch (err) {
 setError(err?.response?.data?.message || err?.message || 'Doğrulama kodu gönderilemedi.');
 } finally {
 setLoading(false);
 }
 };

 const handleUpgrade = async () => {
 const code = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH);
 if (otpTtlExpired) { setError('Doğrulama kodunun süresi doldu. Geri dönüp yeni kod isteyin.'); return; }
 if (code.length !== OTP_CODE_LENGTH) { setError('6 haneli doğrulama kodunu girin.'); return; }

 setLoading(true);
 setError(null);
 try {
 await membershipService.upgradeToPremium({
 agreementsAccepted: areAllAgreementsAccepted(),
 acceptedAgreementIds: getAcceptedAgreementIds(),
 verificationCode: code,
 });
 try {
 const updatedProfile = await authService.getCurrentUser();
 if (updatedProfile) {
 updateUser(updatedProfile);
 }
 } catch {
 // Fallback local update if profile fetch fails
 updateUser({ plan: 'PREMIUM' });
 }
 queryClient.invalidateQueries({ queryKey: ['membership'] });
 queryClient.invalidateQueries({ queryKey: ['auth'] });
 showSuccess('Premium Üyelik', 'Premium planına başarıyla geçiş yaptınız!');
 onClose?.();
 } catch (err) {
 setError(err?.response?.data?.message ?? 'Bir hata oluştu.');
 } finally {
 setLoading(false);
 }
 };

 const handleNext = useCallback(() => {
 if (step === 2) { sendVerificationCode(); return; }
 if (step < 3) { setError(null); setStep(s => s + 1); }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [step]);

 const handleBack = useCallback(() => {
 if (step > 1) { setError(null); setStep(s => s - 1); } else onClose?.();
 }, [step, onClose]);

 const otpFilled = sanitizeOtpInput(verificationCode, OTP_CODE_LENGTH).length === OTP_CODE_LENGTH;

 const canGoNext = useCallback(() => {
 if (step === 1) return canAfford;
 if (step === 2) return areAllAgreementsAccepted();
 return false;
 }, [step, canAfford, areAllAgreementsAccepted]);

 const header = (
 <header className="border-b border-border-light px-5 py-4">
 <div className="flex items-start justify-between gap-4">
 <div className="min-w-0">
 <h2 className="text-lg font-semibold text-text-primary">{t("premium_membership")}</h2>
 <p className="mt-0.5 text-sm text-text-secondary">{featureHint ?? t("access_all_features")}</p>
 </div>
 <button type="button" onClick={onClose} aria-label={t("close")} className="rounded p-2 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>
 <ol className="mt-4 flex items-center gap-2 text-sm">
 {STEPS.map(({ id, label }, index) => (
 <li key={id} className="flex items-center gap-2" aria-current={step === id ? 'step' : undefined}>
 {index > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
 <span className={`tabular-nums ${step === id ? 'font-medium text-text-primary' : step > id ? 'text-text-secondary' : 'text-text-tertiary'}`}>
 {id}. {label}
 </span>
 </li>
 ))}
 </ol>
 </header>
 );

 const footer = (
 <>
 <Button variant="secondary" onClick={handleBack}>{step > 1 ? t("back_button") : t("cancel")}</Button>
 {step < 3 ? (
 <Button onClick={handleNext} disabled={loading || !canGoNext()}>
 {loading ? t("sending_progress") : step === 2 ? t("send_code_and_continue") : t("continue_button")}
 </Button>
 ) : (
 <Button onClick={handleUpgrade} disabled={loading || !otpFilled || otpTtlExpired}>
 {loading ? t("processing_progress") : t("complete_payment")}
 </Button>
 )}
 </>
 );

 return (
 <Modal isOpen={isOpen} onClose={onClose} title={t("premium_membership")} header={header} footer={footer} size="sm">
 {step === 1 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between border-b border-border-light pb-4">
 <div>
 <p className="text-sm font-medium text-text-primary">{t("my_ewallet")}</p>
 <p className="text-sm tabular-nums text-text-secondary">{t("balance")}: {Number(eWallet?.balance || 0).toFixed(2)}₺</p>
 </div>
 <div className="text-right">
 <p className="text-xl font-semibold tabular-nums text-text-primary">₺100</p>
 <p className="text-xs text-text-tertiary">{t("per_month")}</p>
 </div>
 </div>

 {!canAfford && <p role="alert" className="text-sm text-status-error-text">{t("insufficient_balance_please_topup")}</p>}

 <div>
 <p className="mb-2 text-sm font-medium text-text-primary">{t("plan_comparison")}</p>
 <ul className="divide-y divide-border-light rounded border border-border">
 {FEATURES.map((feature) => (
 <li key={feature.label} className="flex items-center justify-between gap-3 px-4 py-3">
 <div className="min-w-0">
 <p className="text-sm text-text-primary">{feature.label}</p>
 <p className="text-xs text-text-tertiary line-through">{feature.free}</p>
 </div>
 <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-text-primary">
 <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {feature.premium}
 </span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-4">
 <p className="text-sm text-text-secondary">{t("agreements_step_hint")}</p>
 <PaymentAgreementsSection
 acceptedAgreements={acceptedAgreements}
 onToggle={onAgreementToggle}
 onRequiredAgreementsChange={onRequiredAgreementsChange}
 />
 </div>
 )}

 {step === 3 && (
 <div className="space-y-5">
 <div>
 <h3 className="text-sm font-medium text-text-primary">{t("email_verification")}</h3>
 <p className="mt-1 text-sm text-text-secondary">
 {t('enter_verification_code_sent_to_email', 'E-postanıza gönderilen {{length}} haneli kodu girerek ödemeyi tamamlayın.', { length: OTP_CODE_LENGTH })}
 </p>
 {otpTtlActive && (
 <p className={`mt-1 text-sm tabular-nums ${otpTtlExpired ? 'text-status-warning-text' : 'text-text-tertiary'}`}>
 {otpTtlExpired ? t("code_expired_request_new") : `${t("validity_label")}: ${otpTtlFormatted}`}
 </p>
 )}
 </div>

 <div className="flex items-center justify-between border-y border-border-light py-3">
 <div>
 <p className="text-sm font-medium text-text-primary">{t("premium_membership")}</p>
 <p className="text-sm tabular-nums text-text-secondary">{t("my_ewallet")}: {Number(eWallet?.balance || 0).toFixed(2)}₺</p>
 </div>
 <span className="text-lg font-semibold tabular-nums text-text-primary">₺100</span>
 </div>

 {suggestedFromInbox && (
 <OtpSuggestionBanner
 suggestedCode={suggestedFromInbox}
 sourceEmail={suggestedEmail}
 onApply={setVerificationCode}
 />
 )}

 <OtpDigitInputGroup
 value={verificationCode}
 onChange={setVerificationCode}
 dataSlotPrefix="premium-otp"
 disabled={loading || otpTtlExpired}
 />
 </div>
 )}

 {error && <div className="mt-4"><p role="alert" className="text-sm text-status-error-text">{error}</p></div>}
 </Modal>
 );
};

export default PremiumUpgradeModal;
