const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="pb-4 border-b-2 border-slate-100 mb-6">
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">Location Information</h3>
        <p className="text-xs text-slate-500 mt-1 tracking-tight">Enter city and district information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all tracking-tight ${errors.city ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'} text-slate-900 placeholder-slate-400`}
            placeholder="e.g. Istanbul"
          />
          {errors.city && (
            <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={onInputChange}
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all tracking-tight ${errors.district ? 'border-red-300 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'} text-slate-900 placeholder-slate-400`}
            placeholder="e.g. Kadıköy"
          />
          {errors.district && (
            <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.district}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationFields;
