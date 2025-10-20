// Refund status constants
export const REFUND_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  APPROVED: 'APPROVED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

// Refund status labels (English)
export const REFUND_STATUS_LABELS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

// Refund status colors for UI
export const REFUND_STATUS_COLORS = {
  PENDING: 'yellow',
  PROCESSING: 'blue',
  APPROVED: 'green',
  COMPLETED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray'
};

// Refund status descriptions
export const REFUND_STATUS_DESCRIPTIONS = {
  PENDING: 'Your refund request has been created and is waiting to be processed',
  PROCESSING: 'Your refund is being processed. This usually takes about 1 hour',
  APPROVED: 'Your refund has been approved and will be completed shortly',
  COMPLETED: 'Refund completed successfully. Money has been refunded to your payment method',
  REJECTED: 'Your refund request has been rejected. Please check the reason below',
  CANCELLED: 'Your refund request has been cancelled'
};

// Payment method labels
export const REFUND_METHOD_LABELS = {
  CREDIT_CARD: 'Credit Card',
  TRANSFER: 'Bank Transfer',
  EWALLET: 'E-Wallet'
};

// Cancellation window in hours
export const CANCELLATION_WINDOW_HOURS = 1;

/**
 * Check if refund status is active
 */
export const isRefundActive = (status) => {
  return [REFUND_STATUS.PENDING, REFUND_STATUS.PROCESSING, REFUND_STATUS.APPROVED].includes(status);
};

/**
 * Check if refund status is completed
 */
export const isRefundCompleted = (status) => {
  return status === REFUND_STATUS.COMPLETED;
};

/**
 * Check if refund status is cancelled or rejected
 */
export const isRefundCancelledOrRejected = (status) => {
  return [REFUND_STATUS.CANCELLED, REFUND_STATUS.REJECTED].includes(status);
};

/**
 * Check if refund request can be cancelled
 */
export const canCancelRefund = (refund) => {
  return refund?.status === REFUND_STATUS.PENDING && refund?.canCancel === true;
};


