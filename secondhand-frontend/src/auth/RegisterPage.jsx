import React from 'react';
import {Link} from 'react-router-dom';
import {ROUTES} from '../common/constants/routes.js';
import AuthInput from '../common/components/ui/AuthInput.jsx';
import AuthButton from '../common/components/ui/AuthButton.jsx';
import LoadingIndicator from '../common/components/ui/LoadingIndicator.jsx';
import AgreementsSection from '../agreements/components/AgreementsSection.jsx';
import AgreementModal from '../agreements/components/AgreementModal.jsx';
import PasswordInput from '../common/components/ui/PasswordInput.jsx';
import SelectField from '../common/components/ui/SelectField.jsx';
import useRegisterForm from "./hooks/useRegisterForm.js";

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

    const handleSubmit = (e) => {
        e.preventDefault();
        submit();
    };

    return (
        <div className="w-full max-w-lg mx-auto px-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Create an account</h2>
                <p className="text-gray-500 text-sm">Join the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <AuthInput
                        label="Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required
                    />
                    <AuthInput
                        label="Surname"
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        error={errors.surname}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <AuthInput
                        label="E-Mail"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />
                    <AuthInput
                        label="Phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                    />
                </div>

                {gendersLoading ? (
                    <div className="flex justify-center items-center py-2 text-sm text-gray-500">
                        <LoadingIndicator size="h-5 w-5" />
                        <span className="ml-2">Loading Genders...</span>
                    </div>
                ) : (
                    <SelectField
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={genderOptions}
                        placeholder="Select Gender..."
                        error={errors.gender}
                        required
                    />
                )}

                <div className="grid grid-cols-2 gap-3">
                    <PasswordInput
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        required
                    />
                    <PasswordInput
                        label="Confirm"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                    />
                </div>

                {!agreementsLoading && (
                    <AgreementsSection
                        agreements={agreements}
                        acceptedAgreements={acceptedAgreements}
                        onToggle={handleAgreementToggle}
                        onRead={handleAgreementClick}
                        error={errors.agreements}
                    />
                )}

                {agreementsLoading && (
                    <div className="flex justify-center items-center py-4 text-sm text-gray-500">
                        <LoadingIndicator size="h-5 w-5" />
                        <span className="ml-2">Loading Agreements...</span>
                    </div>
                )}

                {errors.submit && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                        {errors.submit}
                    </div>
                )}

                <AuthButton type="submit" isLoading={isLoading} className="w-full">
                    {isLoading ? 'Registering...' : 'Register'}
                </AuthButton>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-2 text-gray-400 text-xs">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div>
                    <a
                        href="/api/auth/oauth2/google"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-header-border rounded-md shadow-sm text-sm font-medium text-text-secondary bg-white hover:bg-app-bg"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                            <path d="M533.5 278.4c0-18.5-1.7-36.4-4.9-53.6H272.1v101.5h147.1c-6.3 34.2-25.5 63.2-54.4 82.6v68h87.7c51.3-47.2 81-116.8 81-198.5z" fill="#4285F4"/>
                            <path d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.4l-87.7-68c-24.3 16.3-55.5 26-91.9 26-70.7 0-130.6-47.7-152-111.8h-90.9v70.2c44.7 88.6 136.2 148.9 243 148.9z" fill="#34A853"/>
                            <path d="M120.1 325.1c-10.2-30.2-10.2-62.9 0-93.1V161.8h-90.9c-38.2 76.3-38.2 168.4 0 244.7l90.9-81.4z" fill="#FBBC05"/>
                            <path d="M272.1 107.7c39.8-.6 78 14.5 107.3 42.4l80.1-80.1C406.9 24 344.9-.1 272.1 0 165.3 0 73.8 60.2 29.2 148.8l90.9 70.2c21.4-64.1 81.3-111.8 152-111.3z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </a>
                </div>

                <div className="text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link to={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Login
                    </Link>
                </div>
            </form>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;
