import {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
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
 const {t} = useTranslation();
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
 notification.showSuccess(t('success', 'Başarılı'), t('listing_deactivated', 'İlan pasife alındı.'));
 fireChanged();
 } catch (err) {
 handleApiError(t('deactivate_failed', 'İlan pasife alınamadı'), err);
 }
 }, [dismiss, fireChanged, handleApiError, listingId, notification, t]);

 const handleReactivate = useCallback(async (e) => {
 dismiss(e);
 if (!listingId) return;
 try {
 await listingService.activateListing(listingId);
 notification.showSuccess(t('success', 'Başarılı'), t('listing_reactivated', 'İlan tekrar yayında.'));
 fireChanged();
 } catch (err) {
 handleApiError(t('reactivate_failed', 'İlan yayına alınamadı'), err);
 }
 }, [dismiss, fireChanged, handleApiError, listingId, notification, t]);

 const handleMarkAsSold = useCallback((e) => {
 dismiss(e);
 if (!listingId) return;
 notification.showConfirmation(
 t('mark_as_sold_confirm_title', 'Satıldı olarak işaretlensin mi?'),
 t('mark_as_sold_confirm_body', 'İlan satıştan kalkar. Bu işlem geri alınamaz.'),
 async () => {
 try {
 await listingService.markListingSold(listingId);
 notification.showSuccess(t('success', 'Başarılı'), t('listing_marked_sold', 'İlan satıldı olarak işaretlendi.'));
 fireChanged();
 } catch (err) {
 handleApiError(t('mark_as_sold_failed', 'İlan satıldı olarak işaretlenemedi'), err);
 }
 },
 () => {}
 );
 }, [dismiss, fireChanged, handleApiError, listingId, notification, t]);

 const handleRelist = useCallback(async (e) => {
 dismiss(e);
 if (!listingId) return;
 try {
 const response = await listingService.relistListing(listingId);
 notification.showSuccess(t('success', 'Başarılı'), t('listing_relisted', 'İlanın kopyası oluşturuldu. Düzenleyip yayınlayabilirsin.'));
 fireChanged();
 const newListingId = response?.data || response;
 if (newListingId) {
 navigate(ROUTES.EDIT_LISTING(newListingId));
 }
 } catch (err) {
 handleApiError(t('relist_failed', 'İlan tekrar yayınlanamadı'), err);
 }
 }, [dismiss, fireChanged, handleApiError, listingId, notification, navigate, t]);

 const handleDelete = useCallback((e) => {
 dismiss(e);
 if (!listingId) return;
 notification.showConfirmation(
 t('delete_listing_confirm_title', 'İlan silinsin mi?'),
 t('delete_listing_confirm_body', 'İlan kalıcı olarak kaldırılır. Bu işlem geri alınamaz.'),
 async () => {
 try {
 await listingService.deleteListing(listingId);
 notification.showSuccess(t('success', 'Başarılı'), t('listing_deleted', 'İlan silindi.'));
 fireChanged();
 } catch (err) {
 handleApiError(t('delete_failed', 'İlan silinemedi'), err);
 }
 },
 () => {}
 );
 }, [dismiss, fireChanged, handleApiError, listingId, notification, t]);

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
 handleRelist,
 handleDelete,
 handleOpenShowcase,
 handleOpenCampaign,
 };
};

