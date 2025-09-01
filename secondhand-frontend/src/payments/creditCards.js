
export const CreditCardDto = (data) => ({
    number: data.number || '',
    cvv: data.cvv || '',
    expiryMonth: data.expiryMonth || '',
    expiryYear: data.expiryYear || '',
    amount: data.amount || '',
    limit: data.limit || ''
});


export const CreditCardRequestDto = (data) => ({
    limit: parseFloat(data.limit) || 0,
});


export const CREDIT_CARD_FIELD_LABELS = {
    number: 'Card Number',
    cvv: 'CVV',
    expiryMonth: 'Expiry Month',
    expiryYear: 'Expiry Year',
    amount: 'Amount',
    limit: 'Credit Limit'
};


export const CREDIT_CARD_FIELD_PLACEHOLDERS = {
    number: '1234 5678 9012 3456',
    cvv: '123',
    expiryMonth: 'MM',
    expiryYear: 'YYYY',
    amount: '0.00',
    limit: '1000.00'
};


export const CREDIT_CARD_FIELD_TYPES = {
    number: 'text',
    cvv: 'password',
    expiryMonth: 'text',
    expiryYear: 'text',
    amount: 'number',
    limit: 'number'
};


export const CREDIT_CARD_VALIDATION_RULES = {
    limit: {
        required: true,
        min: 0
    }
};

/**
 * Credit Card status colors
 */
export const CREDIT_CARD_STATUS_COLORS = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800'
};

/**
 * Credit Card type icons
 */
export const CREDIT_CARD_TYPE_ICONS = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    default: '💳'
};
