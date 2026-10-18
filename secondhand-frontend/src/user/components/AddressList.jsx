import { useTranslation } from "react-i18next";
import { memo, useCallback, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import useAddresses from '../hooks/useAddresses.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import AddressForm from './address/AddressForm.jsx';
import AddressCard from './address/AddressCard.jsx';
import { Button, EmptyState, SkeletonList } from '../../common/components/ui/index.js';
import logger from '../../common/utils/logger.js';

const AddressList = memo(({ isActive }) => {
  const { t } = useTranslation();
  const {
    addresses = [],
    loading,
    error,
    addAddress,
    updateAddress,
    selectMainAddress,
    deleteAddress
  } = useAddresses({ enabled: isActive });

  const { showSuccess, showError, showConfirmation } = useNotification();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showUpdateAddress, setShowUpdateAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [addError, setAddError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const handleAddAddress = useCallback(
    async (addressData) => {
      setAdding(true);
      setAddError(null);
      try {
        await addAddress(addressData);
        setShowAddAddress(false);
        showSuccess(
          t('address_added_title', 'Adres Eklendi'),
          t('address_added_desc', 'Adresiniz başarıyla eklendi.')
        );
      } catch (err) {
        logger.error('Failed to add address:', err);
        setAddError(t('failed_to_add_address', 'Adres eklenirken bir hata oluştu.'));
      } finally {
        setAdding(false);
      }
    },
    [addAddress, showSuccess, t]
  );

  const handleUpdateAddress = useCallback(
    async (addressData) => {
      setUpdating(true);
      setUpdateError(null);
      try {
        await updateAddress(selectedAddress.id, addressData);
        setShowUpdateAddress(false);
        setSelectedAddress(null);
        showSuccess(
          t('address_updated_title', 'Adres Güncellendi'),
          t('address_updated_desc', 'Adresiniz başarıyla güncellendi.')
        );
      } catch (err) {
        logger.error('Failed to update address:', err);
        setUpdateError(t('failed_to_update_address', 'Adres güncellenirken bir hata oluştu.'));
      } finally {
        setUpdating(false);
      }
    },
    [updateAddress, selectedAddress, showSuccess, t]
  );

  const handleSelectAsMain = useCallback(
    async (addressId) => {
      try {
        await selectMainAddress(addressId);
        showSuccess(
          t('main_address_set_title', 'Varsayılan Adres Belirlendi'),
          t('main_address_set_desc', 'Seçilen adres varsayılan teslimat adresi olarak ayarlandı.')
        );
      } catch (err) {
        logger.error('Failed to select main address:', err);
        showError('Error', err.response?.data?.message || t('failed_to_set_main_address', 'Varsayılan adres güncellenemedi.'));
      }
    },
    [selectMainAddress, showSuccess, showError, t]
  );

  const handleDeleteAddress = useCallback(
    (addressId) => {
      showConfirmation(
        t('delete_address_title', 'Adresi Sil'),
        t('delete_address_confirm', 'Bu adresi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
        async () => {
          try {
            await deleteAddress(addressId);
            showSuccess(
              t('address_deleted_title', 'Adres Silindi'),
              t('address_deleted_desc', 'Adresiniz başarıyla silindi.')
            );
          } catch (err) {
            logger.error('Failed to delete address:', err);
            showError('Error', err.response?.data?.message || t('failed_to_delete_address', 'Adres silinemedi.'));
          }
        }
      );
    },
    [deleteAddress, showConfirmation, showSuccess, showError, t]
  );

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
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted">
          {t('addresses_manage_helper', 'Kayıtlı teslimat ve fatura adreslerinizi buradan yönetebilirsiniz.')}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddClick}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          <span>{t('add_address', 'Yeni Adres Ekle')}</span>
        </Button>
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
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
          aria-busy="true"
          aria-label={t('loading_addresses', 'Adresler yükleniyor')}
        >
          <SkeletonList />
          <SkeletonList />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm font-medium text-status-error">
            {t('failed_to_load_addresses', 'Adresler yüklenemedi')}
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t('no_addresses_found', 'Kayıtlı adres bulunamadı')}
          description={t('no_addresses_found_add_your_first_addres', 'Siparişlerinizde kullanmak üzere yeni bir adres ekleyin.')}
          primaryAction={{
            label: t('add_address', 'Yeni Adres Ekle'),
            onClick: handleAddClick
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
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