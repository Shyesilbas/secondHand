
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
  paymentId: '',
  senderName: '',
  senderSurname: '',
  receiverName: '',
  receiverSurname: '',
  amount: 0,
  paymentType: '',
  transactionType: '',
  paymentDirection: '',
  listingId: '',
  createdAt: '',
  isSuccess: false
};

export const ListingFeeConfigDTO = {
  creationFee: undefined,
  promotionFee: undefined,
  taxPercentage: undefined,
  currency: undefined,
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

export const createListingFeePaymentRequest = (data) => {
  return {
    paymentType: data.paymentType || '',
    listingId: data.listingId || '',
  };
};