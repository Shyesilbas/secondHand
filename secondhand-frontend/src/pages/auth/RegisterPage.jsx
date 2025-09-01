import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import AgreementsSection from '../../components/agreements/AgreementsSection';
import AgreementModal from '../../components/agreements/AgreementModal';
import PasswordInput from '../../components/ui/PasswordInput';
import SelectField from '../../components/ui/SelectField';
import { useRegisterForm } from '../../features/auth/hooks/useRegisterForm';

const RegisterPage = () => {
    const {
        formData,
        setFormData,
        errors,
        isLoading,
        genderOptions,
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
                <p className="text-gray-600">Join to the community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="Ad" type="text" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                    <AuthInput label="Soyad" type="text" name="surname" value={formData.surname} onChange={handleChange} error={errors.surname} required />
                </div>

                <AuthInput label="E-posta Adresi" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} required />
                <AuthInput label="Telefon Numarası" type="tel" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} required />

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
                        <span className="ml-2 text-gray-600">Loading Agreements...</span>
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
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
                </div>

                <div className="text-center">
                    <p className="text-gray-600">
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
