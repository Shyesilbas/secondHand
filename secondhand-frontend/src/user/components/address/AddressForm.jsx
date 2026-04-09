import React, { useState, useEffect } from 'react';
import { Home, MapPin, Building2, X, Save } from 'lucide-react';
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

const AddressForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false,
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState(defaultAddress);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultAddress);
    }
  }, [isEditing, initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] p-4 sm:p-6 flex items-center justify-center bg-slate-900/65 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-24px_rgba(15,23,42,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {isEditing ? 'Update Address' : 'Add New Address'}
                </h3>
                <p className="text-xs text-slate-500">Delivery and billing details</p>
              </div>
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form className="overflow-y-auto max-h-[calc(92vh-154px)] px-6 py-5 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Line</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="Enter your address"
              value={formData.addressLine}
              onChange={(e) => handleInputChange('addressLine', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Postal Code</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address Type</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
              value={formData.addressType}
              onChange={(e) => handleInputChange('addressType', e.target.value)}
            >
              <option value={USER_ADDRESS_TYPES.HOME}>Home</option>
              <option value={USER_ADDRESS_TYPES.WORK}>Work</option>
              <option value={USER_ADDRESS_TYPES.OTHER}>Other</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="mainAddress"
              className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500"
              checked={formData.mainAddress}
              onChange={(e) => handleInputChange('mainAddress', e.target.checked)}
            />
            <label htmlFor="mainAddress" className="text-sm font-semibold text-slate-700">
              Set as main address
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-rose-600 text-sm">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Address' : 'Save Address')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;