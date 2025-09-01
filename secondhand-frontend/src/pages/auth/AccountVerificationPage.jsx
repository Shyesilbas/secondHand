import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { verificationService } from '../../features/auth/services/verificationService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';

const AccountVerificationPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const notification = useNotification();
    
    const [verificationData, setVerificationData] = useState({
        code: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [errors, setErrors] = useState({});
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Redirect if already verified
    useEffect(() => {
        if (user?.accountVerified) {
            navigate(ROUTES.PROFILE);
        }
    }, [user, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendCode = async () => {
        setIsSendingCode(true);
        setErrors({});

        try {
            await verificationService.sendVerificationCode();
            setCodeSent(true);
            setCountdown(60); // 60 seconds cooldown
            notification.showSuccess('Success', 'Verification code has been sent to your built in Email!');
        } catch (error) {
            console.error('Send verification code error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to send verification code. Please try again.';
            notification.showError('Error', errorMessage);
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();

        // Validation
        if (!verificationData.code.trim()) {
            setErrors({ code: 'Please enter the verification code' });
            return;
        }

        if (verificationData.code.length !== 6) {
            setErrors({ code: 'Verification code must be 6 digits' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await verificationService.verify(verificationData);
            
            updateUser({ accountVerified: true });
            
            notification.showSuccess('Success', 'Your .');
            
            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate(ROUTES.PROFILE);
            }, 2000);

        } catch (error) {
            console.error('Verify account error:', error);
            
            if (error.response?.data?.message) {
                if (error.response.data.message.toLowerCase().includes('code') ||
                    error.response.data.message.toLowerCase().includes('invalid') ||
                    error.response.data.message.toLowerCase().includes('expired')) {
                    setErrors({ code: error.response.data.message });
                } else {
                    notification.showError('Error', error.response.data.message);
                }
            } else {
                notification.showError('Error', 'Verification Failed. Please check your code again');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
        setVerificationData(prev => ({
            ...prev,
            code: value
        }));
        
        // Clear errors when user types
        if (errors.code) {
            setErrors({ ...errors, code: '' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Verify Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {!codeSent 
                            ? 'Send a verification code to your email address to verify your account'
                            : `We've sent a 6-digit code to ${user?.email}`
                        }
                    </p>
                </div>

                {/* Account Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Account Not Verified
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Your account is not verified yet. Please verify your email address to access all features.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {!codeSent ? (
                    /* Send Code Section */
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Click the button below to send a verification code to your email address:
                            </p>
                            <p className="text-lg font-medium text-gray-900 mb-6">
                                {user?.email}
                            </p>
                            <AuthButton
                                onClick={handleSendCode}
                                isLoading={isSendingCode}
                                disabled={isSendingCode}
                                className="w-full"
                            >
                                {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
                            </AuthButton>
                        </div>
                    </div>
                ) : (
                    /* Verify Code Section */
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
                            
                            <div className="text-center text-sm text-gray-600">
                                <p>Didn't receive the code?</p>
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={countdown > 0 || isSendingCode}
                                    className={`mt-1 font-medium ${
                                        countdown > 0 || isSendingCode
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-blue-600 hover:text-blue-500'
                                    }`}
                                >
                                    {countdown > 0 
                                        ? `Resend in ${countdown}s`
                                        : isSendingCode 
                                            ? 'Sending...'
                                            : 'Send Again'
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <AuthButton
                                type="submit"
                                isLoading={isLoading}
                                disabled={isLoading || verificationData.code.length !== 6}
                                className="flex-1"
                            >
                                {isLoading ? 'Verifying...' : 'Verify Account'}
                            </AuthButton>
                            
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.PROFILE)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        The verification code will expire in 10 minutes. If you're having trouble,{' '}
                        <button
                            onClick={() => navigate(ROUTES.PROFILE)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            return to your profile
                        </button>
                        {' '}and try again later.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountVerificationPage;