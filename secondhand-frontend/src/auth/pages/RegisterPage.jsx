import useRegisterForm from '../hooks/useRegisterForm.js';
import AgreementModal from '../../agreements/components/AgreementModal.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { AuthBrand } from '../components/AuthPrimitives.jsx';

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

  return (
    <div className="flex flex-col">
      <AuthBrand />
      <RegisterForm
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        genderOptions={genderOptions}
        gendersLoading={gendersLoading}
        handleChange={handleChange}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        agreements={agreements}
        agreementsLoading={agreementsLoading}
        acceptedAgreements={acceptedAgreements}
        onToggleAgreement={handleAgreementToggle}
        onReadAgreement={handleAgreementClick}
      />
      <AgreementModal agreement={selectedAgreement} open={showAgreementModal} onClose={handleCloseModal} />
    </div>
  );
};

export default RegisterPage;
