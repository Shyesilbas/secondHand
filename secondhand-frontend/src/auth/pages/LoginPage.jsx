import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { authService } from '../services/authService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { API_BASE_URL } from '../../common/constants/apiEndpoints.js';
import {
    ArrowRight as ArrowRightIcon,
    Eye as EyeIcon,
    EyeOff as EyeSlashIcon,
    Lock as LockClosedIcon,
    Mail as EnvelopeIcon,
} from 'lucide-react';
import { LoginRequestDTO } from '../auth.js';
import logger from '../../common/utils/logger.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';

const LoginPage = () => {
    const [formData, setFormData] = useState({ ...LoginRequestDTO });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const notification = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || ROUTES.HOME;

    const successMessage = location.state?.message;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.login(formData.email, formData.password, formData.rememberMe);
            await login(response);
            notification.showSuccess('Welcome Back!', 'You have successfully logged in.', { autoCloseDelay: 1000 });
            setTimeout(() => navigate(from, { replace: true }), 1000);
        } catch (error) {
            logger.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
            notification.showError('Login Failed', message, { autoClose: false });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-secondary-900 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-base font-bold leading-none">S</span>
                </div>
                <span className="text-lg font-bold text-secondary-900 tracking-tight">SecondHand</span>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Welcome Back</h1>
                <p className="mt-1 text-sm text-secondary-500">Sign in to continue to your account.</p>
            </div>

            {/* Success message from register redirect */}
            {successMessage && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AuthInput
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    error={errors.email}
                    leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                    inputClassName="rounded-xl"
                    labelClassName="text-secondary-700 text-xs"
                    autoComplete="email"
                />

                <AuthInput
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={errors.password}
                    leftIcon={<LockClosedIcon className="h-4 w-4" />}
                    rightElement={(
                        <button
                            type="button"
                            className="text-secondary-400 hover:text-secondary-700 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword
                                ? <EyeSlashIcon className="h-4 w-4" />
                                : <EyeIcon className="h-4 w-4" />}
                        </button>
                    )}
                    inputClassName="rounded-xl"
                    labelClassName="text-secondary-700 text-xs"
                    autoComplete="current-password"
                />

                {/* Remember me + Forgot */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            id="remember-me"
                            name="rememberMe"
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                            className="h-3.5 w-3.5 rounded border-secondary-300 text-secondary-900 focus:ring-secondary-500"
                        />
                        <span className="text-xs text-secondary-600">Remember me</span>
                    </label>
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="text-xs font-medium text-secondary-600 hover:text-indigo-600 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Submit */}
                <AuthButton
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    className="rounded-xl mt-1"
                    rightIcon={!isLoading ? <ArrowRightIcon className="h-4 w-4" /> : null}
                >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </AuthButton>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                    <div className="flex-1 border-t border-secondary-200" />
                    <span className="text-[11px] text-secondary-400 shrink-0 uppercase tracking-widest">OR CONTINUE WITH</span>
                    <div className="flex-1 border-t border-secondary-200" />
                </div>

                {/* Google */}
                <a
                    href={`${API_BASE_URL}/auth/oauth2/google`}
                    className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 border border-secondary-200 rounded-xl bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                        <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                        <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                        <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </a>

                {/* Sign up link */}
                <p className="text-center text-sm text-secondary-500">
                    Don&apos;t have an account?{' '}
                    <Link
                        to={ROUTES.REGISTER}
                        className="font-semibold text-secondary-900 hover:text-indigo-600 transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
