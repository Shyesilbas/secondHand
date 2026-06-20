import { useTranslation } from "react-i18next";
import React from 'react';
import useRegisterForm from '../hooks/useRegisterForm.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
const RegisterPage = () => {
  const {
    t
  } = useTranslation();
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
  const handleSubmit = e => {
    e.preventDefault();
    submit();
  };
  return <div className="w-full flex flex-col">
            {/* Logo Monogram */}
            <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-primary-content text-xs font-semibold leading-none">{t("s")}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary tracking-tight">{t("secondhand")}</span>
            </div>

            <RegisterForm formData={formData} errors={errors} isLoading={isLoading} genderOptions={genderOptions} gendersLoading={gendersLoading} handleChange={handleChange} onSubmit={handleSubmit} agreements={agreements} agreementsLoading={agreementsLoading} acceptedAgreements={acceptedAgreements} onToggleAgreement={handleAgreementToggle} onReadAgreement={handleAgreementClick} />

            <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
        </div>;
};
export default RegisterPage;