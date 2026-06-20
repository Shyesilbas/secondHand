import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { passwordService } from '../services/passwordService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import logger from '../../common/utils/logger.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import { ChangePasswordRequestDTO } from '../auth.js';
import PasswordRequirements from '../components/PasswordRequirements.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
const ChangePasswordPage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const [formData, setFormData] = useState({
    ...ChangePasswordRequestDTO
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const validatePassword = password => ({
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&.]/.test(password),
    isValid: password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[@$!%*?&.]/.test(password)
  });
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
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
  const handleSubmit = async e => {
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
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setTimeout(() => navigate(ROUTES.PROFILE), 1500);
    } catch (error) {
      logger.error(error);
      if (error.response?.data?.message) {
        const msg = error.response.data.message.toLowerCase();
        if (msg.includes('current') || msg.includes('wrong')) setErrors({
          currentPassword: error.response.data.message
        });else if (msg.includes('password')) setErrors({
          newPassword: error.response.data.message
        });else setErrors({
          general: error.response.data.message
        });
      } else {
        notification.showError('Error', 'An error occurred while changing your password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const passwordValidation = validatePassword(formData.newPassword);
  const getPasswordStrength = password => {
    if (!password) return {
      level: 0,
      label: '',
      color: ''
    };
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length - 1;
    if (score <= 2) return {
      level: score,
      label: 'Weak',
      color: 'bg-status-error-bg'
    };
    if (score <= 3) return {
      level: score,
      label: 'Fair',
      color: 'bg-status-warning-bg'
    };
    if (score <= 4) return {
      level: score,
      label: 'Good',
      color: 'bg-primary'
    };
    return {
      level: score,
      label: 'Strong',
      color: 'bg-status-success-bg'
    };
  };
  const passwordStrength = getPasswordStrength(formData.newPassword);
  return <div className="min-h-screen bg-secondary flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-background-primary rounded-lg shadow-sm border border-border-light p-6">
                    <div className="text-center mb-6">
                        <div className="w-10 h-10 bg-background-secondary border border-border-light rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary mb-1">{t("change_password")}</h2>
                        <p className="text-xs text-text-secondary">{t("update_your_account_password")}</p>
                    </div>

                    <Alert type="error" message={errors.general} />

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-3">
                            <AuthInput label={t("current_password")} type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} placeholder={t("enter_current_password")} error={errors.currentPassword} required />
                            
                            <AuthInput label={t("new_password")} type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder={t("enter_new_password")} error={errors.newPassword} required />
                            
                            {formData.newPassword && <div className="space-y-2">
                                    <PasswordRequirements validation={passwordValidation} />
                                    
                                    {passwordStrength.level > 0 && <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-text-secondary">{t("strength")}</span>
                                                <span className={`text-xs font-medium ${passwordStrength.label === 'Weak' ? 'text-status-error' : passwordStrength.label === 'Fair' ? 'text-status-warning' : passwordStrength.label === 'Good' ? 'text-primary' : 'text-status-success'}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-background-tertiary rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{
                    width: `${passwordStrength.level / 5 * 100}%`
                  }}></div>
                                            </div>
                                        </div>}
                                </div>}
                            
                            <AuthInput label={t("confirm_password")} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder={t("confirm_new_password")} error={errors.confirmPassword} required />
                        </div>

                        <div className="space-y-2">
                            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading || !passwordValidation.isValid || formData.newPassword !== formData.confirmPassword || !formData.currentPassword.trim()}>
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </AuthButton>
                            
                            <button type="button" onClick={() => navigate(ROUTES.PROFILE)} className="w-full py-2 px-4 border border-border-light rounded-lg text-sm font-medium text-text-secondary bg-background-primary hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">{t("cancel")}</button>
                        </div>
                    </form>

                    <div className="mt-4 pt-4 border-t border-border-light">
                        <div className="text-center">
                            <button onClick={() => navigate(ROUTES.FORGOT_PASSWORD)} className="text-xs text-text-muted hover:text-text-secondary underline">{t("forgot_your_password")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
};
export default ChangePasswordPage;