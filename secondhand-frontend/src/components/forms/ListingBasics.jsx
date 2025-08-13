import React from 'react';

const ListingBasics = ({ formData, errors = {}, onInputChange, enums }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">İlan Başlığı *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          className={`w-full px-4 py-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
          placeholder="ör: 2020 BMW 320i Luxury Line"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fiyat *</label>
          <div className="flex">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onInputChange}
              className={`flex-1 px-4 py-3 border rounded-l-lg ${errors.price ? 'border-red-500' : 'border-slate-200'}`}
              placeholder="0"
            />
            <select
              name="currency"
              value={formData.currency}
              onChange={onInputChange}
              className="px-4 py-3 border border-l-0 border-slate-200 rounded-r-lg bg-slate-50"
            >
              {enums.currencies?.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.symbol} {currency.label}
                </option>
              ))}
            </select>
          </div>
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={5}
          className={`w-full px-4 py-3 border rounded-lg resize-none ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
          placeholder="Aracınızın detaylı açıklamasını yazın. Özellikler, durum, bakım geçmişi gibi bilgiler ekleyebilirsiniz..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        <p className="mt-2 text-xs text-slate-500">İyi bir açıklama potansiyel alıcıları çeker.</p>
      </div>
    </div>
  );
};

export default ListingBasics;

