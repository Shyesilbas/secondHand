import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight as ArrowRightIcon, Calendar as CalendarIcon, Eye as EyeIcon, EyeOff as EyeSlashIcon, Lock as LockClosedIcon, Mail as EnvelopeIcon, Phone as PhoneIcon, User as UserIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { API_BASE_URL } from '../../common/constants/apiEndpoints.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import AgreementsSection from '../../agreements/components/AgreementsSection.jsx';
export const RegisterForm = ({
  formData,
  errors: parentErrors,
  isLoading,
  genderOptions,
  gendersLoading,
  handleChange,
  onSubmit,
  agreements,
  agreementsLoading,
  acceptedAgreements,
  onToggleAgreement,
  onReadAgreement
}) => {
  const {
    t
  } = useTranslation();
  const [step, setStep] = useState(1);
  const [localErrors, setLocalErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Merge parent errors and local step errors
  const errors = {
    ...parentErrors,
    ...localErrors
  };
  const validateStep1 = () => {
    const step1Errors = {};
    if (!formData.email.trim()) {
      step1Errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      step1Errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      step1Errors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      step1Errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      step1Errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      step1Errors.confirmPassword = 'Passwords do not match';
    }
    setLocalErrors(step1Errors);
    return Object.keys(step1Errors).length === 0;
  };
  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  const handlePrevStep = () => {
    setStep(1);
  };
  return <div className="flex flex-col gap-1 w-full animate-fade-in">
            {/* Header / Stepper Progress */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-stone-400 uppercase">{t("step")}{step}{t("of_2")}</span>
                    <div className="flex gap-1.5 items-center flex-1 max-w-[100px]">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-stone-900' : 'bg-stone-200'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-stone-900' : 'bg-stone-200'}`} />
                    </div>
                </div>
                <h1 className="text-3xl font-normal text-stone-900 tracking-tight leading-tight">{t("create_account")}</h1>
                <p className="mt-2.5 text-sm text-stone-500 font-normal leading-relaxed">
                    {step === 1 ? 'Set up your credentials and secure your digital space.' : 'Tell us a bit about yourself to complete registration.'}
                </p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                {step === 1 && <div className="flex flex-col gap-6 animate-slide-right">
                        <AuthInput label={t("email_address")} type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t("name_example_com")} required error={errors.email} leftIcon={<EnvelopeIcon className="h-4 w-4" />} autoComplete="email" />

                        <AuthInput label={t("phone_number")} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t("90_5xx_xxx_xx_xx")} required error={errors.phone} leftIcon={<PhoneIcon className="h-4 w-4" />} autoComplete="tel" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AuthInput label={t("password")} type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required error={errors.password} leftIcon={<LockClosedIcon className="h-4 w-4" />} rightElement={<button type="button" className="text-stone-400 hover:text-stone-700 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeSlashIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                                    </button>} />
                            <AuthInput label={t("confirm_password")} type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required error={errors.confirmPassword} leftIcon={<LockClosedIcon className="h-4 w-4" />} rightElement={<button type="button" className="text-stone-400 hover:text-stone-700 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeSlashIcon className="h-4.5 w-4.5" /> : <EyeIcon className="h-4.5 w-4.5" />}
                                    </button>} />
                        </div>

                        <AuthButton type="button" onClick={handleNextStep} size="lg" className="mt-3" rightIcon={<ArrowRightIcon className="h-4 w-4" />}>{t("continue")}</AuthButton>
                    </div>}

                {step === 2 && <div className="flex flex-col gap-6 animate-slide-left">
                        {/* First & Last Name side-by-side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <AuthInput label={t("first_name")} name="name" value={formData.name} onChange={handleChange} placeholder={t("john")} required error={errors.name} leftIcon={<UserIcon className="h-4 w-4" />} />
                            <AuthInput label={t("last_name")} name="surname" value={formData.surname} onChange={handleChange} placeholder={t("doe")} required error={errors.surname} leftIcon={<UserIcon className="h-4 w-4" />} />
                        </div>

                        {/* Birth Date full width */}
                        <AuthInput label={t("birth_date")} name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder={t("dd_mm_yyyy")} required error={errors.birthdate} leftIcon={<CalendarIcon className="h-4 w-4" />} />

                        {/* Gender selection full width */}
                        <div className="flex flex-col gap-2.5">
                            <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-stone-500">{t("gender")}<span className="text-red-400 font-normal">*</span>
                            </label>
                            {gendersLoading ? <div className="flex items-center justify-center py-3.5 px-4 border border-stone-200/50 rounded-xl bg-stone-50/30">
                                    <LoadingIndicator size="h-4 w-4" />
                                </div> : <div className="flex gap-2.5">
                                    {genderOptions.map(g => <button key={g.value} type="button" onClick={() => handleChange({
              target: {
                name: 'gender',
                value: g.value
              }
            })} className={`flex-1 py-3 px-5 rounded-xl border text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 ${formData.gender === g.value ? 'border-stone-900 bg-stone-900 text-white shadow-sm' : 'border-stone-200 bg-stone-100/40 text-stone-500 hover:bg-stone-200/50 hover:text-stone-700'}`}>
                                            {g.label}
                                        </button>)}
                                </div>}
                            {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender}</p>}
                        </div>

                        {/* Agreements */}
                        {agreementsLoading && <div className="flex items-center gap-2.5 py-3 text-xs text-stone-500">
                                <LoadingIndicator size="h-3.5 w-3.5" />
                                <span>{t("loading_legal_agreements")}</span>
                            </div>}
                        {!agreementsLoading && <div className="rounded-xl border border-stone-200/50 bg-[#faf9f7]/50 p-5">
                                <AgreementsSection agreements={agreements} acceptedAgreements={acceptedAgreements} onToggle={onToggleAgreement} onRead={onReadAgreement} error={errors.agreements} />
                            </div>}

                        {errors.submit && <div className="rounded-xl bg-rose-50/50 border border-rose-100 p-4 text-xs text-rose-600">
                                {errors.submit}
                            </div>}

                        {/* Navigation / Actions */}
                        <div className="flex gap-4 mt-3">
                            <AuthButton type="button" variant="secondary" onClick={handlePrevStep} className="flex-1" leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>{t("back")}</AuthButton>
                            <AuthButton type="submit" isLoading={isLoading} className="flex-[2]" rightIcon={!isLoading ? <ArrowRightIcon className="h-4 w-4" /> : null}>{t("create_account")}</AuthButton>
                        </div>
                    </div>}

                {/* Silent Divider */}
                <div className="relative flex items-center my-3">
                    <div className="flex-1 border-t border-stone-200/50"></div>
                    <span className="px-3 text-[10px] tracking-[0.2em] text-stone-400 uppercase font-medium">{t("or_continue_with")}</span>
                    <div className="flex-1 border-t border-stone-200/50"></div>
                </div>

                {/* Google SSO */}
                <a href={`${API_BASE_URL}/auth/oauth2/google`} className="w-full inline-flex items-center justify-center gap-3 py-3.5 border border-stone-200 hover:border-stone-300 rounded-xl bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.985] transition-all duration-300">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4" />
                        <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853" />
                        <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05" />
                        <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335" />
                    </svg>{t("continue_with_google")}</a>

                {/* Sign in link */}
                <p className="text-center text-xs text-stone-500 mt-4">{t("already_have_an_account")}{' '}
                    <Link to={ROUTES.LOGIN} className="font-semibold text-stone-900 hover:underline underline-offset-4 transition-colors">{t("sign_in")}</Link>
                </p>
            </form>
        </div>;
};