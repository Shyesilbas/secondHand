import React from 'react';

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Information</h3>
        <p className="text-gray-600">Help buyers find your listing by providing accurate location details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.city ? 'border-red-500' : ''}`}
            placeholder="Enter your city..."
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.district ? 'border-red-500' : ''}`}
            placeholder="Enter your district..."
          />
          {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded border border-gray-200">
        <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-700">Accurate location information helps buyers find your listing and makes the transaction process smoother.</p>
      </div>
    </div>
  );
};

export default LocationFields;

