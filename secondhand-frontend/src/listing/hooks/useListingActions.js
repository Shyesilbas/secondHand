import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { listingService } from '../services/listingService.js';
import { useListingActionContext } from '../context/ListingActionContext.jsx';
import { parseError } from '../../common/errorHandler.js';

export const useListingActions = ({
  listing,
  onChanged,
  onCloseMenu,
} = {}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const actionCtx = useListingActionContext();

  const listingId = listing?.id;

  const closeMenu = useCallback(() => {
    onCloseMenu?.();
  }, [onCloseMenu]);

  const fireChanged = useCallback(() => {
    if (!listingId) return;
    onChanged?.(listingId);
  }, [listingId, onChanged]);

  const handleApiError = useCallback((title, err) => {
    const parsedError = parseError(err);
    
    notification.showError(
      title,
      parsedError.message, // Backend'den gelen user-friendly message
      {
        errorCode: parsedError.errorCode,
        validationErrors: parsedError.validationErrors,
        autoClose: false
      }
    );
  }, [notification]);

  const wrap = useCallback(
    (fn) => (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      closeMenu();
      return fn();
    },
    [closeMenu]
  );

  const handleEdit = useMemo(
    () =>
      wrap(() => {
        if (!listingId) return;
        navigate(ROUTES.EDIT_LISTING(listingId));
      }),
    [listingId, navigate, wrap]
  );

  const handlePayListingFee = useMemo(
    () =>
      wrap(() => {
        if (!listingId) return;
        navigate(`${ROUTES.PAY_LISTING_FEE}?listingId=${listingId}`);
      }),
    [listingId, navigate, wrap]
  );

  const handleDeactivate = useMemo(
    () =>
      wrap(async () => {
        if (!listingId) return;
        try {
          await listingService.deactivateListing(listingId);
          notification.showSuccess('Successful', 'Listing deactivated');
          fireChanged();
        } catch (err) {
          handleApiError('Deactivate Failed', err);
        }
      }),
    [fireChanged, handleApiError, listingId, notification, wrap]
  );

  const handleReactivate = useMemo(
    () =>
      wrap(async () => {
        if (!listingId) return;
        try {
          await listingService.activateListing(listingId);
          notification.showSuccess('Successful', 'Listing reactivated');
          fireChanged();
        } catch (err) {
          handleApiError('Reactivate Failed', err);
        }
      }),
    [fireChanged, handleApiError, listingId, notification, wrap]
  );

  const handleMarkAsSold = useMemo(
    () =>
      wrap(() => {
        if (!listingId) return;
        notification.showConfirmation(
          'Mark As Sold?',
          'Are you sure you want to mark this listing as sold? This action cannot be reverted.',
          async () => {
            try {
              await listingService.markListingSold(listingId);
              notification.showSuccess('Successful', 'Listing marked as sold');
              fireChanged();
            } catch (err) {
              handleApiError('Mark As Sold Failed', err);
            }
          },
          () => {}
        );
      }),
    [fireChanged, handleApiError, listingId, notification, wrap]
  );

  const handleDelete = useMemo(
    () =>
      wrap(() => {
        if (!listingId) return;
        notification.showConfirmation(
          'Delete Listing',
          'Are you sure you want to delete this listing? This action cannot be reverted.',
          async () => {
            try {
              await listingService.deleteListing(listingId);
              notification.showSuccess('Successful', 'Listing deleted');
              fireChanged();
            } catch (err) {
              handleApiError('Delete Failed', err);
            }
          },
          () => {}
        );
      }),
    [fireChanged, handleApiError, listingId, notification, wrap]
  );

  const handleOpenShowcase = useMemo(
    () =>
      wrap(() => {
        if (!listing) return;
        actionCtx?.openAction?.('showcase', listing);
      }),
    [actionCtx, listing, wrap]
  );

  const handleOpenCampaign = useMemo(
    () =>
      wrap(() => {
        if (!listing) return;
        actionCtx?.openAction?.('campaign', listing);
      }),
    [actionCtx, listing, wrap]
  );

  return {
    handleEdit,
    handlePayListingFee,
    handleDeactivate,
    handleReactivate,
    handleMarkAsSold,
    handleDelete,
    handleOpenShowcase,
    handleOpenCampaign,
  };
};

