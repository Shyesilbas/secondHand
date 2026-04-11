import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, X, Save } from 'lucide-react';
import { USER_ADDRESS_TYPES } from '../../userConstants.js';

const defaultAddress = {
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  addressType: USER_ADDRESS_TYPES.HOME,
  mainAddress: false,
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const AddressForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState(defaultAddress);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[addressModalFade_0.2s_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-slate-950/5 animate-[addressModalScale_0.2s_ease-out]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-form-title"
      >
        <div className="shrink-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-800 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <MapPin className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 id="address-form-title" className="text-lg font-bold tracking-tight text-white sm:text-xl">
                  {isEditing ? 'Update address' : 'Add new address'}
                </h3>
                <p className="mt-0.5 text-sm text-indigo-100/90">
                  Delivery and billing details
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col bg-slate-50/40" onSubmit={handleSubmit}>
          <div className="custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
            <div>
              <label htmlFor="address-line" className="mb-2 block text-sm font-medium text-slate-700">
                Address line
              </label>
              <input
                id="address-line"
                className={inputClass}
                placeholder="Street, building, apartment"
                value={formData.addressLine}
                onChange={(e) => handleInputChange('addressLine', e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="address-city" className="mb-2 block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  id="address-city"
                  className={inputClass}
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="address-state" className="mb-2 block text-sm font-medium text-slate-700">
                  State / region
                </label>
                <input
                  id="address-state"
                  className={inputClass}
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="address-postal" className="mb-2 block text-sm font-medium text-slate-700">
                  Postal code
                </label>
                <input
                  id="address-postal"
                  className={inputClass}
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="address-country" className="mb-2 block text-sm font-medium text-slate-700">
                  Country
                </label>
                <input
                  id="address-country"
                  className={inputClass}
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address-type" className="mb-2 block text-sm font-medium text-slate-700">
                Address type
              </label>
              <select
                id="address-type"
                className={`${inputClass} cursor-pointer`}
                value={formData.addressType}
                onChange={(e) => handleInputChange('addressType', e.target.value)}
              >
                <option value={USER_ADDRESS_TYPES.HOME}>Home</option>
                <option value={USER_ADDRESS_TYPES.WORK}>Work</option>
                <option value={USER_ADDRESS_TYPES.OTHER}>Other</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500/30"
                checked={formData.mainAddress}
                onChange={(e) => handleInputChange('mainAddress', e.target.checked)}
              />
              <span className="text-sm leading-snug text-slate-700">
                <span className="font-medium text-slate-900">Main address</span>
                <span className="mt-0.5 block text-slate-500">
                  Use as default for checkout and delivery
                </span>
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-sm text-rose-800">{error}</p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto sm:min-w-[7.5rem]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[10rem]"
              >
                <Save className="h-4 w-4 shrink-0" aria-hidden />
                {loading ? (isEditing ? 'Updating…' : 'Saving…') : isEditing ? 'Save changes' : 'Save address'}
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
