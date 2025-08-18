import React from 'react';
import { useEnums } from '../../../hooks/useEnums';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { sportsService } from '../services/sportsService';

const SportsCreateForm = ({ onBack }) => {
  const { enums } = useEnums();

  const validateStep = (step, formData) => {
    if (step === 1) return validateSportsStep1(formData);
    if (step === 2) return validateSportsStep2(formData);
    if (step === 3) return validateSportsStep3(formData);
    return {};
  };

  const validateSportsStep1 = (formData) => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.currency) errors.currency = 'Currency is required';
    return errors;
  };

  const validateSportsStep2 = (formData) => {
    const errors = {};
    if (!formData.discipline) errors.discipline = 'Discipline is required';
    if (!formData.equipmentType) errors.equipmentType = 'Equipment type is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    return errors;
  };

  const validateSportsStep3 = (formData) => {
    const errors = {};
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.district?.trim()) errors.district = 'District is required';
    return errors;
  };

  const validateSportsAll = (formData) => ({
    ...validateSportsStep1(formData),
    ...validateSportsStep2(formData),
    ...validateSportsStep3(formData),
  });

  const formState = useFormState({
    initialData: {
      title: '',
      description: '',
      price: '',
      currency: 'TRY',
      // sports specific
      discipline: '',
      equipmentType: '',
      condition: '',
      // location
      city: '',
      district: '',
    },
    totalSteps: 3,
    validateStep,
    validateAll: validateSportsAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (data) => sportsService.createSportsListing(data),
    validateAll: validateSportsAll,
    formState,
    successMessage: 'Sports listing created successfully!',
    errorMessage: 'Failed to create sports listing',
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Set the title, description and price' },
    { id: 2, title: 'Sports Details', description: 'Specify the details of your item' },
    { id: 3, title: 'Location', description: 'Set the location' },
  ];

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📝</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>
            <p className="text-sm text-slate-600">Set the title, description and price of your listing</p>
          </div>
        </div>
        <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🏅</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sports Specifications</h3>
            <p className="text-sm text-slate-600">Specify the details of your sports item</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <EnumDropdown label="Discipline *" enumKey="sportDisciplines" value={formData.discipline} onChange={(v) => handleDropdownChange('discipline', v)} />
            {errors.discipline && <p className="mt-1 text-sm text-red-600">{errors.discipline}</p>}
          </div>

          <div>
            <EnumDropdown label="Equipment Type *" enumKey="sportEquipmentTypes" value={formData.equipmentType} onChange={(v) => handleDropdownChange('equipmentType', v)} />
            {errors.equipmentType && <p className="mt-1 text-sm text-red-600">{errors.equipmentType}</p>}
          </div>

          <div>
            <EnumDropdown label="Condition *" enumKey="sportConditions" value={formData.condition} onChange={(v) => handleDropdownChange('condition', v)} />
            {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📍</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Location Information</h3>
            <p className="text-sm text-slate-600">Specify the location where your item is located</p>
          </div>
        </div>

        <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
      </div>
    </div>
  );

  return (
    <ListingWizard
      title="Create Sports Listing"
      subtitle="Create your sports listing step by step"
      steps={steps}
      currentStep={currentStep}
      onBack={onBack}
      onNext={nextStep}
      onPrev={prevStep}
      onSubmit={handleSubmit}
      isLoading={false}
      canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
      renderStep={(step) => (
        <>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </>
      )}
    />
  );
};

export default SportsCreateForm;


