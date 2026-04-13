import { useCallback, useState } from 'react';
import { ORDER_LIMITS, ORDER_MESSAGES } from '../constants/orderUiConstants.js';
import { orderService } from '../services/orderService.js';

export const useOrderDetailActions = ({
  isSellerView,
  selectedOrder,
  orderName,
  orderNotes,
  selectedShippingAddressId,
  selectedBillingAddressId,
  onReviewSuccess,
  notification,
  setIsEditingName,
  setOrderName,
  setIsEditingAddress,
  setIsEditingNotes,
}) => {
  const [isSavingName, setIsSavingName] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveName = useCallback(async () => {
    if (isSellerView) return;
    if (orderName.length > ORDER_LIMITS.ORDER_NAME_MAX_LENGTH) {
      notification.showError('Error', ORDER_MESSAGES.ORDER_NAME_TOO_LONG(ORDER_LIMITS.ORDER_NAME_MAX_LENGTH));
      return;
    }
    setIsSavingName(true);
    try {
      await orderService.updateOrderName(selectedOrder.id, orderName);
      setIsEditingName(false);
      notification.showSuccess('Success', 'Order name updated successfully');
      if (onReviewSuccess) onReviewSuccess();
    } catch (error) {
      notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.UPDATE_NAME_FAILED);
    } finally {
      setIsSavingName(false);
    }
  }, [isSellerView, orderName, notification, onReviewSuccess, selectedOrder?.id, setIsEditingName]);

  const handleCancelEditName = useCallback(() => {
    setOrderName(selectedOrder?.name || '');
    setIsEditingName(false);
  }, [selectedOrder?.name, setOrderName, setIsEditingName]);

  const handleCancelOrder = useCallback(async (payload) => {
    if (isSellerView || isProcessing) return;
    setIsProcessing(true);
    try {
      await orderService.cancelOrder(selectedOrder.id, payload);
      notification.showSuccess('Success', 'Order cancelled successfully');
      if (onReviewSuccess) onReviewSuccess();
    } catch (error) {
      notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.CANCEL_ORDER_FAILED);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isSellerView, notification, onReviewSuccess, selectedOrder?.id]);

  const handleRefundOrder = useCallback(async (payload) => {
    if (isSellerView || isProcessing) return;
    setIsProcessing(true);
    try {
      await orderService.refundOrder(selectedOrder.id, payload);
      notification.showSuccess('Success', 'Refund requested successfully');
      if (onReviewSuccess) onReviewSuccess();
    } catch (error) {
      notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.REQUEST_REFUND_FAILED);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isSellerView, notification, onReviewSuccess, selectedOrder?.id]);

  const handleCompleteOrder = useCallback(() => {
    if (isSellerView || isProcessing) return;
    notification.showConfirmation(
      ORDER_MESSAGES.CONFIRM_ORDER_MODAL_TITLE,
      ORDER_MESSAGES.CONFIRM_ORDER_MODAL_BODY,
      async () => {
        setIsProcessing(true);
        try {
          await orderService.completeOrder(selectedOrder.id);
          notification.showSuccess('Success', 'Order completed successfully');
          if (onReviewSuccess) onReviewSuccess();
        } catch (error) {
          notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.COMPLETE_ORDER_FAILED);
        } finally {
          setIsProcessing(false);
        }
      },
      {
        confirmLabel: ORDER_MESSAGES.CONFIRM_ORDER_BUTTON,
        cancelLabel: ORDER_MESSAGES.CANCEL_ORDER_BUTTON,
      }
    );
  }, [isProcessing, isSellerView, notification, onReviewSuccess, selectedOrder?.id]);

  const handleSaveAddress = useCallback(async () => {
    if (!selectedShippingAddressId) {
      notification.showError('Error', 'Please select a shipping address');
      return;
    }
    setIsSavingAddress(true);
    try {
      await orderService.updateOrderAddress(selectedOrder.id, selectedShippingAddressId, selectedBillingAddressId);
      setIsEditingAddress(false);
      notification.showSuccess('Success', 'Order address updated successfully');
      if (onReviewSuccess) onReviewSuccess();
    } catch (error) {
      notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.UPDATE_ADDRESS_FAILED);
    } finally {
      setIsSavingAddress(false);
    }
  }, [
    notification,
    onReviewSuccess,
    selectedBillingAddressId,
    selectedOrder?.id,
    selectedShippingAddressId,
    setIsEditingAddress,
  ]);

  const handleSaveNotes = useCallback(async () => {
    if (orderNotes.length > ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH) {
      notification.showError('Error', ORDER_MESSAGES.ORDER_NOTES_TOO_LONG(ORDER_LIMITS.ORDER_NOTES_MAX_LENGTH));
      return;
    }
    setIsSavingNotes(true);
    try {
      await orderService.updateOrderNotes(selectedOrder.id, orderNotes);
      setIsEditingNotes(false);
      notification.showSuccess('Success', 'Order notes updated successfully');
      if (onReviewSuccess) onReviewSuccess();
    } catch (error) {
      notification.showError('Error', error?.response?.data?.message || ORDER_MESSAGES.UPDATE_NOTES_FAILED);
    } finally {
      setIsSavingNotes(false);
    }
  }, [notification, onReviewSuccess, orderNotes, selectedOrder?.id, setIsEditingNotes]);

  return {
    flags: {
      isSavingName,
      isProcessing,
      isSavingAddress,
      isSavingNotes,
    },
    actions: {
      handleSaveName,
      handleCancelEditName,
      handleCancelOrder,
      handleRefundOrder,
      handleCompleteOrder,
      handleSaveAddress,
      handleSaveNotes,
    },
  };
};
