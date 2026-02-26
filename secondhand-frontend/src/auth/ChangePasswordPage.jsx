import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from './services/passwordService.js';
import { ROUTES } from '../common/constants/routes.js';
import { useNotification } from '../notification/NotificationContext.jsx';
import logger from '../common/utils/logger.js';
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
        
        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }
        
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (!validatePassword(formData.newPassword).isValid) {
            newErrors.newPassword = 'Password does not meet security requirements';
        }
        
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (formData.currentPassword === formData.newPassword && formData.newPassword.trim()) {
            newErrors.newPassword = 'New password must be different from current password';
        }
        
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
            notification.showSuccess('Password Updated', 'Your password has been successfully changed!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            setTimeout(() => navigate(ROUTES.PROFILE), 1500);
        } catch (error) {
            logger.error(error);
            if (error.response?.data?.message) {
                const msg = error.response.data.message.toLowerCase();
                if (msg.includes('current') || msg.includes('mevcut') || msg.includes('wrong') || msg.includes('yanlış')) setErrors({ currentPassword: error.response.data.message });
                else if (msg.includes('password') || msg.includes('şifre')) setErrors({ newPassword: error.response.data.message });
                else setErrors({ general: error.response.data.message });
            } else {
                notification.showError('Error', 'An error occurred while changing your password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const passwordValidation = validatePassword(formData.newPassword);
    
    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '' };
        
        const validation = validatePassword(password);
        const score = Object.values(validation).filter(Boolean).length - 1;
        
        if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
        if (score <= 3) return { level: score, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 4) return { level: score, label: 'Good', color: 'bg-blue-500' };
        return { level: score, label: 'Strong', color: 'bg-green-500' };
    };
    
    const passwordStrength = getPasswordStrength(formData.newPassword);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
                        <p className="text-xs text-gray-600">Update your account password</p>
                    </div>

                    <Alert type="error" message={errors.general} />

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <AuthInput 
                                label="Current Password" 
                                type="password" 
                                name="currentPassword" 
                                value={formData.currentPassword} 
                                onChange={handleInputChange} 
                                placeholder="Enter current password" 
                                error={errors.currentPassword} 
                                required 
                            />
                            
                            <AuthInput 
                                label="New Password" 
                                type="password" 
                                name="newPassword" 
                                value={formData.newPassword} 
                                onChange={handleInputChange} 
                                placeholder="Enter new password" 
                                error={errors.newPassword} 
                                required 
                            />
                            
                            {formData.newPassword && (
                                <div className="space-y-2">
                                    <PasswordRequirements validation={passwordValidation} />
                                    
                                    {passwordStrength.level > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-700">Strength:</span>
                                                <span className={`text-xs font-medium ${
                                                    passwordStrength.label === 'Weak' ? 'text-red-600' :
                                                    passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                                                    passwordStrength.label === 'Good' ? 'text-blue-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div 
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                    style={{ width: `${(passwordStrength.level / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <AuthInput 
                                label="Confirm Password" 
                                type="password" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleInputChange} 
                                placeholder="Confirm new password" 
                                error={errors.confirmPassword} 
                                required 
                            />
                        </div>

                        <div className="space-y-2">
                            <AuthButton 
                                type="submit" 
                                isLoading={isLoading} 
                                disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword || !formData.currentPassword.trim()}
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </AuthButton>
                            
                            <button 
                                type="button" 
                                onClick={() => navigate(ROUTES.PROFILE)} 
                                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <button 
                                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} 
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
