import { formatCurrency, parsePrice } from '../../formatters.js';
import { PriceInput } from '../ui/PriceInput.jsx';
import { Type, DollarSign, AlertCircle } from 'lucide-react';

const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {error}
    </p>
  );
};

const SectionCard = ({ title, description, icon: Icon, children }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-3.5">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-50">
            <Icon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
};

const inputBase = 'w-full px-3 py-2 text-[13px] border rounded-md focus:outline-none transition-colors duration-150';
const inputNormal = `${inputBase} border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-900/10`;
const inputError = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-1 focus:ring-red-500/10`;

const ListingBasics = ({
  formData,
  errors = {},
  onInputChange,
  enums,
  showQuantity = true,
}) => {
  return (
    <div className="space-y-6">
      <SectionCard title="General Information" description="Basic listing details" icon={Type}>
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
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
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-gray-400">
                {formData.title?.length || 0}/100
              </span>
            </div>
            <FieldError error={errors.title} />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
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
              <span className="absolute bottom-2.5 right-3 text-[11px] tabular-nums text-gray-400">
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
            <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative flex">
              <PriceInput
                value={parsePrice(formData.price) ?? 0}
                onChange={(n) => onInputChange({ target: { name: 'price', value: n != null ? String(n) : '' } })}
                placeholder="0,00"
                className={`flex-1 min-w-0 rounded-l-md rounded-r-none border-r-0 focus:outline-none ${
                  errors.price ? inputError : inputNormal
                }`}
              />
              <div className="flex shrink-0 items-center">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={onInputChange}
                  className="h-full cursor-pointer rounded-r-md border border-l-0 border-gray-200 bg-gray-50 py-0 pl-2.5 pr-6 text-[13px] font-medium text-gray-700 transition-colors focus:outline-none hover:bg-gray-100"
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
              <p className="mt-1.5 text-[12px] text-gray-500">
                Preview:{' '}
                <span className="font-medium tabular-nums text-gray-800">
                  {formatCurrency(parsePrice(formData.price), formData.currency)}
                </span>
              </p>
            )}
            <FieldError error={errors.price} />
          </div>

          {showQuantity && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-900">
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
