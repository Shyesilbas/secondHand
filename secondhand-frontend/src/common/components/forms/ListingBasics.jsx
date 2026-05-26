import { formatCurrency, parsePrice } from '../../formatters.js';
import { PriceInput } from '../ui/PriceInput.jsx';
import { Type, DollarSign, AlertCircle } from 'lucide-react';
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

const SectionCard = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="wizard-glass-elevated wizard-card-lift rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 border-b border-zinc-100/60 px-5 py-3.5">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-50 to-zinc-100 shadow-sm">
            <Icon className="h-4 w-4 text-zinc-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
};

const inputBase = 'w-full px-3.5 py-2.5 text-[13px] border rounded-lg focus:outline-none transition-all duration-200';
const inputNormal = `${inputBase} border-zinc-200/60 bg-white focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 wizard-input-glow hover:border-zinc-300`;
const inputError = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-500/10`;

const ListingBasics = ({
  formData,
  errors = {},
  onInputChange,
  enums,
  showQuantity = true,
}) => {
  const titleLen = formData.title?.length || 0;
  const titleProgress = Math.min(titleLen / 100, 1);
  const titleCountColor = titleProgress > 0.9
    ? 'text-red-500'
    : titleProgress > 0.7
      ? 'text-amber-500'
      : 'text-zinc-400';

  return (
    <div className="space-y-6 wizard-stagger">
      <SectionCard title="General Information" description="Basic listing details" icon={Type}>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className={errors.title ? inputError : inputNormal}
                placeholder="e.g., iPhone 13 Pro - Excellent Condition"
                maxLength={100}
              />
              <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums transition-colors duration-200 ${titleCountColor}`}>
                {titleLen}/100
              </span>
            </div>
            {/* Subtle progress bar under title input */}
            <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <motion.div
                className="h-full rounded-full bg-zinc-300"
                animate={{ width: `${titleProgress * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <FieldError error={errors.title} />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={5}
                className={`${errors.description ? inputError : inputNormal} resize-none pb-7`}
                placeholder="Describe your item in detail — condition, features, usage history, flaws…"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] tabular-nums text-zinc-400">
                {formData.description?.length || 0} / 5000
              </span>
            </div>
            <FieldError error={errors.description} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pricing" description="Set the price and quantity" icon={DollarSign}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative flex">
              <PriceInput
                value={parsePrice(formData.price) ?? 0}
                onChange={(n) => onInputChange({ target: { name: 'price', value: n != null ? String(n) : '' } })}
                placeholder="0,00"
                className={`flex-1 min-w-0 rounded-l-lg rounded-r-none border-r-0 focus:outline-none ${
                  errors.price ? inputError : inputNormal
                }`}
              />
              <div className="flex shrink-0 items-center">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={onInputChange}
                  className="h-full cursor-pointer rounded-r-lg border border-l-0 border-zinc-200/60 bg-zinc-50/80 py-0 pl-2.5 pr-6 text-[13px] font-medium text-zinc-700 transition-colors focus:outline-none hover:bg-zinc-100"
                >
                  {enums.currencies?.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {formData.price && parsePrice(formData.price) != null && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 text-[12px] text-zinc-500"
              >
                Preview:{' '}
                <span className="font-semibold tabular-nums text-zinc-800">
                  {formatCurrency(parsePrice(formData.price), formData.currency)}
                </span>
              </motion.p>
            )}
            <FieldError error={errors.price} />
          </div>

          {showQuantity && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-zinc-900">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity ?? ''}
                onChange={onInputChange}
                className={errors.quantity ? inputError : inputNormal}
                placeholder="e.g. 5"
                min="1"
                step="1"
              />
              <FieldError error={errors.quantity} />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default ListingBasics;
