import React from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../common/constants/routes.js';
import {API_BASE_URL} from '../common/constants/apiEndpoints.js';
import {
    ArrowRight as ArrowRightIcon,
    Calendar as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Eye as EyeIcon,
    EyeOff as EyeSlashIcon,
    Lock as LockClosedIcon,
    Mail as EnvelopeIcon,
    Phone as PhoneIcon,
    ShieldCheck as ShieldCheckIcon,
    User as UserIcon
} from 'lucide-react';
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
        <div className="w-full bg-[#F8FAFC] min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Create Your Account</h1>
                        <p className="text-sm text-slate-600 tracking-tight">Join us and start your journey</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Personal Details</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            placeholder="Name"
                                            required
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Surname
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="surname"
                                            value={formData.surname}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            placeholder="Surname"
                                            required
                                        />
                                    </div>
                                    {errors.surname && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.surname}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Email
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            placeholder="Email"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Phone
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+90 5XX XXX XX XX"
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            required
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Gender
                                    </label>
                                    {gendersLoading ? (
                                        <div className="flex items-center py-3 text-sm text-slate-500">
                                            <LoadingIndicator size="h-4 w-4" />
                                            <span className="ml-2 tracking-tight">Loading...</span>
                                        </div>
                                    ) : (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
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
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.gender}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Birth Date
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="birthdate"
                                            value={formData.birthdate}
                                            onChange={handleChange}
                                            placeholder="DD/MM/YYYY"
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            required
                                        />
                                    </div>
                                    {errors.birthdate && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.birthdate}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Security</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            placeholder="Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 tracking-tight">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm tracking-tight bg-white transition-all"
                                            placeholder="Confirm Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-600 tracking-tight">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!agreementsLoading && (
                            <div className="bg-slate-50 rounded-2xl p-6">
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
                            <div className="flex justify-center items-center py-4 text-sm text-slate-500">
                                <LoadingIndicator size="h-4 w-4" />
                                <span className="ml-2 tracking-tight">Loading Agreements...</span>
                            </div>
                        )}

                        {errors.submit && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm tracking-tight">
                                {errors.submit}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-2xl shadow-xl shadow-slate-900/10 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 tracking-tight"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="tracking-tight">Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span className="tracking-tight">Create Account</span>
                                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 tracking-tight">Or continue with</span>
                            </div>
                        </div>

                        <a
                            href={`${API_BASE_URL}/auth/oauth2/google`}
                            className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 rounded-2xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 tracking-tight"
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                                <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                                <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                                <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                                <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                            </svg>
                            <span className="tracking-tight">Continue with Google</span>
                        </a>

                        <div className="text-center pt-2">
                            <p className="text-sm text-slate-600 tracking-tight">
                                Already have an account?{' '}
                                <Link 
                                    to={ROUTES.LOGIN} 
                                    className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors tracking-tight"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-8 flex items-center justify-center space-x-8">
                    <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm text-slate-700 font-medium tracking-wider">Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ShieldCheckIcon className="h-5 w-5 text-indigo-500" />
                        <span className="text-sm text-slate-700 font-medium tracking-wider">Verified</span>
                    </div>
                </div>
            </div>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;