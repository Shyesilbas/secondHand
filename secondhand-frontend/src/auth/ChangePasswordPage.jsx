import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from './services/passwordService.js';
import { ROUTES } from '../common/constants/routes.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import { ChangePasswordRequestDTO } from './auth.js';
import PasswordRequirements from './PasswordRequirements.jsx';
import Alert from '../common/Alert.jsx';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [formData, setFormData] = useState({ ...ChangePasswordRequestDTO });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password) => ({
        minLength: password.length >= 8,
        hasLowercase: /[a-z]/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[@$!%*?&.]/.test(password),
        isValid: password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&.]/.test(password)
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.currentPassword.trim()) newErrors.currentPassword = 'Enter your password';
        if (!formData.newPassword.trim()) newErrors.newPassword = 'Enter your new password';
        else if (!validatePassword(formData.newPassword).isValid) newErrors.newPassword = 'Requirements did not meet';
        if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Enter your new password again';
        else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (formData.currentPassword === formData.newPassword && formData.newPassword.trim()) newErrors.newPassword = 'New Password must be different from the current password';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        try {
            await passwordService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            notification.showSuccess('Success', 'Şifre başarıyla değiştirildi!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => navigate(ROUTES.PROFILE), 2000);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                const msg = error.response.data.message.toLowerCase();
                if (msg.includes('current') || msg.includes('mevcut') || msg.includes('wrong') || msg.includes('yanlış')) setErrors({ currentPassword: error.response.data.message });
                else if (msg.includes('password') || msg.includes('şifre')) setErrors({ newPassword: error.response.data.message });
                else setErrors({ general: error.response.data.message });
            } else {
                notification.showError('Hata', 'Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.newPassword);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-semibold text-gray-900">Change Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Please enter a strong password for your account.</p>
                </div>

                <Alert type="error" message={errors.general} />

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <AuthInput label="Current Password" type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder="Enter your current password" error={errors.currentPassword} required />
                        <AuthInput label="New Password" type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="Enter your new password" error={errors.newPassword} required />
                        {formData.newPassword && <PasswordRequirements validation={passwordValidation} />}
                        <AuthInput label="New Password (Again)" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Enter your new password again" error={errors.confirmPassword} required />
                    </div>

                    <div className="flex space-x-4">
                        <AuthButton type="submit" isLoading={isLoading} disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword} className="flex-1">
                            {isLoading ? 'Updating...' : 'Change Password'}
                        </AuthButton>
                        <button type="button" onClick={() => navigate(ROUTES.PROFILE)} className="flex-1 py-2 px-4 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">Cancel</button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        If you forgot your password, you can{' '}
                        <button onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} className="font-medium text-gray-900 hover:text-gray-700">use the forgot password form</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
