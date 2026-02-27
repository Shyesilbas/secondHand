const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="pb-3 border-b border-gray-50 mb-5">
        <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Location</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">City and district information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-900 mb-2">
            City <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            className={`w-full px-3 py-2.5 text-[13px] rounded-lg border focus:outline-none focus:ring-1 transition-colors ${errors.city ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'} text-gray-900 placeholder-gray-300`}
            placeholder="e.g. Istanbul"
          />
          {errors.city && (
            <p className="mt-1.5 text-[11px] text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-900 mb-2">
            District <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={onInputChange}
            className={`w-full px-3 py-2.5 text-[13px] rounded-lg border focus:outline-none focus:ring-1 transition-colors ${errors.district ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'} text-gray-900 placeholder-gray-300`}
            placeholder="e.g. Kadikoy"
          />
          {errors.district && (
            <p className="mt-1.5 text-[11px] text-red-500">{errors.district}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
