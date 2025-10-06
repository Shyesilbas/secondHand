import React from 'react';
import { formatCurrency } from '../../formatters.js';

const ListingBasics = ({ formData, errors = {}, onInputChange, enums, isEdit = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Listing Topic *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Ex: Product or service title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
          <div className="flex">
            <div className="flex-1 relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                className={`w-full px-4 py-2 pr-12 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${errors.price ? 'border-red-500' : ''}`}
                placeholder="Enter price (e.g., 15000.00)"
                step="0.01"
                min="0"
                disabled={false}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">
                  {formData.currency === 'TRY' ? '₺' : 
                   formData.currency === 'USD' ? '$' : 
                   formData.currency === 'EUR' ? '€' : formData.currency}
                </span>
              </div>
            </div>
            <select
              name="currency"
              value={formData.currency}
              onChange={onInputChange}
              className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              disabled={false}
            >
              {enums.currencies?.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label}
                </option>
              ))}
            </select>
          </div>
          {formData.price && !isNaN(parseFloat(formData.price)) && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Formatted Price:</span> 
                <span className="ml-2 font-semibold text-gray-900">
                  {formatCurrency(parseFloat(formData.price), formData.currency)}
                </span>
              </p>
            </div>
          )}
          {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={5}
          className={`w-full px-4 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Ex: Provide detailed information about the product or service (condition, features, usage time, additional details)"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        <p className="mt-2 text-xs text-gray-500">A clear and detailed description helps attract potential buyers.</p>
      </div>
    </div>
  );
};

export default ListingBasics;

