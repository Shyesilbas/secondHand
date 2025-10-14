import React, { useState, useRef, useEffect } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isInShowcase } = useShowcaseQuery();
  const dropdownRef = useRef(null);

  const isOwner = user?.id === listing?.sellerId;
  if (!isOwner) return null;

  const listingInShowcase = isInShowcase(listing.id);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    navigate(ROUTES.EDIT_LISTING(listing.id));
  };

  const handleDeactivate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
    try {
      await listingService.activateListing(listing.id);
      onChanged && onChanged(listing.id);
    } catch (err) {
            console.error('Reactivate failed', err);
    }
  };

  const handleMarkAsSold = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
    console.log('Showcase açılıyor, listingId:', listing.id);
    setIsShowcaseModalOpen(true);
  };

  const handleShowcaseSuccess = () => {
    onChanged && onChanged(listing.id);
    notification.showSuccess('Successful', 'Listing added to showcase successfully!');
  };

  const handlePayListingFee = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(false);
    navigate(`${ROUTES.PAY_LISTING_FEE}?listingId=${listing.id}`);
  };

  const canEdit = listing.status !== 'SOLD';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm"
          title="Actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {canEdit && (
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            )}

            {listing.status === 'DRAFT' && (
              <button
                onClick={handlePayListingFee}
                className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Fee
              </button>
            )}

            {listing.status === 'ACTIVE' && (
              <button
                onClick={handleDeactivate}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M6 6l12 12" />
                </svg>
                Deactivate
              </button>
            )}

            {listing.status === 'INACTIVE' && (
              <button
                onClick={handleReactivate}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reactivate
              </button>
            )}

            {listing.status !== 'SOLD' && (
              <button
                onClick={handleMarkAsSold}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark As Sold
              </button>
            )}

            {listing.status === 'ACTIVE' && !listingInShowcase && (
              <button
                onClick={handleShowcase}
                className="w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Add to Showcase
              </button>
            )}

            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </button>
          </div>
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


