import {AlertCircle} from 'lucide-react';

const FieldError = ({error}) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
};

const LocationFields = ({formData, errors = {}, onInputChange}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          City <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={onInputChange}
          className={`w-full px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-300 ${
            errors.city
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
              : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
          }`}
          placeholder="e.g. Istanbul"
        />
        <FieldError error={errors.city} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          District <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={onInputChange}
          className={`w-full px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-300 ${
            errors.district
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
              : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
          }`}
          placeholder="e.g. Kadikoy"
        />
        <FieldError error={errors.district} />
      </div>
    </div>
  );
};

export default LocationFields;
