import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Home, MapPin, Pencil, Trash2 } from 'lucide-react';
import { USER_ADDRESS_TYPES } from '../../userConstants.js';

const formatNeighborhood = (neighborhoodKey) => {
  if (!neighborhoodKey) return '';
  return neighborhoodKey
    .split('_')
    .pop()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const AddressCard = ({ address, onEdit, onDelete, onSelectAsMain }) => {
  const { t } = useTranslation();

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case USER_ADDRESS_TYPES.HOME:
        return Home;
      case USER_ADDRESS_TYPES.WORK:
        return Building2;
      case USER_ADDRESS_TYPES.OTHER:
      default:
        return MapPin;
    }
  };

  const getAddressTypeLabel = (type) => {
    switch (type) {
      case USER_ADDRESS_TYPES.HOME:
        return t('home', 'Ev');
      case USER_ADDRESS_TYPES.WORK:
        return t('work', 'İş');
      case USER_ADDRESS_TYPES.OTHER:
      default:
        return t('other', 'Diğer');
    }
  };

  const Icon = getAddressTypeIcon(address.addressType);
  const neighborhoodLabel = formatNeighborhood(address.neighborhoodKey);
  const locationParts = [
    neighborhoodLabel,
    address.state || address.district,
    address.city
  ].filter(Boolean);
  const postalCountryParts = [address.postalCode, address.country].filter(Boolean);

  return (
    <div
      className={`flex flex-col justify-between rounded border p-4 transition-colors ${
        address.mainAddress
          ? 'border-border bg-background-secondary/40'
          : 'border-border-light bg-background-primary hover:border-border'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Icon
              className="h-4 w-4 shrink-0 text-text-secondary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {getAddressTypeLabel(address.addressType)}
            </h3>
            {address.mainAddress && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-light bg-background-primary px-2 py-0.5 text-xs font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden="true" />
                <span>{t('main', 'Varsayılan')}</span>
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(address)}
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-background-tertiary hover:text-text-primary"
              title={t('update_address', 'Adresi düzenle')}
              aria-label={t('update_address', 'Adresi düzenle')}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(address.id, address.addressType)}
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-status-error-bg hover:text-status-error-text"
              title={t('delete_address', 'Adresi sil')}
              aria-label={t('delete_address', 'Adresi sil')}
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 space-y-1 text-xs sm:text-sm text-text-secondary">
          <p className="font-medium text-text-primary leading-snug">{address.addressLine}</p>
          {locationParts.length > 0 && <p>{locationParts.join(', ')}</p>}
          {postalCountryParts.length > 0 && (
            <p className="text-xs text-text-muted tabular-nums">
              {postalCountryParts.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {!address.mainAddress && (
        <div className="mt-3.5 border-t border-border-light pt-2.5 flex justify-end">
          <button
            type="button"
            onClick={() => onSelectAsMain(address.id)}
            className="text-xs font-medium text-text-secondary transition-colors hover:text-text-primary cursor-pointer"
            title={t('set_as_main_address', 'Varsayılan adres olarak ayarla')}
          >
            {t('set_main', 'Varsayılan Yap')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
