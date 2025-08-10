import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        userType: 'BUYER'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();

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

        if (!formData.name.trim()) {
            newErrors.name = 'Ad gereklidir';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Ad en az 2 karakter olmalıdır';
        }

        if (!formData.surname.trim()) {
            newErrors.surname = 'Soyad gereklidir';
        } else if (formData.surname.trim().length < 2) {
            newErrors.surname = 'Soyad en az 2 karakter olmalıdır';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefon numarası gereklidir';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Geçerli bir telefon numarası giriniz';
        }

        if (!formData.password) {
            newErrors.password = 'Şifre gereklidir';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Şifre en az 8 karakter olmalıdır';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler uyuşmuyor';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const registerData = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                email: formData.email.trim(),
                password: formData.password,
                phone: formData.phone.replace(/\s/g, ''),
                userType: formData.userType
            };

            await authService.register(registerData);
            setSuccess(true);
            showSuccess('Registration successful! Redirecting to login page...');

            setTimeout(() => {
                navigate(ROUTES.LOGIN, {
                    state: { message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' }
                });
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            
            const errorMessage = error.response?.data?.message || 'Registration failed';
            
            // Check for specific error types
            if (error.response?.status === 400) {
                // Bad request - validation errors, duplicate email, etc.
                if (errorMessage.toLowerCase().includes('email') && 
                    errorMessage.toLowerCase().includes('already')) {
                    showError('This email address is already registered. Please use a different email or try logging in.');
                } else if (errorMessage.toLowerCase().includes('validation') ||
                          errorMessage.toLowerCase().includes('invalid')) {
                    showError(errorMessage);
                } else {
                    showError('Please check your information and try again.');
                }
            } else if (error.response?.status === 409) {
                // Conflict - duplicate user
                showError('An account with this email already exists. Please use a different email or try logging in.');
            } else if (error.response?.status >= 500) {
                // Server errors
                showError('Server error occurred. Please try again later.');
            } else {
                // Other errors or network issues
                showError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Kayıt Başarılı!
                </h2>
                <p className="text-gray-600 mb-4">
                    Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Hesap Oluşturun
                </h2>
                <p className="text-gray-600">
                    SecondHand topluluğuna katılın
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Surname Row */}
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput
                        label="Ad"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Adınız"
                        error={errors.name}
                        required
                    />
                    <AuthInput
                        label="Soyad"
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        placeholder="Soyadınız"
                        error={errors.surname}
                        required
                    />
                </div>

                {/* Email */}
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

                {/* Phone */}
                <AuthInput
                    label="Telefon Numarası"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0555 123 45 67"
                    error={errors.phone}
                    required
                />

                {/* User Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hesap Türü
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="userType"
                                value="BUYER"
                                checked={formData.userType === 'BUYER'}
                                onChange={handleChange}
                                className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                Alıcı
              </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="radio"
                                name="userType"
                                value="SELLER"
                                checked={formData.userType === 'SELLER'}
                                onChange={handleChange}
                                className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                Satıcı
              </span>
                        </label>
                    </div>
                </div>

                {/* Password */}
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

                {/* Confirm Password */}
                <div className="relative">
                    <AuthInput
                        label="Şifre Tekrarı"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        error={errors.confirmPassword}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
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
                    {isLoading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
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

                {/* Login Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Zaten hesabınız var mı?{' '}
                        <Link
                            to={ROUTES.LOGIN}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Giriş yapın
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;