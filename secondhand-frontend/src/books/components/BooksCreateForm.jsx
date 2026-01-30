import React, { useEffect, useMemo } from 'react';
import { useEnums } from '../../common/hooks/useEnums.js';
import LocationFields from '../../common/components/forms/LocationFields.jsx';
import ListingWizard from '../../listing/components/ListingWizard.jsx';
import EnumDropdown from '../../common/components/ui/EnumDropdown.jsx';
import { useFormState } from '../../common/forms/hooks/useFormState.js';
import { useFormSubmission } from '../../common/forms/hooks/useFormSubmission.js';
import { booksService } from '../services/booksService.js';
import booksValidator from '../booksValidator.js';
import { createFormConfig } from '../../common/forms/config/formConfigs.js';
import ListingBasics from "../../common/components/forms/ListingBasics.jsx";
import ImageUpload from '../../common/components/ImageUpload.jsx';

const BooksCreateForm = ({ onBack, initialData = null, isEdit = false, onUpdate = null }) => {
  const { enums } = useEnums();
  const formConfig = createFormConfig('books');

  const normalizedInitialData = {
    ...(initialData || {}),
    bookTypeId: initialData?.bookTypeId || initialData?.bookType?.id || '',
    genreId: initialData?.genreId || initialData?.genre?.id || '',
    languageId: initialData?.languageId || initialData?.language?.id || '',
    formatId: initialData?.formatId || initialData?.format?.id || '',
    conditionId: initialData?.conditionId || initialData?.condition?.id || '',
  };

  const formState = useFormState({
    initialData: { ...formConfig.initialData, ...normalizedInitialData },
    totalSteps: formConfig.totalSteps,
    validateStep: booksValidator.validateStep,
    validateAll: booksValidator.validateAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (isEdit && onUpdate) ? onUpdate : booksService.createBooksListing,
    validateAll: booksValidator.validateAll,
    formState,
    successMessage: isEdit ? 'Books listing updated successfully!' : 'Books listing created successfully!',
    errorMessage: isEdit ? 'Failed to update books listing' : 'Failed to create books listing',
  });

  const { formData, errors, currentStep, handleInputChange, handleDropdownChange, nextStep, prevStep } = formState;

  const selectedGenreBookTypeId = useMemo(() => {
    const genres = enums?.bookGenres || [];
    const found = genres.find((g) => String(g.id) === String(formData.genreId));
    return found?.bookTypeId || '';
  }, [enums?.bookGenres, formData.genreId]);

  useEffect(() => {
    if (String(formData._genreBookTypeId || '') !== String(selectedGenreBookTypeId || '')) {
      handleInputChange({ target: { name: '_genreBookTypeId', value: selectedGenreBookTypeId || '' } });
    }
  }, [formData._genreBookTypeId, selectedGenreBookTypeId, handleInputChange]);

  useEffect(() => {
    if (formData.bookTypeId && formData.genreId && selectedGenreBookTypeId && String(selectedGenreBookTypeId) !== String(formData.bookTypeId)) {
      handleDropdownChange('genreId', '');
    }
  }, [formData.bookTypeId, formData.genreId, selectedGenreBookTypeId, handleDropdownChange]);

  const handleImageUpload = (imageUrl) => {
    handleInputChange({ target: { name: 'imageUrl', value: imageUrl } });
  };

  const handleImageRemove = () => {
    handleInputChange({ target: { name: 'imageUrl', value: '' } });
  };

  const renderStep = (stepId) => {
    if (stepId === 1) {
      return (
        <ListingBasics formData={formData} errors={errors} onInputChange={handleInputChange} enums={enums} isEdit={isEdit} />
      );
    }

    if (stepId === 2) {
      const fields = formConfig.fieldGroups.step2;
      const genreOptions = (enums?.bookGenres || []).filter((g) => !formData.bookTypeId || g.bookTypeId === formData.bookTypeId);
      return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <div className="pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">Kitap Detayları</h3>
              <p className="text-xs text-slate-500 mt-1 tracking-tight">Kitap bilgileri ve özellikleri</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => {
                if (['bookTypeId', 'genreId', 'languageId', 'formatId', 'conditionId'].includes(field)) {
                  const isGenre = field === 'genreId';
                  const enumKey = field === 'bookTypeId'
                    ? 'bookTypes'
                    : field === 'genreId'
                      ? 'bookGenres'
                      : field === 'languageId'
                        ? 'bookLanguages'
                        : field === 'formatId'
                          ? 'bookFormats'
                          : 'bookConditions';

                  const label = field === 'bookTypeId'
                    ? 'Book Type *'
                    : field === 'genreId'
                      ? 'Genre *'
                      : field === 'languageId'
                        ? 'Language *'
                        : field === 'formatId'
                          ? 'Format *'
                          : 'Condition *';

                  return (
                      <div key={field}>
                        <EnumDropdown
                            label={label}
                            enumKey={enumKey}
                            value={formData[field]}
                            disabled={field === 'genreId' && !formData.bookTypeId}
                            onChange={(v) => {
                              if (field === 'bookTypeId') {
                                handleDropdownChange('bookTypeId', v);
                                handleDropdownChange('genreId', '');
                                return;
                              }
                              handleDropdownChange(field, v);
                            }}
                            options={isGenre ? genreOptions : null}
                        />
                        {errors[field] && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors[field]}</p>}
                      </div>
                  );
                } else {
                  return (
                      <div key={field}>
                        <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">{field.charAt(0).toUpperCase() + field.slice(1)} *</label>
                        <input
                            type={['publicationYear', 'pageCount', 'price'].includes(field) ? 'number' : 'text'}
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all tracking-tight ${
                                errors[field] ? 'border-red-300' : 'border-slate-200'
                            }`}
                        />
                        {errors[field] && <p className="mt-2 text-xs text-red-600 tracking-tight">{errors[field]}</p>}
                      </div>
                  );
                }
              })}
            </div>
          </div>
      );
    }

    if (stepId === 3) {
      return (
        <div className="space-y-10">
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            imageUrl={formData.imageUrl}
            disabled={false}
          />
          <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
        </div>
      );
    }

    return null;
  };

  return (
      <ListingWizard
          title={isEdit ? 'Edit Books Listing' : 'Create Books Listing'}
          subtitle={isEdit ? 'Update your book listing details' : 'Create your book listing step by step'}
          steps={formConfig.steps}
          currentStep={currentStep}
          onBack={onBack}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isLoading={booksService.isLoading || false}
          canSubmit={Boolean(formData.city?.trim() && formData.district?.trim())}
          renderStep={(step) => renderStep(step)}
      />
  );
};

export default BooksCreateForm;
