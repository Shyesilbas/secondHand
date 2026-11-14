import { normalizeArrayResponse } from '../common/utils/normalizeArrayResponse.js';
import { OTP_CODE_LENGTH as COMMON_OTP_CODE_LENGTH } from '../common/constants/otp.js';

export const DEFAULT_PAYMENT_FILTERS = Object.freeze({
 seller: '',
 transactionType: '',
 providerName: '',
 dateFrom: '',
 dateTo: '',
 amountMin: '',
 amountMax: '',
 paymentDirection: '',
});

export const PAYMENT_QUERY_KEYS = Object.freeze({
 payments: ['payments'],
 paymentStatistics: ['paymentStatistics'],
 listingFeeQuote: ['listingFeeQuote'],
 paymentMethods: ['paymentMethods'],
 emailsMy: ['emails', 'my'],
 draftListings: ['draftListings'],
});

/** Taslak ilan çekimi ve benzeri akış sabitleri */
export const PAYMENT_FLOW_DEFAULTS = Object.freeze({
 DRAFT_LISTINGS_PAGE_SIZE: 100,
 DRAFT_LISTINGS_MAX_PAGES: 10,
});

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
 SHOWCASE_PAYMENT: 'SHOWCASE_PAYMENT',
 MEMBERSHIP_PAYMENT: 'MEMBERSHIP_PAYMENT'
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

/**
 * Ledger row from `GET /v1/payments/my` (backend `PaymentDto`), passed through as sent: direction and
 * type are already resolved for the viewer by `PaymentContextResolver`. No field is defaulted here.
 */
export const PaymentDto = (data) => ({
 paymentId: data.paymentId,
 senderDisplayName: data.senderDisplayName,
 receiverDisplayName: data.receiverDisplayName,
 amount: data.amount,
 currency: data.currency,
 providerName: data.providerName,
 transactionType: data.transactionType,
 paymentDirection: data.paymentDirection,
 listingId: data.listingId,
 listingTitle: data.listingTitle,
 listingNo: data.listingNo,
 processedAt: data.processedAt,
 isSuccess: data.isSuccess,
 status: data.status,
 description: data.description,
});

export const TRANSACTION_TYPE_LABELS = {
 [PAYMENT_TRANSACTION_TYPES.LISTING_CREATION]: 'Listing Fee',
 [PAYMENT_TRANSACTION_TYPES.ITEM_PURCHASE]: 'Product Purchase',
 [PAYMENT_TRANSACTION_TYPES.ITEM_SALE]: 'Product Sale',
 [PAYMENT_TRANSACTION_TYPES.EWALLET_DEPOSIT]: 'E-Wallet Deposit',
 [PAYMENT_TRANSACTION_TYPES.EWALLET_WITHDRAWAL]: 'E-Wallet Withdrawal',
 [PAYMENT_TRANSACTION_TYPES.EWALLET_PAYMENT_RECEIVED]: 'E-Wallet Payment Received',
 [PAYMENT_TRANSACTION_TYPES.SHOWCASE_PAYMENT]: 'Showcase Payment',
 [PAYMENT_TRANSACTION_TYPES.MEMBERSHIP_PAYMENT]: 'Membership Payment'
};

export const createListingFeePaymentRequest = (data) => {
 // Mirrors backend ListingFeePaymentRequest; the fee amount is set by the backend.
 return {
 listingId: data.listingId,
 providerName: data.providerName,
 verificationCode: data.verificationCode || null,
 agreementsAccepted: data.agreementsAccepted || false,
 acceptedAgreementIds: data.acceptedAgreementIds || [],
 idempotencyKey: data.idempotencyKey,
 };
};
