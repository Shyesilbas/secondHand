import {formatCurrency, parsePrice} from '../../formatters.js';
import {PriceInput} from '../ui/PriceInput.jsx';

const ListingBasics = ({ formData, errors = {}, onInputChange, enums, isEdit = false, showQuantity = true }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-5">
        <div className="pb-3 border-b border-gray-50">
          <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">General Information</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Basic listing details</p>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-900 mb-2">
            Listing Title <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={`w-full px-3 py-2.5 text-[13px] rounded-lg border focus:outline-none focus:ring-1 transition-colors ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'} text-gray-900 placeholder-gray-300`}
              placeholder="e.g., iPhone 13 Pro - Excellent Condition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 tabular-nums">
              {formData.title?.length || 0}/100
            </span>
          </div>
          {errors.title && (
            <p className="mt-1.5 text-[11px] text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-900 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={5}
              className={`w-full px-3 py-2.5 text-[13px] rounded-lg border focus:outline-none focus:ring-1 transition-colors resize-none ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'} text-gray-900 placeholder-gray-300`}
              placeholder="Describe your item in detail — condition, features, usage history, flaws…"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-300 tabular-nums">
              {formData.description?.length || 0} / 5000
            </span>
          </div>
          {errors.description && (
            <p className="mt-1.5 text-[11px] text-red-500">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-5 space-y-5">
        <div className="pb-3 border-b border-gray-50">
          <h3 className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Pricing</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Set the price and quantity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-900 mb-2">
              Price <span className="text-red-400">*</span>
            </label>
            <div className="relative flex">
              <PriceInput
                value={parsePrice(formData.price) ?? 0}
                onChange={(n) => onInputChange({ target: { name: 'price', value: n != null ? String(n) : '' } })}
                placeholder="0,00"
                className={`flex-1 min-w-0 rounded-l-lg rounded-r-none border-r-0 py-2.5 text-[13px] focus:outline-none ${errors.price ? 'border-red-300 focus:ring-1 focus:ring-red-200' : 'border-gray-200 focus:ring-1 focus:ring-gray-200 focus:border-gray-300'}`}
              />
              <div className="flex items-center shrink-0">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={onInputChange}
                  className="h-full py-0 pl-3 pr-7 border-l border-gray-200 bg-gray-50 text-gray-600 text-[12px] font-medium rounded-r-lg focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
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
              <p className="mt-1.5 text-[11px] text-gray-400">
                Preview: <span className="text-gray-700 tabular-nums font-medium">{formatCurrency(parsePrice(formData.price), formData.currency)}</span>
              </p>
            )}
            {errors.price && (
              <p className="mt-1.5 text-[11px] text-red-500">{errors.price}</p>
            )}
          </div>

          {showQuantity && (
            <div>
              <label className="block text-[13px] font-medium text-gray-900 mb-2">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity ?? ''}
                onChange={onInputChange}
                className={`w-full px-3 py-2.5 text-[13px] rounded-lg border focus:outline-none focus:ring-1 transition-colors ${errors.quantity ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200 focus:border-gray-300'} text-gray-900 placeholder-gray-300`}
                placeholder="e.g. 5"
                min="1"
                step="1"
              />
              {errors.quantity && (
                <p className="mt-1.5 text-[11px] text-red-500">{errors.quantity}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingBasics;
