import React from 'react';
import { useEnums } from '../../../hooks/useEnums';
import ListingBasics from '../../../components/forms/ListingBasics';
import LocationFields from '../../../components/forms/LocationFields';
import ListingWizard from '../../listings/components/ListingWizard';
import EnumDropdown from '../../../components/ui/EnumDropdown';
import { useFormState } from '../../../forms/hooks/useFormState';
import { useFormSubmission } from '../../../forms/hooks/useFormSubmission';
import { booksService } from '../services/booksService';

const BooksCreateForm = ({ onBack }) => {
  const { enums } = useEnums();

  const validateStep = (step, formData) => {
    if (step === 1) return validateBooksStep1(formData);
    if (step === 2) return validateBooksStep2(formData);
    if (step === 3) return validateBooksStep3(formData);
    return {};
  };

  const validateBooksStep1 = (formData) => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.currency) errors.currency = 'Currency is required';
    return errors;
  };

  const validateBooksStep2 = (formData) => {
    const errors = {};
    if (!formData.author?.trim()) errors.author = 'Author is required';
    if (!formData.genre) errors.genre = 'Genre is required';
    if (!formData.language) errors.language = 'Language is required';
    if (!formData.publicationYear) errors.publicationYear = 'Publication year is required';
    if (!formData.pageCount) errors.pageCount = 'Page count is required';
    if (!formData.format) errors.format = 'Format is required';
    if (!formData.condition) errors.condition = 'Condition is required';
    return errors;
  };

  const validateBooksStep3 = (formData) => {
    const errors = {};
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.district?.trim()) errors.district = 'District is required';
    return errors;
  };

  const validateBooksAll = (formData) => ({
    ...validateBooksStep1(formData),
    ...validateBooksStep2(formData),
    ...validateBooksStep3(formData),
  });

  const formState = useFormState({
    initialData: {
      title: '',
      description: '',
      price: '',
      currency: 'TRY',
      // books specific
      author: '',
      genre: '',
      language: '',
      publicationYear: '',
      pageCount: '',
      format: '',
      condition: '',
      isbn: '',
      // location
      city: '',
      district: '',
    },
    totalSteps: 3,
    validateStep,
    validateAll: validateBooksAll,
  });

  const { handleSubmit } = useFormSubmission({
    submitFunction: (data) => booksService.createBooksListing(data),
    validateAll: validateBooksAll,
    formState,
    successMessage: 'Books listing created successfully!',
    errorMessage: 'Failed to create books listing',
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Set the title, description and price' },
    { id: 2, title: 'Book Details', description: 'Specify the details of your book' },
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
            <span className="text-xl">📚</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Book Specifications</h3>
            <p className="text-sm text-slate-600">Specify the details of your book</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.author ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="e.g: Orhan Pamuk"
            />
            {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
          </div>

          <div>
            <EnumDropdown label="Genre *" enumKey="bookGenres" value={formData.genre} onChange={(v) => handleDropdownChange('genre', v)} />
            {errors.genre && <p className="mt-1 text-sm text-red-600">{errors.genre}</p>}
          </div>

          <div>
            <EnumDropdown label="Language *" enumKey="bookLanguages" value={formData.language} onChange={(v) => handleDropdownChange('language', v)} />
            {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Publication Year *</label>
            <input
              type="number"
              name="publicationYear"
              value={formData.publicationYear}
              onChange={handleInputChange}
              min="1450"
              max={new Date().getFullYear()}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.publicationYear ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="2000"
            />
            {errors.publicationYear && <p className="mt-1 text-sm text-red-600">{errors.publicationYear}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Page Count *</label>
            <input
              type="number"
              name="pageCount"
              value={formData.pageCount}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.pageCount ? 'border-red-500' : 'border-slate-200'
              }`}
              placeholder="350"
            />
            {errors.pageCount && <p className="mt-1 text-sm text-red-600">{errors.pageCount}</p>}
          </div>

          <div>
            <EnumDropdown label="Format *" enumKey="bookFormats" value={formData.format} onChange={(v) => handleDropdownChange('format', v)} />
            {errors.format && <p className="mt-1 text-sm text-red-600">{errors.format}</p>}
          </div>

          <div>
            <EnumDropdown label="Condition *" enumKey="bookConditions" value={formData.condition} onChange={(v) => handleDropdownChange('condition', v)} />
            {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="978-3-16-148410-0"
            />
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
            <p className="text-sm text-slate-600">Specify the location where your book is located</p>
          </div>
        </div>

        <LocationFields formData={formData} errors={errors} onInputChange={handleInputChange} />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg">👁️</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Listing Preview</h3>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-lg font-semibold text-slate-900 mb-3">{formData.title || 'Listing Title'}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
            <span className="flex items-center gap-1">
              <span>📚</span> {formData.author}
            </span>
            {formData.publicationYear && (
              <span className="flex items-center gap-1">
                <span>📅</span> {formData.publicationYear}
              </span>
            )}
            {formData.pageCount && (
              <span className="flex items-center gap-1">
                <span>📖</span> {parseInt(formData.pageCount).toLocaleString('en-US')} pages
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-600">
              {formData.price ? `${parseInt(formData.price).toLocaleString('en-US')} ${formData.currency}` : 'Price not specified'}
            </span>
            <span className="text-sm text-slate-500">
              {formData.city ? `${formData.district ? formData.district + ', ' : ''}${formData.city}` : 'Location not specified'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ListingWizard
      title="Create Books Listing"
      subtitle="Create your book listing step by step"
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

export default BooksCreateForm;
