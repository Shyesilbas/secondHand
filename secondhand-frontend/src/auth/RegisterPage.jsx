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
