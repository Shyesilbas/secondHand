import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useNotification } from '../notification/NotificationContext.jsx';
import { verificationService } from './services/verificationService.js';
import { ROUTES } from '../common/constants/routes.js';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import { SuccessIcon, WarningIcon } from '../common/Icons.jsx';

const VerificationButton = ({ onClick, isLoading, disabled, children }) => (
    <AuthButton onClick={onClick} isLoading={isLoading} disabled={disabled} className="w-full">
        {isLoading ? 'Processing...' : children}
    </AuthButton>
);

const ResendButton = ({ onClick, countdown, isSending }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={countdown > 0 || isSending}
        className={`mt-1 font-medium ${countdown > 0 || isSending ? 'text-text-muted cursor-not-allowed' : 'text-btn-primary hover:text-blue-500'}`}
    >
        {countdown > 0 ? `Resend in ${countdown}s` : isSending ? 'Sending...' : 'Send Again'}
    </button>
);

const StatusAlert = ({ title, children, icon, colorClass = 'yellow' }) => (
    <div className={`bg-${colorClass}-50 border border-${colorClass}-200 rounded-md p-4`}>
        <div className="flex">
            <div className="flex-shrink-0">{icon}</div>
            <div className="ml-3">
                <h3 className={`text-sm font-medium text-${colorClass}-800`}>{title}</h3>
                <div className={`mt-2 text-sm text-${colorClass}-700`}>{children}</div>
            </div>
        </div>
    </div>
);

const AccountVerificationPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const notification = useNotification();

    const [verificationData, setVerificationData] = useState({ code: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [errors, setErrors] = useState({});
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (user?.accountVerified) navigate(ROUTES.PROFILE);
    }, [user, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendCode = async () => {
        setIsSendingCode(true);
        setErrors({});
        try {
            await verificationService.sendVerificationCode();
            setCodeSent(true);
            setCountdown(60);
            notification.showSuccess('Success', 'Verification code has been sent to your email!');
        } catch (error) {
            console.error(error);
            notification.showError('Error', error.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        const code = verificationData.code.trim();
        if (!code) return setErrors({ code: 'Please enter the verification code' });
        if (code.length !== 6) return setErrors({ code: 'Verification code must be 6 digits' });

        setIsLoading(true);
        setErrors({});
        try {
            await verificationService.verify({ code });
            updateUser({ accountVerified: true });
            notification.showSuccess('Success', 'Your account has been verified.');
            setTimeout(() => navigate(ROUTES.PROFILE), 2000);
        } catch (error) {
            const msg = error.response?.data?.message;
            if (msg?.toLowerCase().includes('code') || msg?.toLowerCase().includes('invalid') || msg?.toLowerCase().includes('expired')) {
                setErrors({ code: msg });
            } else {
                notification.showError('Error', msg || 'Verification Failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setVerificationData({ code: value });
        if (errors.code) setErrors({ ...errors, code: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                        <SuccessIcon />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-text-primary">Verify Your Account</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        {!codeSent ? 'Send a verification code to your email address to verify your account' : `We've sent a 6-digit code to ${user?.email}`}
                    </p>
                </div>

                <StatusAlert title="Account Not Verified" colorClass="yellow" icon={<WarningIcon />}>
                    Your account is not verified yet. Please verify your email address to access all features.
                </StatusAlert>

                {!codeSent ? (
                    <div className="space-y-6 text-center">
                        <p className="text-sm text-text-secondary mb-4">Click the button below to send a verification code:</p>
                        <p className="text-lg font-medium text-text-primary mb-6">{user?.email}</p>
                        <VerificationButton onClick={handleSendCode} isLoading={isSendingCode} disabled={isSendingCode}>
                            Send Verification Code
                        </VerificationButton>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
                        <div className="space-y-4">
                            <AuthInput
                                label="Verification Code"
                                type="text"
                                name="verificationCode"
                                value={verificationData.code}
                                onChange={handleInputChange}
                                placeholder="Enter 6-digit code"
                                error={errors.code}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                required
                            />
                            <div className="text-center text-sm text-text-secondary">
                                <p>Didn't receive the code?</p>
                                <ResendButton onClick={handleSendCode} countdown={countdown} isSending={isSendingCode} />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <VerificationButton type="submit" isLoading={isLoading} disabled={isLoading || verificationData.code.length !== 6}>
                                Verify Account
                            </VerificationButton>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.PROFILE)}
                                className="flex-1 py-2 px-4 border border-header-border rounded-md shadow-sm text-sm font-medium text-text-secondary bg-white hover:bg-app-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-center">
                    <p className="text-xs text-text-muted">
                        The verification code will expire in 10 minutes. If you're having trouble,{' '}
                        <button
                            onClick={() => navigate(ROUTES.PROFILE)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            return to your profile
                        </button>{' '}and try again later.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountVerificationPage;
