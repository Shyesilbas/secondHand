import React, {useEffect, useState} from 'react';
import {ShieldCheck as ShieldCheckIcon} from 'lucide-react';

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
            
            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                nextInput?.focus();
            }
        }
    };

    const isCodeComplete = paymentVerificationCode.length === 6;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tighter">Verification</h2>
                <p className="text-slate-500 tracking-tight">Enter the verification code sent to your email to complete your purchase.</p>
            </div>

            <div className="space-y-8">
                {/* Verification Code Input */}
                <div className="text-center">
                    <label className="block text-lg font-medium text-gray-900 mb-6">
                        Enter Verification Code
                    </label>
                    <div className="flex justify-center space-x-3">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                type="text"
                                value={paymentVerificationCode[index] || ''}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                className="w-14 h-14 text-center text-xl font-mono border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-tight"
                                maxLength="1"
                                data-index={index}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-slate-500 mt-4 tracking-tight">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend}
                        className={`text-sm font-semibold transition-colors tracking-tight ${
                            canResend
                                ? 'text-indigo-600 hover:text-indigo-700'
                                : 'text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </button>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900 tracking-tight">Recent Emails</h4>
                        <button
                            onClick={fetchEmails}
                            disabled={isEmailsLoading}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold disabled:opacity-50 tracking-tight"
                        >
                            {isEmailsLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {isEmailsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : emails && emails.length > 0 ? (
                            <div className="space-y-3">
                                {emails.slice(0, 2).map((email, index) => (
                                    <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-slate-900 tracking-tight">
                                                {email.subject || 'Verification Code'}
                                            </span>
                                            <span className="text-xs text-slate-500 tracking-tight">
                                                {email.sentAt || email.createdAt}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-600 font-mono tracking-tight">
                                            {email.body || email.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <ShieldCheckIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                                <p className="tracking-tight">No emails found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors tracking-tight"
                >
                    Back
                </button>
                <button
                    onClick={onCheckout}
                    disabled={proceedDisabled || isCheckingOut || !isCodeComplete}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 tracking-tight"
                >
                    {isCheckingOut ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheckIcon className="w-4 h-4" />
                            <span>Complete Purchase</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CheckoutVerificationStep;
