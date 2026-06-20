import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { ROUTES } from '../../common/constants/routes.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import { ForgotPasswordRequestDTO } from '../auth.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { Mail as EnvelopeIcon, Key as KeyIcon, Lock as LockClosedIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
const ForgotPasswordPage = () => {
  const {
    t
  } = useTranslation();
  const [formData, setFormData] = useState({
    ...ForgotPasswordRequestDTO
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resetForm, setResetForm] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const notification = useNotification();
  const handleSubmit = async e => {
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
      setResetForm(prev => ({
        ...prev,
        email: formData.email,
        verificationCode: res?.verificationCode || ''
      }));
      setSuccess(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  if (success) {
    return <div className="flex flex-col w-full animate-fade-in">
                {/* Logo Monogram */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-primary shadow-sm flex items-center justify-center shrink-0">
                        <span className="text-primary-content text-xs font-semibold leading-none">{t("s")}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary tracking-tight">{t("secondhand")}</span>
                </div>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-background-secondary rounded-full flex items-center justify-center text-text-primary">
                        <EnvelopeIcon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("check_verification_code")}</h2>
                    <p className="mt-2 text-xs text-text-secondary font-normal max-w-xs mx-auto leading-relaxed">{t("a_verification_code_has_been_generated_u")}</p>
                </div>

                {verificationCode && <div className="mb-6 p-4 rounded-xl border border-border-light bg-background-secondary text-center">
                        <div className="text-caption tracking-wider font-semibold text-text-muted uppercase mb-1">{t("developer_environment_code")}</div>
                        <div className="text-2xl font-mono tracking-widest font-semibold text-text-primary">{verificationCode}</div>
                    </div>}

                <form onSubmit={async e => {
        e.preventDefault();
        if (!resetForm.newPassword || resetForm.newPassword !== resetForm.confirmPassword) {
          return setError('Passwords do not match');
        }
        setIsLoading(true);
        try {
          await authService.resetPassword({
            email: resetForm.email,
            verificationCode: resetForm.verificationCode,
            newPassword: resetForm.newPassword,
            confirmPassword: resetForm.confirmPassword
          });
          setError('');
          notification.showSuccess('Success', 'Your password has been updated. Redirecting to login page...', {
            autoCloseDelay: 1200
          });
          setTimeout(() => {
            window.location.href = ROUTES.LOGIN;
          }, 1200);
        } catch (err) {
          setError(err.response?.data?.message || 'Password reset failed');
        } finally {
          setIsLoading(false);
        }
      }} className="flex flex-col gap-4 text-left">
                    <AuthInput label={t("email_address")} value={resetForm.email} onChange={e => setResetForm({
          ...resetForm,
          email: e.target.value
        })} required leftIcon={<EnvelopeIcon className="w-4 h-4" />} />
                    <AuthInput label={t("verification_code")} value={resetForm.verificationCode} onChange={e => setResetForm({
          ...resetForm,
          verificationCode: e.target.value
        })} required leftIcon={<KeyIcon className="w-4 h-4" />} />
                    <AuthInput label={t("new_password")} type="password" value={resetForm.newPassword} onChange={e => setResetForm({
          ...resetForm,
          newPassword: e.target.value
        })} required leftIcon={<LockClosedIcon className="w-4 h-4" />} />
                    <AuthInput label={t("confirm_new_password")} type="password" value={resetForm.confirmPassword} onChange={e => setResetForm({
          ...resetForm,
          confirmPassword: e.target.value
        })} required leftIcon={<LockClosedIcon className="w-4 h-4" />} />

                    {error && <div className="p-3.5 rounded-xl bg-status-error-bg border border-status-error-border text-xs text-status-error">
                            {error}
                        </div>}

                    <AuthButton type="submit" isLoading={isLoading} className="mt-2">{t("save_new_password")}</AuthButton>
                </form>

                <div className="text-center mt-6">
                    <Link to={ROUTES.LOGIN} className="inline-flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t("back_to_login")}</span>
                    </Link>
                </div>
            </div>;
  }
  return <div className="flex flex-col w-full animate-fade-in">
            {/* Logo Monogram */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary shadow-sm flex items-center justify-center shrink-0">
                    <span className="text-primary-content text-xs font-semibold leading-none">{t("s")}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary tracking-tight">{t("secondhand")}</span>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("recover_password")}</h1>
                <p className="mt-2 text-sm text-text-secondary font-normal">{t("enter_your_email_and_we_ll_start_your_re")}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <AuthInput label={t("email_address")} type="email" value={formData.email} onChange={e => setFormData(prev => ({
        ...prev,
        email: e.target.value
      }))} placeholder={t("name_example_com")} error={error} required leftIcon={<EnvelopeIcon className="w-4 h-4" />} />

                <AuthButton type="submit" isLoading={isLoading} className="mt-2">{t("send_recovery_code")}</AuthButton>

                <div className="text-center mt-4">
                    <Link to={ROUTES.LOGIN} className="inline-flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t("back_to_login")}</span>
                    </Link>
                </div>
            </form>
        </div>;
};
export default ForgotPasswordPage;