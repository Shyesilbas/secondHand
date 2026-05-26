import { AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </motion.p>
  );
};

const inputBase = 'w-full pl-10 pr-3.5 py-2.5 text-[13px] border rounded-lg focus:outline-none transition-all duration-200';
const inputNormal = `${inputBase} border-zinc-200/60 bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 wizard-input-glow hover:border-zinc-300`;
const inputError = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;

const LocationFields = ({ formData, errors = {}, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
          City <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onInputChange}
            className={errors.city ? inputError : inputNormal}
            placeholder="e.g. Istanbul"
          />
        </div>
        <FieldError error={errors.city} />
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
          District <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={onInputChange}
            className={errors.district ? inputError : inputNormal}
            placeholder="e.g. Kadikoy"
          />
        </div>
        <FieldError error={errors.district} />
      </div>
    </div>
  );
};

export default LocationFields;
