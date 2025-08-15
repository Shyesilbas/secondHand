
export const CreditCardRequestDTO = {
  limit: 0,
};

export const CreditCardDTO = {
  number: '',
  cvv: '',
  expiryMonth: '',
  expiryYear: '',
  amount: '',
  limit: '',
};

export const BankDTO = {
  IBAN: '',
  balance: 0,
  holderName: '',
  holderSurname: '',
};

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

export const createCreditCardRequest = (data) => {
  return {
    limit: parseFloat(data.limit) || 0,
  };
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