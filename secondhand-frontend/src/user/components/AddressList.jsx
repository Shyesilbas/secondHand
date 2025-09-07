import React, { useState } from 'react';
import useAddresses from '../hooks/useAddresses.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const defaultAddress = {
  addressLine: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  addressType: 'HOME',
  mainAddress: false,
};

const AddressList = () => {
  const { addresses, loading, error, addAddress, updateAddress, selectMainAddress, deleteAddress } = useAddresses();
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateAddress, setShowUpdateAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState(defaultAddress);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [addError, setAddError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      await addAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress(defaultAddress);
    } catch (err) {
      setAddError('Failed to add address.');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError(null);
    try {
      await updateAddress(selectedAddress.id, selectedAddress);
      setShowUpdateAddress(false);
      setSelectedAddress(null);
    } catch (err) {
      setUpdateError('Failed to update address.');
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectAsMain = async (addressId) => {
    try {
      await selectMainAddress(addressId);
      showSuccess('Main Address Set', 'Address has been set as your main address successfully.');
    } catch (err) {
      console.error('Failed to select main address:', err);
      showError('Error', 'Failed to set main address. Please try again.');
    }
  };

  const handleDeleteAddress = (addressId, addressType) => {
    showConfirmation(
      'Delete Address',
      `Are you sure you want to delete this ${addressType.toLowerCase()} address? This action cannot be undone.`,
      async () => {
        try {
          await deleteAddress(addressId);
          showSuccess('Address Deleted', 'Address has been deleted successfully.');
        } catch (err) {
          console.error('Failed to delete address:', err);
          showError('Error', 'Failed to delete address. Please try again.');
        }
      }
    );
  };

  const openUpdateModal = (address) => {
    setSelectedAddress({ ...address });
    setShowUpdateAddress(true);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Addresses</h2>
        <button
          className="ml-3 text-btn-primary hover:text-btn-primary-hover transition-colors"
          onClick={() => setShowAddAddress(true)}
          title="Add Address"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {showAddAddress && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddAddress(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-text-primary">Add New Address</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={() => setShowAddAddress(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleAddAddress}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                  placeholder="Enter your address"
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
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
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                  value={newAddress.addressType}
                  onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
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
                  checked={newAddress.mainAddress}
                  onChange={(e) => setNewAddress({ ...newAddress, mainAddress: e.target.checked })}
                />
                <label htmlFor="mainAddress" className="text-sm font-medium text-gray-700">
                  Set as main address
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={adding}
                >
                  {adding ? 'Adding...' : 'Save Address'}
                </button>
              </div>
              
              {addError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{addError}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Update Address Modal */}
      {showUpdateAddress && selectedAddress && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpdateAddress(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-text-primary">Update Address</h3>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                onClick={() => setShowUpdateAddress(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4" onSubmit={handleUpdateAddress}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                  placeholder="Enter your address"
                  value={selectedAddress.addressLine}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, addressLine: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="City"
                    value={selectedAddress.city}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="State"
                    value={selectedAddress.state}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, state: e.target.value })}
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
                    value={selectedAddress.postalCode}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, postalCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                    placeholder="Country"
                    value={selectedAddress.country}
                    onChange={(e) => setSelectedAddress({ ...selectedAddress, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-btn-primary focus:border-transparent transition-all"
                  value={selectedAddress.addressType}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, addressType: e.target.value })}
                >
                  <option value="HOME">🏠 Home</option>
                  <option value="WORK">🏢 Work</option>
                  <option value="OTHER">📍 Other</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="updateMainAddress"
                  className="w-4 h-4 text-btn-primary bg-gray-100 border-gray-300 rounded focus:ring-btn-primary"
                  checked={selectedAddress.mainAddress}
                  onChange={(e) => setSelectedAddress({ ...selectedAddress, mainAddress: e.target.checked })}
                />
                <label htmlFor="updateMainAddress" className="text-sm font-medium text-gray-700">
                  Set as main address
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateAddress(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Address'}
                </button>
              </div>
              
              {updateError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{updateError}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-btn-primary"></div>
          <p className="mt-2 text-gray-600">Loading addresses...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500">Failed to load addresses.</div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">No addresses found. Add your first address!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-lg border shadow-sm bg-white transition-all hover:shadow-md ${
                addr.mainAddress ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {addr.addressType}
                    {addr.mainAddress && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Main
                      </span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {addr.addressLine}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openUpdateModal(addr)}
                    className="text-gray-500 hover:text-btn-primary transition-colors p-1"
                    title="Update Address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id, addr.addressType)}
                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    title="Delete Address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {!addr.mainAddress && (
                    <button
                      onClick={() => handleSelectAsMain(addr.id)}
                      className="text-xs px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors"
                      title="Set as Main Address"
                    >
                      Set Main
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
