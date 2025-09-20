import React from 'react';

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Location Information</h3>
        <p className="text-slate-600">Help buyers find your listing by providing accurate location details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 mb-3">City *</label>
          <div className="relative">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onInputChange}
              className={`w-full px-5 py-4 pl-12 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 ${
                errors.city 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              placeholder="Enter your city..."
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          {errors.city && <p className="mt-2 text-sm text-red-600 font-medium">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 mb-3">District *</label>
          <div className="relative">
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={onInputChange}
              className={`w-full px-5 py-4 pl-12 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 ${
                errors.district 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              placeholder="Enter your district..."
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          {errors.district && <p className="mt-2 text-sm text-red-600 font-medium">{errors.district}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
        <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-green-800 font-medium">Accurate location information helps buyers find your listing and makes the transaction process smoother.</p>
      </div>
    </div>
  );
};

export default LocationFields;

