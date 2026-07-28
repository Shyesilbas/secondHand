import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Save, CheckCircle2 } from 'lucide-react';
import { USER_ADDRESS_TYPES } from '../../userConstants.js';
import LocationFields from '../../../common/components/forms/LocationFields.jsx';

const defaultAddress = {
  addressLine: '',
  city: '',
  cityKey: '',
  district: '',
  districtKey: '',
  neighborhoodKey: '',
  state: '',
  postalCode: '',
  country: 'Türkiye',
  addressType: USER_ADDRESS_TYPES.HOME,
  mainAddress: false
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium';

const AddressForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  loading = false,
  error = null
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(defaultAddress);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...defaultAddress,
        ...initialData,
        country: initialData.country || 'Türkiye'
      });
    } else {
      setFormData(defaultAddress);
    }
  }, [isEditing, initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async e => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChangeEvent = e => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: value
      };
      if (name === 'district') {
        next.state = value;
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-[addressModalFade_0.2s_ease-out]" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl animate-[addressModalScale_0.2s_ease-out] z-10" role="dialog" aria-modal="true" aria-labelledby="address-form-title">
        
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white shadow-xs">
                <MapPin className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <h3 id="address-form-title" className="text-base font-black text-white tracking-tight">
                  {isEditing ? t("update_address", "Adresi Güncelle") : t("add_new_address", "Yeni Adres Ekle")}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-emerald-100/90">{t("delivery_and_billing_details", "Teslimat ve fatura bilgilerinizi girin")}</p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
              onClick={onClose}
              aria-label={t("close", "Kapat")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form className="flex min-h-0 flex-1 flex-col bg-slate-50/50" onSubmit={handleSubmit}>
          <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
            
            {/* Address Line */}
            <div>
              <label htmlFor="address-line" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                {t("address_line", "Açık Adres")} <span className="text-rose-500">*</span>
              </label>
              <input
                id="address-line"
                className={inputClass}
                placeholder={t("street_building_apartment", "Mahalle, Cadde, Sokak, Bina No, Daire No")}
                value={formData.addressLine}
                onChange={e => handleInputChange('addressLine', e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* City / District / Neighborhood Cascading Selectors */}
            <div className="mb-5">
              <LocationFields formData={formData} errors={{}} onInputChange={handleInputChangeEvent} />
            </div>

            {/* Postal Code & Country */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="address-postal" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {t("postal_code", "Posta Kodu")} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="address-postal"
                  className={inputClass}
                  placeholder={t("postal_code", "34000")}
                  value={formData.postalCode}
                  onChange={e => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="address-country" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {t("country", "Ülke")} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="address-country"
                  className={inputClass}
                  placeholder={t("country", "Türkiye")}
                  value={formData.country}
                  onChange={e => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Address Type */}
            <div>
              <label htmlFor="address-type" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                {t("address_type", "Adres Başlığı / Tipi")}
              </label>
              <select
                id="address-type"
                className={`${inputClass} cursor-pointer`}
                value={formData.addressType}
                onChange={e => handleInputChange('addressType', e.target.value)}
              >
                <option value={USER_ADDRESS_TYPES.HOME}>🏠 {t("home", "Ev Adresi")}</option>
                <option value={USER_ADDRESS_TYPES.WORK}>🏢 {t("work", "İş Yeri Adresi")}</option>
                <option value={USER_ADDRESS_TYPES.OTHER}>📍 {t("other", "Diğer")}</option>
              </select>
            </div>

            {/* Set as Main Address */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-slate-300">
              <input
                type="checkbox"
                className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500/20"
                checked={formData.mainAddress}
                onChange={e => handleInputChange('mainAddress', e.target.checked)}
              />
              <span className="text-xs leading-relaxed text-slate-600">
                <span className="font-extrabold text-slate-900 block text-sm">{t("main_address", "Varsayılan Adres Olarak Ayarla")}</span>
                <span className="mt-0.5 block text-slate-500 font-medium">{t("use_as_default_for_checkout_and_delivery", "Tüm sipariş ve faturalandırma işlemlerinde varsayılan adresiniz seçilsin.")}</span>
              </span>
            </label>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs font-bold text-rose-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-extrabold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[7.5rem] cursor-pointer"
              >
                {t("cancel", "İptal")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[10rem] cursor-pointer active:scale-[0.98]"
              >
                <Save className="h-4 w-4 shrink-0" aria-hidden />
                {loading
                  ? isEditing ? t("updating", "Güncelleniyor...") : t("saving", "Kaydediliyor...")
                  : isEditing ? t("save_changes", "Değişiklikleri Kaydet") : t("save_address", "Adresi Kaydet")}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes addressModalFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes addressModalScale {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
};

export default AddressForm;