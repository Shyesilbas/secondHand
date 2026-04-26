import { normalizeArrayResponse } from '../common/utils/normalizeArrayResponse.js';
import { OTP_CODE_LENGTH as COMMON_OTP_CODE_LENGTH } from '../common/constants/otp.js';

export const DEFAULT_PAYMENT_FILTERS = Object.freeze({
  seller: '',
  transactionType: '',
  paymentType: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  paymentDirection: '',
});

export const PAYMENT_QUERY_KEYS = Object.freeze({
  payments: ['payments'],
  paymentStatistics: ['paymentStatistics'],
  paymentMethods: ['paymentMethods'],
  creditCards: ['creditCards'],
  bankAccounts: ['bankAccounts'],
  emailsMy: ['emails', 'my'],
  draftListings: ['draftListings'],
});

/** Taslak ilan çekimi ve benzeri akış sabitleri */
export const PAYMENT_FLOW_DEFAULTS = Object.freeze({
  DRAFT_LISTINGS_PAGE_SIZE: 100,
  DRAFT_LISTINGS_MAX_PAGES: 10,
});

/**
 * İstatistik API alan adı sapmalarına karşı tek yerden okuma (PaymentsPage vb.)
 */
export const PAYMENT_STATISTICS_FIELD_KEYS = Object.freeze({
  totalVolume: ['totalAmount', 'totalVolume', 'total'],
  incomingVolume: ['incomingAmount', 'totalIncomingAmount', 'incomingTotal'],
  outgoingVolume: ['outgoingAmount', 'totalOutgoingAmount', 'outgoingTotal'],
  successfulCount: ['successfulCount', 'successfulPayments', 'successCount', 'successfulTransactions'],
});

export const pickPaymentStatistic = (stats, keyGroup) => {
  if (!stats || !keyGroup) return 0;
  const keys = PAYMENT_STATISTICS_FIELD_KEYS[keyGroup];
  if (!keys) return 0;
  for (const key of keys) {
    const value = stats[key];
    if (typeof value === 'number') return value;
  }
  return 0;
};

export { normalizeArrayResponse };

export const PAYMENT_TYPES = {
  CREDIT_CARD: 'CREDIT_CARD',
  TRANSFER: 'TRANSFER',
  EWALLET: 'EWALLET'
};

export const PAYMENT_TRANSACTION_TYPES = {
  LISTING_CREATION: 'LISTING_CREATION',
  ITEM_PURCHASE: 'ITEM_PURCHASE',
  ITEM_SALE: 'ITEM_SALE',
  REFUND: 'REFUND',
  EWALLET_DEPOSIT: 'EWALLET_DEPOSIT',
  EWALLET_WITHDRAWAL: 'EWALLET_WITHDRAWAL',
  EWALLET_PAYMENT_RECEIVED: 'EWALLET_PAYMENT_RECEIVED',
  SHOWCASE_PAYMENT: 'SHOWCASE_PAYMENT'
};

export const PAYMENT_DIRECTIONS = {
  INCOMING: 'INCOMING',
  OUTGOING: 'OUTGOING'
};

export const DEFAULT_CURRENCY = 'TRY';
export const DEFAULT_CURRENCY_SYMBOL = '₺';

export const OTP_CODE_LENGTH = COMMON_OTP_CODE_LENGTH;
export const OTP_TTL_MINUTES = 3;

export const VERIFICATION_STEPS = Object.freeze({
  REVIEW: 'REVIEW',
  VERIFY: 'VERIFY',
});

export const WALLET_OPERATION_MODES = Object.freeze({
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  UPDATE_LIMIT: 'updateLimit',
  UPDATE_WARNING: 'updateWarning',
});

export const PaymentDto = (data) => ({
  paymentId: data.paymentId || null,
  senderDisplayName: data.senderDisplayName || '',
  receiverDisplayName: data.receiverDisplayName || '',
  amount: data.amount || 0,
  currency: data.currency || 'TRY',
  paymentType: data.paymentType || PAYMENT_TYPES.CREDIT_CARD,
  transactionType: data.transactionType || PAYMENT_TRANSACTION_TYPES.LISTING_CREATION,
  paymentDirection: data.paymentDirection || PAYMENT_DIRECTIONS.OUTGOING,
  listingId: data.listingId || null,
  listingTitle: data.listingTitle || null,
  listingNo: data.listingNo || null,
  processedAt: data.processedAt || null,
  isSuccess: data.isSuccess || false
});

export const BankDto = (data) => ({
  id: data?.id || data?.ID || null,
  IBAN: data?.IBAN || '',
  balance: data?.balance || 0,
  holderName: data?.holderName || '',
  holderSurname: data?.holderSurname || '',
});

export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPES.CREDIT_CARD]: 'Credit Card',
  [PAYMENT_TYPES.TRANSFER]: 'Bank Transfer',
  [PAYMENT_TYPES.EWALLET]: 'E-Wallet'
};

export const TRANSACTION_TYPE_LABELS = {
  [PAYMENT_TRANSACTION_TYPES.LISTING_CREATION]: 'Listing Fee',
  [PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE]: 'Product Purchase',
  [PAYMENT_TRANSACTION_TYPES.ITEM_SALE]: 'Product Sale',
  [PAYMENT_TRANSACTION_TYPES.EWALLET_DEPOSIT]: 'E-Wallet Deposit',
  [PAYMENT_TRANSACTION_TYPES.EWALLET_WITHDRAWAL]: 'E-Wallet Withdrawal',
  [PAYMENT_TRANSACTION_TYPES.EWALLET_PAYMENT_RECEIVED]: 'E-Wallet Payment Received',
  [PAYMENT_TRANSACTION_TYPES.SHOWCASE_PAYMENT]: 'Showcase Payment'
};

export const PAYMENT_DIRECTION_LABELS = {
  [PAYMENT_DIRECTIONS.INCOMING]: 'Incoming',
  [PAYMENT_DIRECTIONS.OUTGOING]: 'Outgoing'
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
    agreementsAccepted: data.agreementsAccepted || false,
    acceptedAgreementIds: data.acceptedAgreementIds || []
  };
};

export const createListingFeePaymentRequest = (data) => {
  return {
    listingId: data.listingId || '',
    paymentType: data.paymentType || PAYMENT_TYPES.CREDIT_CARD,
    transactionType: PAYMENT_TRANSACTION_TYPES.LISTING_CREATION,
    paymentDirection: PAYMENT_DIRECTIONS.OUTGOING,
    verificationCode: data.verificationCode || null,
    agreementsAccepted: data.agreementsAccepted || false,
    acceptedAgreementIds: data.acceptedAgreementIds || [],
    idempotencyKey: data.idempotencyKey,
  };
};

