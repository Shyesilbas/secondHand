import React from 'react';
import useRegisterForm from '../hooks/useRegisterForm.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { OnboardingCarousel } from '../components/OnboardingCarousel.jsx';

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
        <div className="flex min-h-screen w-full">
            {/* ── Left: Form ── */}
            <div className="flex flex-col w-full lg:w-1/2 min-h-screen overflow-y-auto bg-white">
                <div className="flex flex-col flex-1 px-8 py-10 max-w-lg mx-auto w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 rounded-xl bg-secondary-900 flex items-center justify-center shrink-0">
                            <span className="text-amber-400 text-base font-bold leading-none">S</span>
                        </div>
                        <span className="text-lg font-bold text-secondary-900 tracking-tight">SecondHand</span>
                    </div>

                    {/* Form */}
                    <RegisterForm
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        genderOptions={genderOptions}
                        gendersLoading={gendersLoading}
                        handleChange={handleChange}
                        onSubmit={handleSubmit}
                        agreements={agreements}
                        agreementsLoading={agreementsLoading}
                        acceptedAgreements={acceptedAgreements}
                        onToggleAgreement={handleAgreementToggle}
                        onReadAgreement={handleAgreementClick}
                    />

                    <p className="mt-8 text-center text-xs text-secondary-400">
                        © 2025 SecondHand. All rights reserved.
                    </p>
                </div>
            </div>

            {/* ── Right: Carousel ── */}
            <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen bg-secondary-50 border-l border-secondary-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-indigo-300/15 blur-3xl pointer-events-none" />
                <div className="relative z-10 w-full h-full">
                    <OnboardingCarousel />
                </div>
            </div>

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>
    );
};

export default RegisterPage;
