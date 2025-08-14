import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LoginRequestDTO, LoginResponseDTO } from '../../types/auth';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        ...LoginRequestDTO
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const notification = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || ROUTES.HOME;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password required';
        } else if (formData.password.length < 6) {
            newErrors.password = '';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.login(formData.email, formData.password);
            await login(response);
            
            // Show success notification
            notification.showSuccess(
                'Login Successful',
                'Welcome!',
                { autoCloseDelay: 1000 }
            );
            
            setTimeout(() => {
                navigate(from, { replace: true });
            });
        } catch (error) {
            console.error('Login error:', error);
            
            const { handleErrorWithModal } = await import('../../utils/errorHandler');
            handleErrorWithModal(error, notification, {
                showDetails: process.env.NODE_ENV === 'development', // Show details only in development
                actions: [
                    {
                        label: 'Try Again',
                        onClick: () => {
                            setErrors({});
                            document.querySelector('input[name="email"]')?.focus();
                        },
                        primary: true
                    },
                    {
                        label: 'Forgot Password',
                        onClick: () => {
                            navigate(ROUTES.FORGOT_PASSWORD);
                        },
                        primary: false
                    }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome
                </h2>
                <p className="text-gray-600">
                    Login to your account
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <AuthInput
                    label="E-mail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sample@email.com"
                    error={errors.email}
                    required
                />

                {/* Password Input */}
                <div className="relative">
                    <AuthInput
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.password}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        Forgot Your Password?
                    </Link>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                )}

                {/* Submit Button */}
                <AuthButton
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Login...' : 'Login '}
                </AuthButton>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or</span>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        No Account?{' '}
                        <Link
                            to={ROUTES.REGISTER}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Register NOW
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;