import React, {useEffect, useState} from 'react';
import {Lock, ShieldCheck as ShieldCheckIcon} from 'lucide-react';

const CheckoutVerificationStep = ({
    paymentVerificationCode,
    setPaymentVerificationCode,
    emails,
    isEmailsLoading,
    fetchEmails,
    onCheckout,
    onBack,
    proceedDisabled,
    isCheckingOut
}) => {
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(true);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleResendCode = async () => {
        setCanResend(false);
        setResendTimer(60);
        await fetchEmails();
    };

    const handleCodeChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newCode = paymentVerificationCode.split('');
            newCode[index] = value;
            setPaymentVerificationCode(newCode.join(''));
            
            if (value && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                nextInput?.focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !paymentVerificationCode[index] && index > 0) {
            const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
            prevInput?.focus();
        }
    };

    const isCodeComplete = paymentVerificationCode.length === 6;
    const filledCount = (paymentVerificationCode || '').replace(/\s/g, '').length;

    return (
        <div className="p-5">
            {/* Security banner */}
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <h2 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Secure Verification</h2>
                    <p className="text-[11px] text-gray-400">A 6-digit code has been sent to your email.</p>
                </div>
            </div>

            <div className="space-y-5">
                {/* Code input */}
                <div className="text-center">
                    <div className="flex justify-center gap-2.5">
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                            const hasValue = Boolean(paymentVerificationCode[index]);
                            return (
                                <input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    value={paymentVerificationCode[index] || ''}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-11 h-12 text-center text-[16px] font-mono rounded-lg transition-all duration-150 focus:outline-none ${
                                        hasValue
                                            ? 'border-gray-900 bg-gray-900 text-white border'
                                            : 'border border-gray-200 bg-white text-gray-900 focus:border-gray-400 focus:ring-1 focus:ring-gray-200'
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
                        {[0, 1, 2, 3, 4, 5].map((i) => (
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
                            disabled={!canResend}
                            className={`text-[12px] font-medium transition-colors ${
                                canResend
                                    ? 'text-gray-600 hover:text-gray-900 underline underline-offset-2'
                                    : 'text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
                        </button>
                    </div>
                </div>

                {/* Recent emails */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[12px] font-semibold text-gray-700">Recent Emails</h4>
                        <button
                            onClick={fetchEmails}
                            disabled={isEmailsLoading}
                            className="text-[11px] text-gray-500 hover:text-gray-700 font-medium disabled:opacity-40 transition-colors"
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
                                    <div key={index} className="px-3 py-2.5 bg-white border border-gray-100 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[12px] font-medium text-gray-900">
                                                {email.subject || 'Verification Code'}
                                            </span>
                                            <span className="text-[10px] text-gray-400 tabular-nums">
                                                {email.sentAt || email.createdAt}
                                            </span>
                                        </div>
                                        <div className="text-[12px] text-gray-600 font-mono">
                                            {email.body || email.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <ShieldCheckIcon className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                                <p className="text-[12px] text-gray-400">No emails found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-50">
                <button
                    onClick={onBack}
                    className="px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onCheckout}
                    disabled={proceedDisabled || isCheckingOut || !isCodeComplete}
                    className={`px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                        isCodeComplete && !proceedDisabled && !isCheckingOut
                            ? 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isCheckingOut ? (
                        <>
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                            <span>Processing…</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            <span>Complete Purchase</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckoutVerificationStep;
