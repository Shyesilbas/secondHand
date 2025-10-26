import React, { useState, memo, useCallback } from 'react';
import useAddresses from '../hooks/useAddresses.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import AddressForm from './address/AddressForm.jsx';
import AddressCard from './address/AddressCard.jsx';

const AddressList = memo(() => {
  const { addresses, loading, error, addAddress, updateAddress, selectMainAddress, deleteAddress } = useAddresses();
  const { showSuccess, showError, showConfirmation } = useNotification();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateAddress, setShowUpdateAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [addError, setAddError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleAddAddress = useCallback(async (addressData) => {
    setAdding(true);
    setAddError(null);
    try {
      await addAddress(addressData);
      setShowAddAddress(false);
      showSuccess('Address Added', 'Address has been added successfully.');
    } catch (err) {
      setAddError('Failed to add address.');
    } finally {
      setAdding(false);
    }
  }, [addAddress, showSuccess]);

  const handleUpdateAddress = useCallback(async (addressData) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      await updateAddress(selectedAddress.id, addressData);
      setShowUpdateAddress(false);
      setSelectedAddress(null);
      showSuccess('Address Updated', 'Address has been updated successfully.');
    } catch (err) {
      setUpdateError('Failed to update address.');
    } finally {
      setUpdating(false);
    }
  }, [updateAddress, selectedAddress, showSuccess]);

  const handleSelectAsMain = useCallback(async (addressId) => {
    try {
      await selectMainAddress(addressId);
      showSuccess('Main Address Set', 'Address has been set as your main address successfully.');
    } catch (err) {
      console.error('Failed to select main address:', err);
      showError('Error', 'Failed to set main address. Please try again.');
    }
  }, [selectMainAddress, showSuccess, showError]);

  const handleDeleteAddress = useCallback((addressId, addressType) => {
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
  }, [deleteAddress, showConfirmation, showSuccess, showError]);

  const handleEditAddress = useCallback((address) => {
    setSelectedAddress({ ...address });
    setShowUpdateAddress(true);
  }, []);

  const handleCloseAddForm = useCallback(() => {
    setShowAddAddress(false);
    setAddError(null);
  }, []);

  const handleCloseUpdateForm = useCallback(() => {
    setShowUpdateAddress(false);
    setSelectedAddress(null);
    setUpdateError(null);
  }, []);

  const handleAddClick = useCallback(() => {
    setShowAddAddress(true);
  }, []);

  return (
    <div className="mt-10">
      <div className="flex items-center mb-6">
        <h2 className="text-xl font-semibold text-text-primary">Addresses</h2>
        <button
          className="ml-3 text-btn-primary hover:text-btn-primary-hover transition-colors"
          onClick={handleAddClick}
          title="Add Address"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <AddressForm
        isOpen={showAddAddress}
        onClose={handleCloseAddForm}
        onSubmit={handleAddAddress}
        isEditing={false}
        loading={adding}
        error={addError}
      />

      <AddressForm
        isOpen={showUpdateAddress}
        onClose={handleCloseUpdateForm}
        onSubmit={handleUpdateAddress}
        initialData={selectedAddress}
        isEditing={true}
        loading={updating}
        error={updateError}
      />

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
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetMain={handleSelectAsMain}
              onSelectAsMain={handleSelectAsMain}
            />
          ))}
        </div>
      )}
    </div>
  );
});

AddressList.displayName = 'AddressList';

export default AddressList;
