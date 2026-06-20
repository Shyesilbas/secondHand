import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight as ArrowRightIcon, Calendar as CalendarIcon, Phone as PhoneIcon } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuth } from '../AuthContext.jsx';
import { authService } from '../services/authService.js';
import { useGenderEnum } from '../../common/hooks/useGenderEnum.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
const OAuthCompletePage = () => {
  const {
    t
  } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const {
    genders,
    isLoading: gendersLoading
  } = useGenderEnum();
  const [form, setForm] = useState({
    phone: '',
    gender: '',
    birthdate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const baseInfo = useMemo(() => ({
    email: params.get('email') || '',
    name: params.get('name') || '',
    surname: params.get('surname') || '',
    picture: params.get('picture') || ''
  }), [params]);
  const initials = [baseInfo.name?.[0], baseInfo.surname?.[0]].filter(Boolean).join('').toUpperCase();
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };
  const validate = () => {
    const next = {};
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.gender) next.gender = 'Gender is required';
    if (!form.birthdate.trim()) next.birthdate = 'Birth date is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    if (!baseInfo.email) {
      setErrors({
        submit: 'Missing email from OAuth provider.'
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: baseInfo.name,
        surname: baseInfo.surname,
        email: baseInfo.email,
        phoneNumber: form.phone,
        gender: form.gender,
        birthdate: form.birthdate
      };
      const loginResponse = await authService.completeOAuth(payload);
      await login(loginResponse);
      navigate(ROUTES.DASHBOARD, {
        replace: true
      });
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="flex flex-col gap-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-primary shadow-sm flex items-center justify-center shrink-0">
                    <span className="text-primary-content text-base font-bold leading-none">{t("s")}</span>
                </div>
                <span className="text-lg font-bold text-text-primary tracking-tight">{t("secondhand")}</span>
            </div>

            {/* User avatar + header */}
            <div className="flex items-center gap-4 mb-6">
                {baseInfo.picture ? <img src={baseInfo.picture} alt={baseInfo.name} className="w-12 h-12 rounded-full object-cover border-2 border-border-light" /> : <div className="w-12 h-12 rounded-full bg-status-warning-bg border-2 border-status-warning-border flex items-center justify-center shrink-0">
                        <span className="text-status-warning font-bold text-sm">{initials || '?'}</span>
                    </div>}
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("almost_there")}{baseInfo.name}!
                    </h1>
                    <p className="mt-0.5 text-sm text-text-secondary">{t("just_a_few_more_details_to_complete_your")}</p>
                </div>
            </div>

            {/* Error banner */}
            {errors.submit && <div className="mb-4 rounded-xl bg-status-error-bg border border-status-error-border px-4 py-3 text-sm text-status-error">
                    {errors.submit}
                </div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-caption font-semibold text-text-muted uppercase tracking-widest">{t("missing_information")}</p>

                {/* Read-only prefilled fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">{t("first_name")}</label>
                        <div className="px-3 py-2.5 rounded-xl bg-background-secondary border border-border-light text-sm text-text-secondary">
                            {baseInfo.name || '—'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-text-muted">{t("last_name")}</label>
                        <div className="px-3 py-2.5 rounded-xl bg-background-secondary border border-border-light text-sm text-text-secondary">
                            {baseInfo.surname || '—'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-muted">{t("email")}</label>
                    <div className="px-3 py-2.5 rounded-xl bg-background-secondary border border-border-light text-sm text-text-secondary">
                        {baseInfo.email || '—'}
                    </div>
                </div>

                <div className="border-t border-border-light pt-4 flex flex-col gap-4">
                    <AuthInput label={t("phone")} type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={t("90_5xx_xxx_xx_xx")} required error={errors.phone} leftIcon={<PhoneIcon className="h-4 w-4" />} inputClassName="rounded-xl" labelClassName="text-text-secondary text-xs" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-secondary">{t("gender")}<span className="text-status-error">*</span>
                            </label>
                            {gendersLoading ? <div className="flex items-center gap-2 px-3 py-2.5 border border-border-light rounded-xl text-sm text-text-secondary">
                                    <LoadingIndicator size="h-4 w-4" />
                                    <span>{t("loading")}</span>
                                </div> : <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-3 py-2.5 border border-border-light rounded-xl text-sm text-text-primary bg-background-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" required>
                                    <option value="">{t("select_gender")}</option>
                                    {genders.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>}
                            {errors.gender && <p className="text-xs text-status-error">{errors.gender}</p>}
                        </div>

                        <AuthInput label={t("birth_date")} name="birthdate" value={form.birthdate} onChange={handleChange} placeholder={t("dd_mm_yyyy")} required error={errors.birthdate} leftIcon={<CalendarIcon className="h-4 w-4" />} inputClassName="rounded-xl" labelClassName="text-text-secondary text-xs" />
                    </div>
                </div>

                <AuthButton type="submit" isLoading={submitting} size="lg" className="rounded-xl mt-1" rightIcon={!submitting ? <ArrowRightIcon className="h-4 w-4" /> : null}>
                    {submitting ? 'Saving...' : 'Save and Continue'}
                </AuthButton>
            </form>
        </div>;
};
export default OAuthCompletePage;