import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from '../../features/auth/services/passwordService';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&.]/.test(password);

        return {
            minLength,
            hasLowercase,
            hasUppercase,
            hasNumber,
            hasSpecialChar,
            isValid: minLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar
        };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear success message
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Current password validation
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Mevcut şifrenizi girin';
        }

        // New password validation
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'Yeni şifrenizi girin';
        } else {
            const passwordValidation = validatePassword(formData.newPassword);
            if (!passwordValidation.isValid) {
                newErrors.newPassword = 'Şifre gereksinimleri karşılanmıyor';
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Yeni şifrenizi tekrar girin';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }

        // Same password check
        if (formData.currentPassword === formData.newPassword && formData.newPassword.trim()) {
            newErrors.newPassword = 'Yeni şifre mevcut şifreden farklı olmalıdır';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await passwordService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccessMessage('Şifreniz başarıyla değiştirildi!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate(ROUTES.PROFILE);
            }, 2000);

        } catch (error) {
            console.error('Password change error:', error);
            
            if (error.response?.data?.message) {
                // Check if it's a current password error
                if (error.response.data.message.toLowerCase().includes('current') || 
                    error.response.data.message.toLowerCase().includes('mevcut') ||
                    error.response.data.message.toLowerCase().includes('wrong') ||
                    error.response.data.message.toLowerCase().includes('yanlış')) {
                    setErrors({ currentPassword: error.response.data.message });
                } else if (error.response.data.message.toLowerCase().includes('password') ||
                          error.response.data.message.toLowerCase().includes('şifre')) {
                    setErrors({ newPassword: error.response.data.message });
                } else {
                    setErrors({ general: error.response.data.message });
                }
            } else {
                setErrors({ general: 'Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.newPassword);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Şifre Değiştir
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Güvenliğiniz için güçlü bir şifre seçin
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {errors.general}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Current Password */}
                        <AuthInput
                            label="Mevcut Şifre"
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Mevcut şifrenizi girin"
                            error={errors.currentPassword}
                            required
                        />

                        {/* New Password */}
                        <AuthInput
                            label="Yeni Şifre"
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Yeni şifrenizi girin"
                            error={errors.newPassword}
                            required
                        />

                        {/* Password Requirements */}
                        {formData.newPassword && (
                            <div className="bg-gray-50 rounded-md p-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Şifre Gereksinimleri:</p>
                                <div className="space-y-1">
                                    <div className={`text-xs flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="mr-2">{passwordValidation.minLength ? '✓' : '✗'}</span>
                                        En az 8 karakter
                                    </div>
                                    <div className={`text-xs flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="mr-2">{passwordValidation.hasLowercase ? '✓' : '✗'}</span>
                                        Küçük harf (a-z)
                                    </div>
                                    <div className={`text-xs flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="mr-2">{passwordValidation.hasUppercase ? '✓' : '✗'}</span>
                                        Büyük harf (A-Z)
                                    </div>
                                    <div className={`text-xs flex items-center ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="mr-2">{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                                        Rakam (0-9)
                                    </div>
                                    <div className={`text-xs flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="mr-2">{passwordValidation.hasSpecialChar ? '✓' : '✗'}</span>
                                        Özel karakter (@$!%*?&.)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirm Password */}
                        <AuthInput
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Yeni şifrenizi tekrar girin"
                            error={errors.confirmPassword}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex space-x-4">
                        <AuthButton
                            type="submit"
                            isLoading={isLoading}
                            disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword}
                            className="flex-1"
                        >
                            {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                        </AuthButton>
                        
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.PROFILE)}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                </form>

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Şifrenizi unuttuysanız,{' '}
                        <button
                            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            şifre sıfırlama
                        </button>
                        {' '}sayfasını kullanabilirsiniz.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;