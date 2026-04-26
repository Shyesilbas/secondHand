import {useEffect, useState} from 'react';
import {Lock, ShieldCheck as ShieldCheckIcon} from 'lucide-react';
import { OTP_CODE_LENGTH, sanitizeOtpInput } from '../../../common/constants/otp.js';

const CheckoutVerificationStep = ({
    paymentVerificationCode,
    setPaymentVerificationCode,
    emails,
    isEmailsLoading,
    fetchEmails,
    sendVerificationCode,
    onCheckout,
    onBack,
    proceedDisabled,
    isCheckingOut
}) => {
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);
    const [isResending, setIsResending] = useState(false);

    const [codeArray, setCodeArray] = useState(() => {
        const initial = Array(OTP_CODE_LENGTH).fill('');
        if (paymentVerificationCode) {
            const chars = paymentVerificationCode.split('');
            for (let i = 0; i < OTP_CODE_LENGTH; i++) {
                initial[i] = chars[i] || '';
            }
        }
        return initial;
    });

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    useEffect(() => {
        setPaymentVerificationCode(codeArray.join(''));
    }, [codeArray, setPaymentVerificationCode]);

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

    const handleCodeChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const nextArray = [...codeArray];
            nextArray[index] = value;
            setCodeArray(nextArray);
            
            if (value && index < OTP_CODE_LENGTH - 1) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
            prevInput?.focus();
        }
    };

    const handleCodePaste = (e) => {
        const pasted = sanitizeOtpInput(e.clipboardData.getData('text'), OTP_CODE_LENGTH);
        if (!pasted) return;
        
        e.preventDefault();
        const chars = pasted.split('');
        const nextArray = Array(OTP_CODE_LENGTH).fill('');
        for (let i = 0; i < OTP_CODE_LENGTH; i++) {
            nextArray[i] = chars[i] || '';
        }
        setCodeArray(nextArray);

        const focusIndex = Math.min(pasted.length, OTP_CODE_LENGTH - 1);
        const focusInput = document.querySelector(`input[data-index="${focusIndex}"]`);
        focusInput?.focus();
    };

    const isCodeComplete = codeArray.every(char => char !== '') && codeArray.length === OTP_CODE_LENGTH;
    const filledCount = codeArray.filter(char => char !== '').length;

    return (
        <div className="p-4 sm:p-5">
            {/* Security banner */}
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border border-slate-200">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Secure Verification</h2>
                    <p className="text-xs text-slate-500">{`A ${OTP_CODE_LENGTH}-digit code has been sent to your email.`}</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Code input */}
                <div className="text-center">
                    <div className="flex justify-center gap-2.5">
                        {Array.from({ length: OTP_CODE_LENGTH }, (_, index) => index).map((index) => {
                            const hasValue = Boolean(codeArray[index]);
                            return (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    value={codeArray[index] || ''}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handleCodePaste}
                                    aria-label={`Verification digit ${index + 1}`}
                                    className={`w-11 h-12 text-center text-[16px] font-mono rounded-xl transition-all duration-150 focus:outline-none ${
                                        hasValue
                                            ? 'border-indigo-600 bg-indigo-600 text-white border'
                                            : 'border border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                                    }`}
                                    maxLength="1"
                                    data-index={index}
                                    autoComplete="one-time-code"
                                />
                            );
                        })}
                    </div>
                    {/* Progress hint */}
                    <div className="mt-2.5 flex items-center justify-center gap-1">
                        {Array.from({ length: OTP_CODE_LENGTH }, (_, i) => i).map((i) => (
                            <div
                                key={i}
                                className={`w-1 h-1 rounded-full transition-colors ${
                                    i < filledCount ? 'bg-gray-900' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="mt-3">
                        <button
                            onClick={handleResendCode}
                            disabled={!canResend || isResending}
                            className={`text-xs font-semibold transition-colors ${
                                canResend && !isResending
                                    ? 'text-slate-600 hover:text-slate-900 underline underline-offset-2'
                                    : 'text-slate-300 cursor-not-allowed'
                            }`}
                        >
                            {isResending ? 'Sending…' : (canResend ? 'Resend code' : `Resend in ${resendTimer}s`)}
                        </button>
                    </div>
                </div>

                {/* Recent emails */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-700">Recent Emails</h4>
                        <button
                            onClick={fetchEmails}
                            disabled={isEmailsLoading}
                            className="text-xs text-slate-500 hover:text-slate-700 font-semibold disabled:opacity-40 transition-colors"
                        >
                            {isEmailsLoading ? 'Loading…' : 'Refresh'}
                        </button>
                    </div>
                    
                    <div className="max-h-52 overflow-y-auto">
                        {isEmailsLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400" />
                            </div>
                        ) : emails && emails.length > 0 ? (
                            <div className="space-y-2">
                                {emails.slice(0, 2).map((email, index) => (
                                    <div key={index} className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-semibold text-slate-900">
                                                {email.subject || 'Verification Code'}
                                            </span>
                                            <span className="text-[11px] text-slate-500 tabular-nums">
                                                {email.sentAt || email.createdAt}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 font-mono">
                                            {email.body || email.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <ShieldCheckIcon className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                                <p className="text-xs text-slate-500">No emails found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden sm:flex items-center justify-between pt-6 mt-8 border-t border-slate-200/60">
                <button
                    onClick={onBack}
                    className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                    Back
                </button>
                <button
                    onClick={onCheckout}
                    disabled={proceedDisabled || isCheckingOut || !isCodeComplete}
                    className={`px-6 py-3 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all ${
                        isCodeComplete && !proceedDisabled && !isCheckingOut
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed transform-none'
                    }`}
                >
                    {isCheckingOut ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>Processing…</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Complete Purchase</span>
                        </>
                    )}
                </button>
            </div>

            <div className="sm:hidden sticky bottom-0 -mx-5 mt-6 px-5 py-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-3.5 rounded-2xl border-2 border-slate-200/80 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={onCheckout}
                        disabled={proceedDisabled || isCheckingOut || !isCodeComplete}
                        className={`px-4 py-3.5 rounded-2xl text-sm font-bold shadow-lg flex justify-center items-center gap-1.5 transition-all ${
                            isCodeComplete && !proceedDisabled && !isCheckingOut
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                        }`}
                    >
                        {isCheckingOut ? (
                            <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-400" />
                                <span>Processing…</span>
                            </>
                        ) : (
                            'Complete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutVerificationStep;
