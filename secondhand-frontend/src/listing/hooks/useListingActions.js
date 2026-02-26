import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {useNotification} from '../../notification/NotificationContext.jsx';
import {listingService} from '../services/listingService.js';
import {useListingActionContext} from '../context/ListingActionContext.jsx';
import {parseError} from '../../common/errorHandler.js';

export const useListingActions = ({
  listing,
  onChanged,
  onCloseMenu,
} = {}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const actionCtx = useListingActionContext();

  const listingId = listing?.id;

  const dismiss = useCallback((e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onCloseMenu?.();
  }, [onCloseMenu]);

  const fireChanged = useCallback(() => {
    if (listingId) onChanged?.(listingId);
  }, [listingId, onChanged]);

  const handleApiError = useCallback((title, err) => {
    const parsedError = parseError(err);
    notification.showError(title, parsedError.message, {
      errorCode: parsedError.errorCode,
      validationErrors: parsedError.validationErrors,
      autoClose: false,
    });
  }, [notification]);

  const handleEdit = useCallback((e) => {
    dismiss(e);
    if (listingId) navigate(ROUTES.EDIT_LISTING(listingId));
  }, [dismiss, listingId, navigate]);

  const handlePayListingFee = useCallback((e) => {
    dismiss(e);
    if (listingId) navigate(`${ROUTES.PAY_LISTING_FEE}?listingId=${listingId}`);
  }, [dismiss, listingId, navigate]);

  const handleDeactivate = useCallback(async (e) => {
    dismiss(e);
    if (!listingId) return;
    try {
      await listingService.deactivateListing(listingId);
      notification.showSuccess('Successful', 'Listing deactivated');
      fireChanged();
    } catch (err) {
      handleApiError('Deactivate Failed', err);
    }
  }, [dismiss, fireChanged, handleApiError, listingId, notification]);

  const handleReactivate = useCallback(async (e) => {
    dismiss(e);
    if (!listingId) return;
    try {
      await listingService.activateListing(listingId);
      notification.showSuccess('Successful', 'Listing reactivated');
      fireChanged();
    } catch (err) {
      handleApiError('Reactivate Failed', err);
    }
  }, [dismiss, fireChanged, handleApiError, listingId, notification]);

  const handleMarkAsSold = useCallback((e) => {
    dismiss(e);
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
  }, [dismiss, fireChanged, handleApiError, listingId, notification]);

  const handleDelete = useCallback((e) => {
    dismiss(e);
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
  }, [dismiss, fireChanged, handleApiError, listingId, notification]);

  const handleOpenShowcase = useCallback((e) => {
    dismiss(e);
    if (listing) actionCtx?.openAction?.('showcase', listing);
  }, [actionCtx, dismiss, listing]);

  const handleOpenCampaign = useCallback((e) => {
    dismiss(e);
    if (listing) actionCtx?.openAction?.('campaign', listing);
  }, [actionCtx, dismiss, listing]);

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

