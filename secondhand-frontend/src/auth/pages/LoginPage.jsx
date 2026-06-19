import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { authService } from '../services/authService.js';
import { ROUTES } from '../../common/constants/routes.js';
import { API_BASE_URL } from '../../common/constants/apiEndpoints.js';
import { ArrowRight as ArrowRightIcon, Eye as EyeIcon, EyeOff as EyeSlashIcon, Lock as LockClosedIcon, Mail as EnvelopeIcon } from 'lucide-react';
import { LoginRequestDTO } from '../auth.js';
import logger from '../../common/utils/logger.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
const LoginPage = () => {
  const {
    t
  } = useTranslation();
  const [formData, setFormData] = useState({
    ...LoginRequestDTO
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    login
  } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.HOME;
  const successMessage = location.state?.message;
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password, formData.rememberMe);
      await login(response);
      notification.showSuccess('Welcome Back!', 'You have successfully logged in.', {
        autoCloseDelay: 1000
      });
      setTimeout(() => navigate(from, {
        replace: true
      }), 1000);
    } catch (error) {
      logger.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      notification.showError('Login Failed', message, {
        autoClose: false
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="flex flex-col gap-1 w-full">
            {/* Logo Monogram */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shrink-0">
                    <span className="text-amber-400 text-xs font-semibold leading-none">{t("s")}</span>
                </div>
                <span className="text-sm font-semibold text-stone-900 tracking-tight">{t("secondhand")}</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-normal text-stone-900 tracking-tight leading-tight">{t("welcome_back")}</h1>
                <p className="mt-2 text-sm text-stone-500 font-normal">{t("sign_in_to_continue_to_your_curated_spac")}</p>
            </div>

            {/* Success message from redirect */}
            {successMessage && <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-700 leading-normal flex items-start gap-2 animate-fade-in">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <AuthInput label={t("email_address")} type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t("name_example_com")} required error={errors.email} leftIcon={<EnvelopeIcon className="h-4 w-4" />} autoComplete="email" />

                <AuthInput label={t("password")} type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required error={errors.password} leftIcon={<LockClosedIcon className="h-4 w-4" />} rightElement={<button type="button" className="text-stone-400 hover:text-stone-700 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeSlashIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                        </button>} autoComplete="current-password" />

                {/* Remember me & Forgot */}
                <div className="flex items-center justify-between mt-1 mb-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                        <input id="remember-me" name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900/5 focus:ring-offset-0 transition-all" />
                        <span className="text-xs text-stone-500 group-hover:text-stone-850 transition-colors">{t("remember_me")}</span>
                    </label>
                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-normal text-stone-500 hover:text-stone-900 transition-colors underline underline-offset-4 decoration-stone-200 hover:decoration-stone-900">{t("forgot_password")}</Link>
                </div>

                {/* Submit */}
                <AuthButton type="submit" isLoading={isLoading} size="lg" rightIcon={!isLoading ? <ArrowRightIcon className="h-4 w-4" /> : null}>{t("sign_in")}</AuthButton>

                {/* Silent Divider */}
                <div className="relative flex items-center my-2">
                    <div className="flex-1 border-t border-stone-200/50"></div>
                    <span className="px-3 text-[10px] tracking-[0.2em] text-stone-400 uppercase font-medium">{t("or_continue_with")}</span>
                    <div className="flex-1 border-t border-stone-200/50"></div>
                </div>

                {/* Google SSO */}
                <a href={`${API_BASE_URL}/auth/oauth2/google`} className="w-full inline-flex items-center justify-center gap-3 py-3 border border-stone-200 hover:border-stone-300 rounded-xl bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.985] transition-all duration-300">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4" />
                        <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853" />
                        <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05" />
                        <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335" />
                    </svg>{t("continue_with_google")}</a>

                {/* Switch link */}
                <p className="text-center text-xs text-stone-500 mt-4">{t("don_t_have_an_account")}{' '}
                    <Link to={ROUTES.REGISTER} className="font-semibold text-stone-900 hover:underline underline-offset-4 transition-colors">{t("create_one")}</Link>
                </p>
            </form>
        </div>;
};
export default LoginPage;