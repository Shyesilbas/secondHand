/**
 * Payment Related DTOs
 */

// Credit Card Request DTO
export const CreditCardRequestDTO = {
  limit: 0,
};

// Credit Card Response DTO  
export const CreditCardDTO = {
  number: '',
  cvv: '',
  expiryMonth: '',
  expiryYear: '',
  amount: '',
  limit: '',
};

// Bank Account Request DTO - Not needed, bank account creation requires no parameters

// Bank Account Response DTO
export const BankDTO = {
  IBAN: '',
  balance: 0,
  holderName: '',
  holderSurname: '',
};

// Payment Request DTO
export const PaymentRequestDTO = {
  amount: 0,
  currency: 'TRY',
  description: '',
  paymentMethod: '', 
  creditCardId: '', // If paying with credit card
  bankAccountId: '', // If paying with bank transfer
};

// Payment Response DTO
export const PaymentDTO = {
  id: '',
  amount: 0,
  currency: 'TRY',
  description: '',
  paymentMethod: '',
  paymentType: '', // LISTING_CREATION, ITEM_PURCHASE
  direction: '', // INCOMING, OUTGOING
  status: '',
  processedAt: '',
  createdAt: '',
  updatedAt: '',
};

// Listing Fee Payment Request DTO
export const ListingFeePaymentRequestDTO = {
  listingId: '',
  paymentMethod: '', // CREDIT_CARD, BANK_TRANSFER
  creditCardId: '', // Required if paymentMethod is CREDIT_CARD
  bankAccountId: '', // Required if paymentMethod is BANK_TRANSFER
};

// Listing Fee Config Response DTO
export const ListingFeeConfigDTO = {
  vehicleFee: 0,
  electronicsFee: 0,
  houseFee: 0,
  clothingFee: 0,
  booksFee: 0,
  sportsFee: 0,
  otherFee: 0,
  currency: 'TRY',
};

/**
 * Create Credit Card Request DTO with validation
 * @param {Object} data - Form data
 * @returns {Object} - Validated DTO
 */
export const createCreditCardRequest = (data) => {
  return {
    limit: parseFloat(data.limit) || 0,
  };
};

// Bank account creation requires no parameters, so no createBankRequest function needed

/**
 * Create Payment Request DTO with validation
 * @param {Object} data - Payment data
 * @returns {Object} - Validated DTO
 */
export const createPaymentRequest = (data) => {
  return {
    amount: parseFloat(data.amount) || 0,
    currency: data.currency || 'TRY',
    description: data.description?.trim() || '',
    paymentMethod: data.paymentMethod || '',
    creditCardId: data.creditCardId || '',
    bankAccountId: data.bankAccountId || '',
  };
};

/**
 * Create Listing Fee Payment Request DTO with validation
 * @param {Object} data - Payment data
 * @returns {Object} - Validated DTO
 */
export const createListingFeePaymentRequest = (data) => {
  return {
    listingId: data.listingId || '',
    paymentMethod: data.paymentMethod || '',
    creditCardId: data.paymentMethod === 'CREDIT_CARD' ? data.creditCardId : '',
    bankAccountId: data.paymentMethod === 'BANK_TRANSFER' ? data.bankAccountId : '',
  };
};