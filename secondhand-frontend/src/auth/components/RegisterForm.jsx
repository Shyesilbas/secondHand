import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight as ArrowRightIcon,
    Calendar as CalendarIcon,
    Eye as EyeIcon,
    EyeOff as EyeSlashIcon,
    Lock as LockClosedIcon,
    Mail as EnvelopeIcon,
    Phone as PhoneIcon,
    User as UserIcon
} from 'lucide-react';
import { ROUTES } from '../../common/constants/routes.js';
import { API_BASE_URL } from '../../common/constants/apiEndpoints.js';
import AuthInput from '../../common/components/ui/AuthInput.jsx';
import AuthButton from '../../common/components/ui/AuthButton.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import AgreementsSection from '../../agreements/components/AgreementsSection.jsx';

export const RegisterForm = ({
    formData,
    errors,
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
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    return (
        <div className="flex flex-col gap-1">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">Create Account</h1>
                <p className="mt-1 text-sm text-secondary-500">Join our community and start connecting with sellers.</p>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5">
                {/* Personal Details */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-semibold text-secondary-400 uppercase tracking-widest">Personal Details</p>

                    <div className="grid grid-cols-2 gap-3">
                        <AuthInput
                            label="First Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            error={errors.name}
                            leftIcon={<UserIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                        <AuthInput
                            label="Last Name"
                            name="surname"
                            value={formData.surname}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            error={errors.surname}
                            leftIcon={<UserIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <AuthInput
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            error={errors.email}
                            leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                        <AuthInput
                            label="Phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+90 5XX XXX XX XX"
                            required
                            error={errors.phone}
                            leftIcon={<PhoneIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-secondary-700">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            {gendersLoading ? (
                                <div className="flex items-center py-2.5 px-3 border border-secondary-200 rounded-xl text-sm text-secondary-500">
                                    <LoadingIndicator size="h-4 w-4" />
                                    <span className="ml-2">Loading...</span>
                                </div>
                            ) : (
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 border border-secondary-200 rounded-xl text-sm text-secondary-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    required
                                >
                                    <option value="">Select gender</option>
                                    {genderOptions.map((g) => (
                                        <option key={g.value} value={g.value}>{g.label}</option>
                                    ))}
                                </select>
                            )}
                            {errors.gender && (
                                <p className="text-xs text-red-600">{errors.gender}</p>
                            )}
                        </div>

                        <AuthInput
                            label="Birth Date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            placeholder="DD/MM/YYYY"
                            required
                            error={errors.birthdate}
                            leftIcon={<CalendarIcon className="h-4 w-4" />}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                    </div>
                </div>

                {/* Security */}
                <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-semibold text-secondary-400 uppercase tracking-widest">Security</p>

                    <div className="grid grid-cols-2 gap-3">
                        <AuthInput
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            error={errors.password}
                            leftIcon={<LockClosedIcon className="h-4 w-4" />}
                            rightElement={(
                                <button
                                    type="button"
                                    className="text-secondary-400 hover:text-secondary-700 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            )}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                        <AuthInput
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            error={errors.confirmPassword}
                            leftIcon={<LockClosedIcon className="h-4 w-4" />}
                            rightElement={(
                                <button
                                    type="button"
                                    className="text-secondary-400 hover:text-secondary-700 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            )}
                            inputClassName="rounded-xl"
                            labelClassName="text-secondary-700 text-xs"
                        />
                    </div>
                </div>

                {/* Agreements */}
                {agreementsLoading && (
                    <div className="flex items-center gap-2 py-3 text-sm text-secondary-500">
                        <LoadingIndicator size="h-4 w-4" />
                        <span>Loading agreements...</span>
                    </div>
                )}
                {!agreementsLoading && (
                    <div className="rounded-xl bg-secondary-50 border border-secondary-200 p-4">
                        <AgreementsSection
                            agreements={agreements}
                            acceptedAgreements={acceptedAgreements}
                            onToggle={onToggleAgreement}
                            onRead={onReadAgreement}
                            error={errors.agreements}
                        />
                    </div>
                )}

                {errors.submit && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                        {errors.submit}
                    </div>
                )}

                {/* Submit */}
                <AuthButton
                    type="submit"
                    isLoading={isLoading}
                    size="lg"
                    className="rounded-xl"
                    rightIcon={!isLoading ? <ArrowRightIcon className="h-4 w-4" /> : null}
                >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </AuthButton>

                {/* Divider */}
                <div className="relative flex items-center gap-3">
                    <div className="flex-1 border-t border-secondary-200" />
                    <span className="text-xs text-secondary-400 shrink-0">OR CONTINUE WITH</span>
                    <div className="flex-1 border-t border-secondary-200" />
                </div>

                {/* Google */}
                <a
                    href={`${API_BASE_URL}/auth/oauth2/google`}
                    className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 border border-secondary-200 rounded-xl bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                        <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                        <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                        <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                        <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                </a>

                {/* Sign in link */}
                <p className="text-center text-sm text-secondary-500">
                    Already have an account?{' '}
                    <Link
                        to={ROUTES.LOGIN}
                        className="font-semibold text-secondary-900 hover:text-indigo-600 transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </div>
    );
};
