import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState, memo } from 'react';
import { Lock, ShieldCheck, ArrowLeft, RotateCw } from 'lucide-react';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../../common/constants/otp.js';
import { findLatestOtpWithEmail } from '../../../payments/utils/otp.js';
import OtpDigitInputGroup from '../../../payments/components/verification/OtpDigitInputGroup.jsx';
import OtpSuggestionBanner from '../../../payments/components/verification/OtpSuggestionBanner.jsx';
import { useOtpSuggestedToast } from '../../../payments/hooks/useOtpSuggestedToast.js';
import { useOtpValidityCountdown } from '../../../payments/hooks/useOtpValidityCountdown.js';
import { EMAIL_TYPES } from '../../../emails/emails.js';

const CheckoutVerificationStep = ({
 paymentVerificationCode,
 setPaymentVerificationCode,
 paymentVerificationExpiresAtMs,
 emails,
 fetchEmails,
 sendVerificationCode,
 onCheckout,
 onBack,
 proceedDisabled,
 isCheckingOut
}) => {
 const { t } = useTranslation();
 const [resendTimer, setResendTimer] = useState(0);
 const [canResend, setCanResend] = useState(true);
 const [isResending, setIsResending] = useState(false);

 const otpResult = useMemo(() => findLatestOtpWithEmail(emails, {
 emailType: EMAIL_TYPES.PAYMENT_VERIFICATION,
 maxScan: 16
 }), [emails]);

 const suggestedFromInbox = otpResult?.code || null;
 const sourceEmail = otpResult?.email || null;

 useOtpSuggestedToast({
 suggestedCode: suggestedFromInbox,
 enabled: true
 });

 useEffect(() => {
 if (!suggestedFromInbox) {
 fetchEmails().catch(() => {});
 let count = 0;
 const interval = setInterval(async () => {
 if (count >= 6 || suggestedFromInbox) {
 clearInterval(interval);
 return;
 }
 count++;
 try {
 await fetchEmails();
 } catch (err) {
 console.debug('Polling emails failed:', err);
 }
 }, 2000);
 return () => clearInterval(interval);
 }
 }, [suggestedFromInbox, fetchEmails]);

 const {
 formatted: ttlFormatted,
 isExpired: ttlExpired,
 active: ttlActive
 } = useOtpValidityCountdown(paymentVerificationExpiresAtMs ?? null);

 useEffect(() => {
 if (resendTimer > 0) {
 const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
 return () => clearTimeout(timer);
 }
 setCanResend(true);
 }, [resendTimer]);

 const handleResendCode = async () => {
 setCanResend(false);
 setResendTimer(60);
 setIsResending(true);
 try {
 await sendVerificationCode();
 await fetchEmails();
 } finally {
 setIsResending(false);
 }
 };

 const sanitized = sanitizeOtpInput(paymentVerificationCode, OTP_CODE_LENGTH);
 const isCodeComplete = sanitized.length === OTP_CODE_LENGTH;

 return (
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
 {/* Centered content */}
 <div className="mx-auto max-w-md">
 {/* Lock icon + heading */}
 <div className="mb-8 text-center select-none">
 <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-slate-900 shadow-xs">
 <Lock className="h-6 w-6" strokeWidth={2.5} />
 </div>
 <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{t("verify_your_purchase", "Ödemeyi Doğrulayın")}</h2>
 <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
 E-posta adresinize gönderilen <strong>{OTP_CODE_LENGTH} haneli</strong> tek kullanımlık güvenlik kodunu aşağıya giriniz.
 </p>
 {ttlActive && (
 <div className="mt-3 flex items-center justify-center">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
 ttlExpired
 ? 'bg-rose-50 text-rose-700 border-rose-200'
 : 'bg-slate-100 text-slate-700 border-slate-200'
 }`}>
 {ttlExpired ? '⚠️ Kodun süresi doldu — Yeni kod isteyin' : `Kalan Süre: ${ttlFormatted}`}
 </span>
 </div>
 )}
 </div>

 {/* OTP suggestion banner */}
 {suggestedFromInbox && (
 <div className="mb-5">
 <OtpSuggestionBanner suggestedCode={suggestedFromInbox} sourceEmail={sourceEmail} onApply={setPaymentVerificationCode} />
 </div>
 )}

 {/* OTP input */}
 <div className="mb-8">
 <OtpDigitInputGroup
 value={paymentVerificationCode}
 onChange={setPaymentVerificationCode}
 dataSlotPrefix="checkout-otp"
 disabled={!!isCheckingOut || ttlExpired}
 />

 <div className="mt-5 text-center">
 <button
 type="button"
 onClick={handleResendCode}
 disabled={!canResend || isResending}
 className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
 canResend && !isResending
 ? 'text-slate-900 hover:text-slate-900 hover:underline cursor-pointer'
 : 'cursor-not-allowed text-slate-400'
 }`}
 >
 <RotateCw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
 {isResending ? 'Kod Gönderiliyor…' : canResend ? 'Tekrar Kod Gönder' : `Yeni kod için bekle: ${resendTimer}s`}
 </button>
 </div>
 </div>

 {/* Complete purchase button */}
 <button
 type="button"
 onClick={onCheckout}
 disabled={proceedDisabled || isCheckingOut || !isCodeComplete || ttlExpired}
 className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 shadow-xs active:scale-[0.98]"
 >
 {isCheckingOut ? (
 <>
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
 {t("processing", "İşlem Gerçekleştiriliyor...")}
 </>
 ) : (
 <>
 <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
 {t("complete_purchase", "Ödemeyi Tamamla")}
 </>
 )}
 </button>

 {/* Trust indicators */}
 <div className="mt-6 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-100 pt-4">
 <div className="flex items-center gap-1">
 <Lock className="h-3.5 w-3.5 text-slate-900" />
 <span>256-Bit SSL Şifreleme</span>
 </div>
 <span>·</span>
 <span>Escrow Güvenli Havuz</span>
 </div>
 </div>

 {/* Back link — desktop */}
 <div className="mt-6 hidden border-t border-slate-100 pt-6 sm:block">
 <button
 type="button"
 onClick={onBack}
 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 </div>

 {/* Back — mobile */}
 <div className="mt-6 border-t border-slate-100 pt-5 sm:hidden">
 <button
 type="button"
 onClick={onBack}
 className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700"
 >
 <ArrowLeft className="h-4 w-4" strokeWidth={2} />
 {t("back", "Geri")}
 </button>
 </div>
 </div>
 );
};

export default memo(CheckoutVerificationStep);