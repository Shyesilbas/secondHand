
export const EMAIL_TYPES = {
    VERIFICATION_CODE: 'VERIFICATION_CODE',
    PASSWORD_RESET: 'PASSWORD_RESET',
    WELCOME: 'WELCOME',
    NOTIFICATION: 'NOTIFICATION',
    OFFER_RECEIVED: 'OFFER_RECEIVED',
    OFFER_COUNTER_RECEIVED: 'OFFER_COUNTER_RECEIVED',
    OFFER_ACCEPTED: 'OFFER_ACCEPTED',
    OFFER_REJECTED: 'OFFER_REJECTED',
    OFFER_EXPIRED: 'OFFER_EXPIRED',
    OFFER_COMPLETED: 'OFFER_COMPLETED',
    PROMOTIONAL: 'PROMOTIONAL',
    PAYMENT_VERIFICATION: 'PAYMENT_VERIFICATION',
    AGREEMENT_UPDATED: 'AGREEMENT_UPDATED',
    SYSTEM: 'SYSTEM',
    ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
    MEMBERSHIP_ACTIVATED: 'MEMBERSHIP_ACTIVATED',
    PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
    NEW_LISTING_NOTIFICATION: 'NEW_LISTING_NOTIFICATION'
};

export const EmailDto = (data) => ({
    id: data.id || null,
    recipientEmail: data.recipientEmail || '',
    senderEmail: data.senderEmail || '',
    subject: data.subject || '',
    content: data.content || '',
    emailType: data.emailType || EMAIL_TYPES.SYSTEM,
    sentAt: data.sentAt || null,
    createdAt: data.createdAt || null,
    isRead: data.isRead || false
});


export const EMAIL_TYPE_LABELS = {
    [EMAIL_TYPES.VERIFICATION_CODE]: 'Verification Code',
    [EMAIL_TYPES.PASSWORD_RESET]: 'Password Reset',
    [EMAIL_TYPES.WELCOME]: 'Welcome Email',
    [EMAIL_TYPES.NOTIFICATION]: 'Notification',
    [EMAIL_TYPES.OFFER_RECEIVED]: 'Offer Received',
    [EMAIL_TYPES.OFFER_COUNTER_RECEIVED]: 'Counter Offer',
    [EMAIL_TYPES.OFFER_ACCEPTED]: 'Offer Accepted',
    [EMAIL_TYPES.OFFER_REJECTED]: 'Offer Rejected',
    [EMAIL_TYPES.OFFER_EXPIRED]: 'Offer Expired',
    [EMAIL_TYPES.OFFER_COMPLETED]: 'Offer Completed',
    [EMAIL_TYPES.PROMOTIONAL]: 'Promotional',
    [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'Payment Verification',
    [EMAIL_TYPES.AGREEMENT_UPDATED]: 'Agreement Update',
    [EMAIL_TYPES.SYSTEM]: 'System Email',
    [EMAIL_TYPES.ORDER_CONFIRMATION]: 'Order Confirmation',
    [EMAIL_TYPES.MEMBERSHIP_ACTIVATED]: 'Premium Membership',
    [EMAIL_TYPES.PAYMENT_RECEIPT]: 'Payment Receipt',
    [EMAIL_TYPES.NEW_LISTING_NOTIFICATION]: 'New Listing Alert'
};

export const EMAIL_TYPE_BADGE_COLORS = {
    [EMAIL_TYPES.VERIFICATION_CODE]: 'bg-primary-50 text-primary',
    [EMAIL_TYPES.PASSWORD_RESET]: 'bg-status-warning-bg text-status-warning-text',
    [EMAIL_TYPES.WELCOME]: 'bg-status-success-bg text-status-success-text',
    [EMAIL_TYPES.NOTIFICATION]: 'bg-primary-50 text-primary',
    [EMAIL_TYPES.OFFER_RECEIVED]: 'bg-status-success-bg text-emerald-800',
    [EMAIL_TYPES.OFFER_COUNTER_RECEIVED]: 'bg-status-success-bg text-emerald-800',
    [EMAIL_TYPES.OFFER_ACCEPTED]: 'bg-status-success-bg text-emerald-800',
    [EMAIL_TYPES.OFFER_REJECTED]: 'bg-rose-100 text-rose-800',
    [EMAIL_TYPES.OFFER_EXPIRED]: 'bg-tertiary text-gray-800',
    [EMAIL_TYPES.OFFER_COMPLETED]: 'bg-primary-50 text-primary',
    [EMAIL_TYPES.PROMOTIONAL]: 'bg-primary-50 text-primary',
    [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'bg-status-error-bg text-status-error-text',
    [EMAIL_TYPES.AGREEMENT_UPDATED]: 'bg-status-warning-bg text-amber-900',
    [EMAIL_TYPES.SYSTEM]: 'bg-tertiary text-gray-800',
    [EMAIL_TYPES.ORDER_CONFIRMATION]: 'bg-sky-100 text-sky-800',
    [EMAIL_TYPES.MEMBERSHIP_ACTIVATED]: 'bg-purple-100 text-purple-800',
    [EMAIL_TYPES.PAYMENT_RECEIPT]: 'bg-emerald-100 text-emerald-800',
    [EMAIL_TYPES.NEW_LISTING_NOTIFICATION]: 'bg-blue-100 text-blue-800'
};
