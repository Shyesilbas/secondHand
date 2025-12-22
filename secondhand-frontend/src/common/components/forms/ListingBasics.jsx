import React from 'react';
import { formatCurrency } from '../../formatters.js';
import { Type, Tag, AlignLeft } from 'lucide-react';

const ListingBasics = ({ formData, errors = {}, onInputChange, enums, isEdit = false, showQuantity = true }) => {
  return (
    <div className="space-y-8">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-500" />
          Listing Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            className={`w-full px-5 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all shadow-sm`}
            placeholder="e.g., iPhone 13 Pro - Excellent Condition"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
            {formData.title?.length || 0}/100
          </div>
        </div>
        {errors.title ? (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {errors.title}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">Make it catchy! Good titles attract more buyers.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-500" />
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-sm">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onInputChange}
              className={`block w-full px-5 py-3 pr-24 rounded-xl border ${errors.price ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} focus:outline-none focus:ring-4 transition-all`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <select
                name="currency"
                value={formData.currency}
                onChange={onInputChange}
                className="h-full py-0 pl-3 pr-8 border-l border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium rounded-r-xl focus:ring-indigo-500 focus:border-indigo-500 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {enums.currencies?.map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.symbol} {currency.value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formData.price && !isNaN(parseFloat(formData.price)) && (
            <div className="mt-2 text-sm text-gray-600 font-medium flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 inline-block">
              Price Preview: 
              <span className="text-indigo-700">
                {formatCurrency(parseFloat(formData.price), formData.currency)}
              </span>
            </div>
          )}
          {errors.price && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-600 rounded-full"></span>
              {errors.price}
            </p>
          )}
        </div>

        {showQuantity && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity ?? ''}
              onChange={onInputChange}
              className={`w-full px-5 py-3 rounded-xl border ${errors.quantity ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} focus:outline-none focus:ring-4 transition-all`}
              placeholder="e.g. 5"
              min="1"
              step="1"
            />
            {errors.quantity ? (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {errors.quantity}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">This is your available stock.</p>
            )}
          </div>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-indigo-500" />
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={6}
            className={`w-full px-5 py-3 rounded-xl border ${errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'} text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all resize-none shadow-sm`}
            placeholder="Describe your item in detail. Include condition, features, usage history, and any flaws..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-100">
            {formData.description?.length || 0} chars
          </div>
        </div>
        {errors.description ? (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {errors.description}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">
            Be honest and detailed. Listings with detailed descriptions sell 2x faster.
          </p>
        )}
      </div>
    </div>
  );
};

export default ListingBasics;
