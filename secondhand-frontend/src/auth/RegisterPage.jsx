import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../common/constants/routes.js';
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
        setFormData,
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
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text-primary mb-2">Create an account</h2>
                <p className="text-text-secondary">Join to the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="Ad" type="text" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                    <AuthInput label="Soyad" type="text" name="surname" value={formData.surname} onChange={handleChange} error={errors.surname} required />
                </div>

                <AuthInput label="E-posta Adresi" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                <AuthInput label="Telefon Numarası" type="tel" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />

                {/* Gender select loading */}
                {gendersLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <LoadingIndicator size="h-6 w-6" />
                    <span className="ml-2 text-text-secondary">Loading Genders...</span>
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

                <PasswordInput label="Şifre" name="password" value={formData.password} onChange={handleChange} error={errors.password} required />

                <PasswordInput label="Şifre Tekrarı" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />

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
                    <div className="flex justify-center items-center py-8">
                        <LoadingIndicator size="h-8 w-8" />
                        <span className="ml-2 text-text-secondary">Loading Agreements...</span>
                    </div>
                )}

                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                )}

                <AuthButton type="submit" isLoading={isLoading} className="w-full">
                    {isLoading ? 'Registering...' : 'Register'}
                </AuthButton>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-header-border" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-text-muted">Or</span></div>
                </div>

                <div className="text-center">
                    <p className="text-text-secondary">
                        Already Have an account?{' '}
                        <Link to={ROUTES.LOGIN} className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </form>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;
