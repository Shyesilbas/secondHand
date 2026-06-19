import { normalizeArrayResponse } from '../common/utils/normalizeArrayResponse.js';
import { OTP_CODE_LENGTH as COMMON_OTP_CODE_LENGTH } from '../common/constants/otp.js';
import { cleanObject } from '../common/formatters.js';

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
  escrowAmount: ['escrowAmount', 'totalEscrowAmount', 'escrowTotal'],
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

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  ESCROW: 'ESCROW',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED'
};

export const DEFAULT_CURRENCY = 'TRY';
export const DEFAULT_CURRENCY_SYMBOL = '₺';

export const OTP_CODE_LENGTH = COMMON_OTP_CODE_LENGTH;
/** Ödeme doğrulama kodu TTL (saniye); tüm frontend geri sayaçları buna bağlanır */
export const OTP_CODE_VALIDITY_SECONDS = 180;

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
  paymentType: data.paymentType || PAYMENT_TYPES.EWALLET,
  transactionType: data.transactionType || PAYMENT_TRANSACTION_TYPES.LISTING_CREATION,
  paymentDirection: data.paymentDirection || PAYMENT_DIRECTIONS.OUTGOING,
  listingId: data.listingId || null,
  listingTitle: data.listingTitle || null,
  listingNo: data.listingNo || null,
  processedAt: data.processedAt || null,
  isSuccess: data.isSuccess || false,
  status: data.status || (data.isSuccess ? 'COMPLETED' : 'FAILED')
});

export const PAYMENT_TYPE_LABELS = {
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

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PENDING]: 'Pending',
  [PAYMENT_STATUSES.PAID]: 'Paid',
  [PAYMENT_STATUSES.ESCROW]: 'In Escrow',
  [PAYMENT_STATUSES.COMPLETED]: 'Completed',
  [PAYMENT_STATUSES.FAILED]: 'Failed',
  [PAYMENT_STATUSES.REFUNDED]: 'Refunded',
  [PAYMENT_STATUSES.PARTIALLY_REFUNDED]: 'Partially Refunded',
  [PAYMENT_STATUSES.DISPUTED]: 'Disputed',
  [PAYMENT_STATUSES.CANCELLED]: 'Cancelled'
};

export const PAYMENT_DIRECTION_LABELS = {
  [PAYMENT_DIRECTIONS.INCOMING]: 'Incoming',
  [PAYMENT_DIRECTIONS.OUTGOING]: 'Outgoing'
};

export const createPaymentRequest = (data) => {
  return cleanObject({
    amount: parseFloat(data.amount) || 0,
    currency: data.currency || 'TRY',
    description: data.description?.trim() || '',
    listingId: data.listingId || undefined,
    paymentType: data.paymentType || PAYMENT_TYPES.EWALLET,
    agreementsAccepted: data.agreementsAccepted || false,
    acceptedAgreementIds: data.acceptedAgreementIds || [],
    fromUserId: data.fromUserId || undefined,
    toUserId: data.toUserId || undefined,
    receiverName: data.receiverName || undefined,
    receiverSurname: data.receiverSurname || undefined,
    orderItemId: data.orderItemId || undefined,
    listingTitle: data.listingTitle || undefined,
    listingNo: data.listingNo || undefined,
    transactionType: data.transactionType || undefined,
    paymentDirection: data.paymentDirection || undefined,
    verificationCode: data.verificationCode || undefined,
    status: data.status || undefined,
    orderId: data.orderId || undefined,
  });
};

export const createListingFeePaymentRequest = (data) => {
  return {
    listingId: data.listingId || '',
    paymentType: data.paymentType || PAYMENT_TYPES.EWALLET,
    transactionType: PAYMENT_TRANSACTION_TYPES.LISTING_CREATION,
    paymentDirection: PAYMENT_DIRECTIONS.OUTGOING,
    verificationCode: data.verificationCode || null,
    agreementsAccepted: data.agreementsAccepted || false,
    acceptedAgreementIds: data.acceptedAgreementIds || [],
    idempotencyKey: data.idempotencyKey,
  };
};
