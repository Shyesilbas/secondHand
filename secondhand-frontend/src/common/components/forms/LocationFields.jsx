import React from 'react';
import { MapPin, Building2, Map } from 'lucide-react';

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0 h-fit">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-900 text-sm mb-1">Why is location important?</h4>
          <p className="text-sm text-indigo-700 leading-relaxed">
            Buyers often filter by location to find items nearby. Providing accurate city and district details helps you reach local buyers faster.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            className={`w-full px-5 py-3 rounded-xl border ${errors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all shadow-sm`}
            placeholder="e.g. Istanbul"
          />
          {errors.city && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Map className="w-4 h-4 text-gray-400" />
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={onInputChange}
            className={`w-full px-5 py-3 rounded-xl border ${errors.district ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all shadow-sm`}
            placeholder="e.g. Kadikoy"
          />
          {errors.district && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {errors.district}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
