import React from 'react';
import { formatCurrency } from '../../formatters.js';
import { Type, Tag, AlignLeft } from 'lucide-react';

const ListingBasics = ({ formData, errors = {}, onInputChange, enums, isEdit = false, showQuantity = true }) => {
  return (
    <div className="space-y-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Genel Bilgiler</h3>
          <p className="text-xs text-slate-500 mt-1 tracking-tight">Temel ilan bilgilerini girin</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
            İlan Başlığı <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-300 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'} text-slate-900 placeholder-slate-400 focus:outline-none transition-all tracking-tight`}
              placeholder="e.g., iPhone 13 Pro - Excellent Condition"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium tracking-tight">
              {formData.title?.length || 0}/100
            </div>
          </div>
          {errors.title && (
            <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
            Açıklama <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl border ${errors.description ? 'border-red-300 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'} text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none tracking-tight`}
              placeholder="Ürününüzü detaylı bir şekilde açıklayın. Durum, özellikler, kullanım geçmişi ve varsa kusurları belirtin..."
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium tracking-tight">
              {formData.description?.length || 0} karakter
            </div>
          </div>
          {errors.description && (
            <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Fiyatlandırma</h3>
          <p className="text-xs text-slate-500 mt-1 tracking-tight">Ürün fiyatını ve miktarını belirleyin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
              Fiyat <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                className={`block w-full px-4 py-3 pr-24 rounded-xl border ${errors.price ? 'border-red-300 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'} focus:outline-none transition-all tracking-tight`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={onInputChange}
                  className="h-full py-0 pl-3 pr-8 border-l border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium rounded-r-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:bg-slate-100 transition-colors cursor-pointer tracking-tight"
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
              <div className="mt-2 text-xs text-slate-600 font-medium tracking-tight">
                Önizleme: <span className="text-indigo-700 font-mono">{formatCurrency(parseFloat(formData.price), formData.currency)}</span>
              </div>
            )}
            {errors.price && (
              <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.price}</p>
            )}
          </div>

          {showQuantity && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3 tracking-tight">
                Miktar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity ?? ''}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.quantity ? 'border-red-300 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500'} focus:outline-none transition-all tracking-tight`}
                placeholder="e.g. 5"
                min="1"
                step="1"
              />
              {errors.quantity && (
                <p className="mt-2 text-xs text-red-600 tracking-tight">{errors.quantity}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingBasics;
