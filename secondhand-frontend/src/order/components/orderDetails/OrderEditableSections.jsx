import { useTranslation } from "react-i18next";
import React, { useId } from 'react';
import Button from '../../../common/components/ui/Button.jsx';
import { Skeleton } from '../../../common/components/ui/index.js';
import { inputNormal } from '../../../common/components/forms/inputStyles.js';
import { ORDER_LIMITS } from '../../constants/orderUiConstants.js';

const AddressText = ({ address, fallback }) => {
  if (!address) return <p className="mt-1 text-sm text-text-tertiary">{fallback}</p>;
  return (
    <>
      <p className="mt-1 text-sm font-medium text-text-primary">{address.addressLine}</p>
      <p className="mt-0.5 text-sm text-text-secondary">{[address.city, address.postalCode].filter(Boolean).join(', ')}</p>
    </>
  );
};

const AddressSelect = ({ label, value, onChange, addresses, emptyLabel }) => {
  const selectId = useId();
  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm text-text-secondary">{label}</label>
      <select id={selectId} value={value || ''} onChange={onChange} className={`${inputNormal} h-10`}>
        <option value="">{emptyLabel}</option>
        {addresses.map(addr => (
          <option key={addr.id} value={addr.id}>{addr.addressLine} — {addr.city}, {addr.postalCode}</option>
        ))}
      </select>
    </div>
  );
};

// Shipping and billing address share one card; billing falls back to "same as shipping" when absent.
export const AddressSection = React.memo(({
  CardComponent: Card,
  isEditingAddress,
  addressesLoading,
  addresses,
  selectedShippingAddressId,
  selectedBillingAddressId,
  setSelectedShippingAddressId,
  setSelectedBillingAddressId,
  handleSaveAddress,
  handleCancelEditAddress,
  handleStartEditAddress,
  isSavingAddress,
  selectedOrder,
  isModifiable
}) => {
  const { t } = useTranslation();

  if (isEditingAddress) {
    return (
      <Card>
        <h3 className="mb-4 text-base font-semibold text-text-primary">{t('edit_addresses', 'Adresleri düzenle')}</h3>
        {addressesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <AddressSelect
              label={t('shipping_address', 'Teslimat adresi')}
              value={selectedShippingAddressId}
              onChange={e => setSelectedShippingAddressId(Number(e.target.value))}
              addresses={addresses}
              emptyLabel={t('select_address', 'Adres seçin')}
            />
            <AddressSelect
              label={t('billing_address_optional', 'Fatura adresi (isteğe bağlı)')}
              value={selectedBillingAddressId}
              onChange={e => setSelectedBillingAddressId(e.target.value ? Number(e.target.value) : null)}
              addresses={addresses}
              emptyLabel={t('same_as_shipping', 'Teslimat adresi ile aynı')}
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleCancelEditAddress} disabled={isSavingAddress}>
                {t('cancel', 'İptal')}
              </Button>
              <Button size="sm" onClick={handleSaveAddress} disabled={isSavingAddress || addressesLoading}>
                {isSavingAddress ? t('saving', 'Kaydediliyor...') : t('save_address', 'Adresi kaydet')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text-primary">{t('od_addresses', 'Adresler')}</h3>
        {isModifiable ? (
          <Button variant="ghost" size="sm" onClick={handleStartEditAddress}>
            {t('change_address', 'Adresi değiştir')}
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-sm text-text-tertiary">{t('shipping_address', 'Teslimat adresi')}</p>
          <AddressText address={selectedOrder.shippingAddress} fallback="—" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-text-tertiary">{t('od_billing_address', 'Fatura adresi')}</p>
          <AddressText address={selectedOrder.billingAddress} fallback={t('same_as_shipping', 'Teslimat adresi ile aynı')} />
        </div>
      </div>
    </Card>
  );
});
AddressSection.displayName = 'AddressSection';

// Hidden when the order has no note; a modifiable order keeps a text button to add one.
export const NotesSection = React.memo(({
  CardComponent: Card,
  isEditingNotes,
  orderNotes,
  setOrderNotes,
  handleSaveNotes,
  handleCancelEditNotes,
  handleStartEditNotes,
  isSavingNotes,
  selectedOrder,
  isModifiable
}) => {
  const { t } = useTranslation();
  const notesInputId = useId();

  if (isEditingNotes) {
    return (
      <Card>
        <label htmlFor={notesInputId} className="mb-3 block text-base font-semibold text-text-primary">
          {t('edit_order_notes', 'Sipariş notunu düzenle')}
        </label>
        <textarea
          id={notesInputId}
          value={orderNotes}
          onChange={e => setOrderNotes(e.target.value)}
          maxLength={ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH}
          rows={3}
          className={`${inputNormal} resize-none`}
          placeholder={t('add_a_note_to_your_order', 'Siparişinize bir not ekleyin')}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs tabular-nums text-text-tertiary">
            {orderNotes.length}/{ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancelEditNotes} disabled={isSavingNotes}>
              {t('cancel', 'İptal')}
            </Button>
            <Button size="sm" onClick={handleSaveNotes} disabled={isSavingNotes}>
              {isSavingNotes ? t('saving', 'Kaydediliyor...') : t('save_notes', 'Notu kaydet')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!selectedOrder.notes) {
    return isModifiable ? (
      <div>
        <Button variant="ghost" size="sm" onClick={handleStartEditNotes}>
          {t('od_add_note', 'Not ekle')}
        </Button>
      </div>
    ) : null;
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-text-primary">{t('order_notes', 'Sipariş notu')}</h3>
        {isModifiable ? (
          <Button variant="ghost" size="sm" onClick={handleStartEditNotes}>
            {t('od_edit_note', 'Notu düzenle')}
          </Button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm text-text-primary">{selectedOrder.notes}</p>
    </Card>
  );
});
NotesSection.displayName = 'NotesSection';
