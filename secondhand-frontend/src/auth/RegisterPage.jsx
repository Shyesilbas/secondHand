import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../common/constants/routes.js';
import { API_BASE_URL } from '../common/constants/apiEndpoints.js';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    EnvelopeIcon, 
    LockClosedIcon,
    UserIcon,
    PhoneIcon,
    CalendarIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import useRegisterForm from "./hooks/useRegisterForm.js";
import AgreementsSection from '../agreements/components/AgreementsSection.jsx';
import AgreementModal from '../agreements/components/AgreementModal.jsx';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';

const RegisterPage = () => {
    const {
        formData,
        errors,
        isLoading,
        genderOptions,
        gendersLoading,
        handleChange,
        submit,
        agreements,
        agreementsLoading,
        acceptedAgreements,
        selectedAgreement,
        showAgreementModal,
        handleAgreementToggle,
        handleAgreementClick,
        handleCloseModal
    } = useRegisterForm();

    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        submit();
    };

    return (
        <div className="w-full">
            {/* Form */}
            <div className="bg-white py-6 px-5 shadow-lg rounded-lg border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name & Surname */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <UserIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        placeholder="Name"
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Surname
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <UserIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        placeholder="Surname"
                                        required
                                    />
                                </div>
                                {errors.surname && (
                                    <p className="mt-1 text-xs text-red-600">{errors.surname}</p>
                                )}
                            </div>
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        placeholder="Email"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+90 5XX XXX XX XX"
                                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        required
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Gender & Birth Date */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                {gendersLoading ? (
                                    <div className="flex items-center py-2 text-xs text-gray-500">
                                        <LoadingIndicator size="h-3 w-3" />
                                        <span className="ml-1">Loading...</span>
                                    </div>
                                ) : (
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="block w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        {genderOptions.map((gender) => (
                                            <option key={gender.value} value={gender.value}>
                                                {gender.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {errors.gender && (
                                    <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Birth Date
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                        placeholder="DD/MM/YYYY"
                                        className="block w-full pl-7 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        required
                                    />
                                </div>
                                {errors.birthdate && (
                                    <p className="mt-1 text-xs text-red-600">{errors.birthdate}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        placeholder="Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <EyeIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full pl-7 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                        placeholder="Confirm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeSlashIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <EyeIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Agreements */}
                        {!agreementsLoading && (
                            <div className="text-xs">
                                <AgreementsSection
                                    agreements={agreements}
                                    acceptedAgreements={acceptedAgreements}
                                    onToggle={handleAgreementToggle}
                                    onRead={handleAgreementClick}
                                    error={errors.agreements}
                                />
                            </div>
                        )}

                        {agreementsLoading && (
                            <div className="flex justify-center items-center py-2 text-xs text-gray-500">
                                <LoadingIndicator size="h-3 w-3" />
                                <span className="ml-1">Loading Agreements...</span>
                            </div>
                        )}

                        {errors.submit && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                                {errors.submit}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Google OAuth */}
                        <a
                            href={`${API_BASE_URL}/auth/oauth2/google`}
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                                <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                                <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                                <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                                <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                            </svg>
                            Google
                        </a>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-xs text-gray-600">
                                Already have an account?{' '}
                                <Link 
                                    to={ROUTES.LOGIN} 
                                    className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

            {/* Features */}
            <div className="text-center mt-6 flex items-center justify-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                    <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                    <ShieldCheckIcon className="h-3 w-3 text-blue-500" />
                    <span>Verified</span>
                </div>
            </div>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;