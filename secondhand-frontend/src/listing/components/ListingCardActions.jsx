import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useShowcaseQuery } from '../../showcase/hooks/useShowcaseQuery.js';
import { listingService } from '../services/listingService.js';
import ShowcaseModal from '../../showcase/components/ShowcaseModal.jsx';
import ReactDOM from 'react-dom';

const ListingCardActions = ({ listing, onChanged }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
  const { isInShowcase } = useShowcaseQuery();

  const isOwner = user?.id === listing?.sellerId;
  if (!isOwner) return null;

  const listingInShowcase = isInShowcase(listing.id);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(ROUTES.EDIT_LISTING(listing.id));
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await listingService.deactivateListing(listing.id);
      onChanged && onChanged(listing.id);
    } catch (err) {
      console.error('Deactivate failed', err);
    }
  };

  const handleReactivate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await listingService.activateListing(listing.id);
      onChanged && onChanged(listing.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Reactivate failed', err);
    }
  };

  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    notification.showConfirmation(
        'Mark As Sold?',
        'Are you sure you want to mark this listing as sold? This action cannot be reverted.',
        async() => {
          await listingService.markListingSold(listing.id);
          onChanged && onChanged(listing.id);
          notification.showSuccess('Successful', 'Listing Mark As Sold');
        },
        () => {}
    );
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    notification.showConfirmation(
      'Delete Listings',
      'Are you sure you want to delete this listing? This action cannot be reverted.',
      async () => {
        await listingService.deleteListing(listing.id);
        onChanged && onChanged(listing.id);
        notification.showSuccess('Successful', 'Listing Deleted');
      },
      () => {}
    );
  };

  const handleShowcase = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Showcase açılıyor, listingId:', listing.id);
    setIsShowcaseModalOpen(true);
  };

  const handleShowcaseSuccess = () => {
    onChanged && onChanged(listing.id);
    notification.showSuccess('Successful', 'Listing added to showcase successfully!');
  };

  // Hide edit for SOLD listings
  const canEdit = listing.status !== 'SOLD';

  return (
    <>
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
            <span>Edit</span>
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
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
          <span>Delete</span>
        </button>

        {listing.status !== 'SOLD' && (
          <button
            onClick={handleMarkAsSold}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 text-xs"
            title="Mark As Sold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Mark As Sold</span>
          </button>
        )}

        {listing.status === 'ACTIVE' && !listingInShowcase && (
          <button
            onClick={handleShowcase}
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs"
            title="Add to Showcase"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span>Showcase</span>
          </button>
        )}
      </div>
      {isShowcaseModalOpen && ReactDOM.createPortal(
        <ShowcaseModal
          isOpen={isShowcaseModalOpen}
          onClose={() => setIsShowcaseModalOpen(false)}
          listingId={listing.id}
          listingTitle={listing.title}
          onSuccess={handleShowcaseSuccess}
        />,
        document.body
      )}
    </>
  );
};

export default ListingCardActions;


