
export const EMAIL_TYPES = {
    VERIFICATION_CODE: 'VERIFICATION_CODE',
    PASSWORD_RESET: 'PASSWORD_RESET',
    WELCOME: 'WELCOME',
    NOTIFICATION: 'NOTIFICATION',
    PROMOTIONAL: 'PROMOTIONAL',
    PAYMENT_VERIFICATION: 'PAYMENT_VERIFICATION',
    SYSTEM: 'SYSTEM'
};

export const EmailDto = (data) => ({
    id: data.id || null,
    recipientEmail: data.recipientEmail || '',
    senderEmail: data.senderEmail || '',
    subject: data.subject || '',
    content: data.content || '',
    emailType: data.emailType || EMAIL_TYPES.SYSTEM,
    sentAt: data.sentAt || null,
    createdAt: data.createdAt || null
});


export const EMAIL_TYPE_LABELS = {
    [EMAIL_TYPES.VERIFICATION_CODE]: 'Verification Code',
    [EMAIL_TYPES.PASSWORD_RESET]: 'Password Reset',
    [EMAIL_TYPES.WELCOME]: 'Welcome Email',
    [EMAIL_TYPES.NOTIFICATION]: 'Notification',
    [EMAIL_TYPES.PROMOTIONAL]: 'Promotional',
    [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'Payment Verification',
    [EMAIL_TYPES.SYSTEM]: 'System Email'
};

export const EMAIL_TYPE_BADGE_COLORS = {
    [EMAIL_TYPES.VERIFICATION_CODE]: 'bg-blue-100 text-blue-800',
    [EMAIL_TYPES.PASSWORD_RESET]: 'bg-orange-100 text-orange-800',
    [EMAIL_TYPES.WELCOME]: 'bg-green-100 text-green-800',
    [EMAIL_TYPES.NOTIFICATION]: 'bg-purple-100 text-purple-800',
    [EMAIL_TYPES.PROMOTIONAL]: 'bg-pink-100 text-pink-800',
    [EMAIL_TYPES.PAYMENT_VERIFICATION]: 'bg-red-100 text-red-800',
    [EMAIL_TYPES.SYSTEM]: 'bg-gray-100 text-gray-800'
};
