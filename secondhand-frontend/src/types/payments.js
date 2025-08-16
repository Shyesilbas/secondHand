
export const PAYMENT_TYPES = {
    CREDIT_CARD: 'CREDIT_CARD',
    TRANSFER: 'TRANSFER'
};

export const PAYMENT_TRANSACTION_TYPES = {
    LISTING_CREATION: 'LISTING_CREATION',
    ITEM_PURCHASE: 'ITEM_PURCHASE'
};


export const PAYMENT_DIRECTIONS = {
    INCOMING: 'INCOMING',
    OUTGOING: 'OUTGOING'
};


export const PaymentDto = (data) => ({
    paymentId: data.paymentId || null,
    senderName: data.senderName || '',
    senderSurname: data.senderSurname || '',
    receiverName: data.receiverName || '',
    receiverSurname: data.receiverSurname || '',
    amount: data.amount || 0,
    paymentType: data.paymentType || PAYMENT_TYPES.CREDIT_CARD,
    transactionType: data.transactionType || PAYMENT_TRANSACTION_TYPES.LISTING_CREATION,
    paymentDirection: data.paymentDirection || PAYMENT_DIRECTIONS.OUTGOING,
    listingId: data.listingId || null,
    createdAt: data.createdAt || null,
    isSuccess: data.isSuccess || false
});



export const PAYMENT_TYPE_LABELS = {
    [PAYMENT_TYPES.CREDIT_CARD]: 'Credit Card',
    [PAYMENT_TYPES.TRANSFER]: 'Bank Transfer'
};


export const TRANSACTION_TYPE_LABELS = {
    [PAYMENT_TRANSACTION_TYPES.LISTING_CREATION]: 'Listing Fee',
    [PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE]: 'Product Purchase'
};

export const PAYMENT_DIRECTION_LABELS = {
    [PAYMENT_DIRECTIONS.INCOMING]: 'Incoming',
    [PAYMENT_DIRECTIONS.OUTGOING]: 'Outgoing'
};


export const PAYMENT_STATUS_BADGE_COLORS = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
};


export const PAYMENT_DIRECTION_BADGE_COLORS = {
    [PAYMENT_DIRECTIONS.INCOMING]: 'bg-green-100 text-green-600',
    [PAYMENT_DIRECTIONS.OUTGOING]: 'bg-blue-100 text-blue-600'
};

export const ListingFeeConfigDTO = {
    creationFee: undefined,
    promotionFee: undefined,
    taxPercentage: undefined,
    currency: undefined,
};

export const createPaymentRequest = (data) => {
  return {
    amount: parseFloat(data.amount) || 0,
    currency: data.currency || 'TRY',
    description: data.description?.trim() || '',
    paymentMethod: data.paymentMethod || '',
    creditCardId: data.creditCardId || '',
    bankAccountId: data.bankAccountId || '',
    listingId: data.listingId || '',
    paymentType: data.paymentType || '',
  };
};

export const createListingFeePaymentRequest = (data) => {
  return {
    paymentType: data.paymentType || '',
    listingId: data.listingId || '',
  };
};