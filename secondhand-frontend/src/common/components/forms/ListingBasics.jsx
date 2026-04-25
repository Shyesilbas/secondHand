import {formatCurrency, parsePrice} from '../../formatters.js';
import {PriceInput} from '../ui/PriceInput.jsx';
import {Type, DollarSign, AlertCircle} from 'lucide-react';

const FieldError = ({error}) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {error}
    </p>
  );
};

const ListingBasics = ({formData, errors = {}, onInputChange, enums, isEdit = false, showQuantity = true}) => {
  return (
    <div className="space-y-6">

      {/* General Info Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Type className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">General Information</h3>
            <p className="text-xs text-gray-400 mt-0.5">Basic listing details</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Listing Title <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                className={`w-full px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-300 ${
                  errors.title
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
                    : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
                }`}
                placeholder="e.g., iPhone 13 Pro - Excellent Condition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 tabular-nums">
                {formData.title?.length || 0}/100
              </span>
            </div>
            <FieldError error={errors.title} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={5}
                className={`w-full px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all duration-200 resize-none text-gray-900 placeholder-gray-300 ${
                  errors.description
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
                    : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
                }`}
                placeholder="Describe your item in detail — condition, features, usage history, flaws…"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-gray-300 tabular-nums">
                {formData.description?.length || 0} / 5000
              </span>
            </div>
            <FieldError error={errors.description} />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
            <p className="text-xs text-gray-400 mt-0.5">Set the price and quantity</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price <span className="text-red-400">*</span>
              </label>
              <div className="relative flex">
                <PriceInput
                  value={parsePrice(formData.price) ?? 0}
                  onChange={(n) => onInputChange({target: {name: 'price', value: n != null ? String(n) : ''}})}
                  placeholder="0,00"
                  className={`flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0 border-2 py-3 text-sm focus:outline-none ${
                    errors.price
                      ? 'border-red-300 focus:ring-2 focus:ring-red-500/10'
                      : 'border-gray-200 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400'
                  }`}
                />
                <div className="flex items-center shrink-0">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={onInputChange}
                    className="h-full py-0 pl-3 pr-7 border-2 border-l-0 border-gray-200 bg-gray-50 text-gray-600 text-xs font-semibold rounded-r-xl focus:outline-none hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {enums.currencies?.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.symbol} {currency.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.price && parsePrice(formData.price) != null && (
                <p className="mt-2 text-xs text-gray-400">
                  Preview: <span className="text-gray-700 tabular-nums font-semibold">{formatCurrency(parsePrice(formData.price), formData.currency)}</span>
                </p>
              )}
              <FieldError error={errors.price} />
            </div>

            {showQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity ?? ''}
                  onChange={onInputChange}
                  className={`w-full px-4 py-3 text-sm rounded-xl border-2 focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-300 ${
                    errors.quantity
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
                      : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-900/10'
                  }`}
                  placeholder="e.g. 5"
                  min="1"
                  step="1"
                />
                <FieldError error={errors.quantity} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingBasics;
