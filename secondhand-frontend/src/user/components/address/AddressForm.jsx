import React, { useState, useEffect } from 'react';

const defaultAddress = {
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  addressType: 'HOME',
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-text-primary">
            {isEditing ? 'Update Address' : 'Add New Address'}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
              placeholder="Enter your address"
              value={formData.addressLine}
              onChange={(e) => handleInputChange('addressLine', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                placeholder="Country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
              value={formData.addressType}
              onChange={(e) => handleInputChange('addressType', e.target.value)}
            >
              <option value="HOME">🏠 Home</option>
              <option value="WORK">🏢 Work</option>
              <option value="OTHER">📍 Other</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="mainAddress"
              className="w-4 h-4 text-btn-primary bg-gray-100 border-gray-300 rounded focus:ring-btn-primary"
              checked={formData.mainAddress}
              onChange={(e) => handleInputChange('mainAddress', e.target.checked)}
            />
            <label htmlFor="mainAddress" className="text-sm font-medium text-gray-700">
              Set as main address
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Address' : 'Save Address')}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddressForm;