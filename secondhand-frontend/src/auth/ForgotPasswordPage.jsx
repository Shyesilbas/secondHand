import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {authService} from './services/authService.js';
import {ROUTES} from '../common/constants/routes.js';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import {ForgotPasswordRequestDTO} from './auth.js';
import {useNotification} from '../notification/NotificationContext.jsx';

const ForgotPasswordPage = () => {
    const [formData, setFormData] = useState({
        ...ForgotPasswordRequestDTO
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [resetForm, setResetForm] = useState({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const notification = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim()) {
            setError('Email address is required');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await authService.forgotPassword(formData.email);
            if (res?.verificationCode) setVerificationCode(res.verificationCode);
            setResetForm(prev => ({ ...prev, email: formData.email, verificationCode: res?.verificationCode || '' }));
            setSuccess(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Verification Code Generated</h2>
                <p className="text-text-secondary mb-2">Since we are in a development environment, we’re showing the code here.</p>
                {verificationCode && (
                    <div className="mb-4 p-3 border rounded bg-app-bg">
                        <div className="text-sm text-text-secondary">Verification Code</div>
                        <div className="text-xl font-mono tracking-widest">{verificationCode}</div>
                    </div>
                )}
                <p className="text-text-secondary mb-6">You can now set a new password below.</p>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!resetForm.newPassword || resetForm.newPassword !== resetForm.confirmPassword) {
                            return setError('Passwords do not match');
                        }
                        try {
                            await authService.resetPassword({
                                email: resetForm.email,
                                verificationCode: resetForm.verificationCode,
                                newPassword: resetForm.newPassword,
                                confirmPassword: resetForm.confirmPassword,
                            });
                            setError('');
                            notification.showSuccess('Success', 'Your password has been updated. Redirecting to login page...', { autoCloseDelay: 1200 });
                            setTimeout(() => {
                                window.location.href = ROUTES.LOGIN;
                            }, 1200);
                        } catch (err) {
                            setError(err.response?.data?.message || 'Password reset failed');
                        }
                    }}
                    className="space-y-4 text-left"
                >
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Email</label>
                        <input className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.email} onChange={(e)=> setResetForm({...resetForm, email: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Verification Code</label>
                        <input className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.verificationCode} onChange={(e)=> setResetForm({...resetForm, verificationCode: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">New Password</label>
                        <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.newPassword} onChange={(e)=> setResetForm({...resetForm, newPassword: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Confirm New Password</label>
                        <input type="password" className="mt-1 block w-full border rounded px-3 py-2" value={resetForm.confirmPassword} onChange={(e)=> setResetForm({...resetForm, confirmPassword: e.target.value})}/>
                    </div>
                    <AuthButton type="submit" className="w-full">Save New Password</AuthButton>
                </form>
                <Link
                    to={ROUTES.LOGIN}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                    ← Back to login page
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                    Forgot your password?
                </h2>
                <p className="text-text-secondary">
                    Enter your email address and we’ll send you a password reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        email: e.target.value
                    }))}
                    placeholder="example@email.com"
                    error={error}
                    required
                />

                <AuthButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Sending...' : 'Send Password Reset Link'}
                </AuthButton>

                <div className="text-center">
                    <Link
                        to={ROUTES.LOGIN}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        ← Back to login page
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
