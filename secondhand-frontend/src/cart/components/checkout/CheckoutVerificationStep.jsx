import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

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
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-2">Verification</h2>
                <p className="text-gray-600">Enter the verification code sent to your email to complete your purchase.</p>
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
                                className="w-14 h-14 text-center text-xl font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                maxLength="1"
                                data-index={index}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                {/* Resend Code */}
                <div className="text-center">
                    <button
                        onClick={handleResendCode}
                        disabled={!canResend}
                        className={`text-sm font-medium transition-colors ${
                            canResend
                                ? 'text-blue-600 hover:text-blue-700'
                                : 'text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </button>
                </div>

                {/* Recent Emails */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Recent Emails</h4>
                        <button
                            onClick={fetchEmails}
                            disabled={isEmailsLoading}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                            {isEmailsLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {isEmailsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : emails && emails.length > 0 ? (
                            <div className="space-y-3">
                                {emails.slice(0, 2).map((email, index) => (
                                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900">
                                                {email.subject || 'Verification Code'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {email.sentAt || email.createdAt}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 font-mono">
                                            {email.body || email.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShieldCheckIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No emails found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onCheckout}
                    disabled={proceedDisabled || isCheckingOut || !isCodeComplete}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
