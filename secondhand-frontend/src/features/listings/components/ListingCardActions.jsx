import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { listingService } from '../services/listingService';

const ListingCardActions = ({ listing, onChanged }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();

  const isOwner = user?.id === listing?.sellerId;
  if (!isOwner) return null;

  const handleEdit = (e) => {
    e.preventDefault();
    if (listing.type === 'VEHICLE') {
      navigate(ROUTES.VEHICLE_EDIT.replace(':id', listing.id));
    } else if (listing.type === 'ELECTRONICS') {
      navigate(ROUTES.ELECTRONIC_EDIT.replace(':id', listing.id));
    }
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    try {
      await listingService.deactivateListing(listing.id);
      onChanged && onChanged(listing.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Deactivate failed', err);
    }
  };

  const handleReactivate = async (e) => {
    e.preventDefault();
    try {
      await listingService.activateListing(listing.id);
      onChanged && onChanged(listing.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Reactivate failed', err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    notification.showConfirmation(
      'İlanı Sil',
      'İlanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      async () => {
        await listingService.deleteListing(listing.id);
        onChanged && onChanged(listing.id);
        notification.showSuccess('Başarılı', 'İlan silindi');
      },
      () => {}
    );
  };

  // Hide edit for SOLD listings
  const canEdit = listing.status !== 'SOLD';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit && (
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs"
          title="Düzenle"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m2 0h2m-6 4h6m-6 4h6m-6 4h6M7 7h.01M7 11h.01M7 15h.01" />
          </svg>
          <span>Düzenle</span>
        </button>
      )}

      {listing.status === 'ACTIVE' && (
        <button
          onClick={handleDeactivate}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs"
          title="Deactivate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M6 6l12 12" />
          </svg>
          <span>Deactivate</span>
        </button>
      )}

      {listing.status === 'INACTIVE' && (
        <button
          onClick={handleReactivate}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs"
          title="Reactivate"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Reactivate</span>
        </button>
      )}

      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs"
        title="Sil"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
        <span>Sil</span>
      </button>
    </div>
  );
};

export default ListingCardActions;


