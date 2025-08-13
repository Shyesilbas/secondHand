import React from 'react';

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Şehir *</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-slate-200'}`}
          placeholder="ör: İstanbul"
        />
        {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">İlçe *</label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg ${errors.district ? 'border-red-500' : 'border-slate-200'}`}
          placeholder="ör: Kadıköy"
        />
        {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
      </div>
    </div>
  );
};

export default LocationFields;

