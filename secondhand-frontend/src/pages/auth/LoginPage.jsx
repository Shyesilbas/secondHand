import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || ROUTES.HOME;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır';
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
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
            setErrors({ submit: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Hoş Geldiniz
                </h2>
                <p className="text-gray-600">
                    Hesabınıza giriş yapın
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <AuthInput
                    label="E-posta Adresi"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    error={errors.email}
                    required
                />

                {/* Password Input */}
                <div className="relative">
                    <AuthInput
                        label="Şifre"
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
                        Şifrenizi mi unuttunuz?
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
                    {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </AuthButton>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">veya</span>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Hesabınız yok mu?{' '}
                        <Link
                            to={ROUTES.REGISTER}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Hemen kayıt olun
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;