import { AlertCircle } from 'lucide-react';

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </p>
  );
};

const inputBase = 'w-full px-3 py-2 text-[13px] border rounded-md focus:outline-none transition-colors duration-150';
const inputNormal = `${inputBase} border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-900/10`;
const inputError = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-1 focus:ring-red-500/10`;

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={onInputChange}
          className={errors.city ? inputError : inputNormal}
          placeholder="e.g. Istanbul"
        />
        <FieldError error={errors.city} />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
          District <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="district"
          value={formData.district}
          onChange={onInputChange}
          className={errors.district ? inputError : inputNormal}
          placeholder="e.g. Kadikoy"
        />
        <FieldError error={errors.district} />
      </div>
    </div>
  );
};

export default LocationFields;
