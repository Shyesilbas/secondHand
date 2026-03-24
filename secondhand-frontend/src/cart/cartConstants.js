export const CART_PAYMENT_TYPES = Object.freeze({
  CREDIT_CARD: 'CREDIT_CARD',
  TRANSFER: 'TRANSFER',
  EWALLET: 'EWALLET',
});

export const CART_CHECKOUT_DEFAULTS = Object.freeze({
  INITIAL_STEP: 1,
  INITIAL_CHECKOUT_STEP: 1,
  VERIFICATION_TRANSACTION_TYPE: 'ITEM_PURCHASE',
});

export const CART_CHECKOUT_STEPS = Object.freeze([
  { id: 1, title: 'Review', description: 'Review your order' },
  { id: 2, title: 'Address & Note', description: 'Shipping and billing' },
  { id: 3, title: 'Payment Method', description: 'Choose payment option' },
  { id: 4, title: 'Verification', description: 'Confirm your purchase' },
]);

export const CART_MESSAGES = Object.freeze({
  CHECKOUT_FAILED: 'Checkout failed',
  CHECKOUT_FAILED_TITLE: 'Checkout Failed',
  VERIFICATION_SEND_FAILED: 'Failed to send verification code',
  VERIFICATION_SEND_FAILED_TITLE: 'Verification Failed',
  VERIFICATION_SENT_TITLE: 'Verification Code Sent',
  VERIFICATION_SENT_DESCRIPTION: 'Please check your email for the code.',
  ORDER_PLACED_TITLE: 'Order Placed Successfully',
  ORDER_PLACED_DESCRIPTION: 'Your order has been placed and you will receive a confirmation email shortly.',
  OFFER_LOAD_FAILED: 'Offer could not be loaded',
  COUPON_APPLY_FAILED: 'Coupon could not be applied',
  EMPTY_CART_TITLE: 'Your cart is empty',
  EMPTY_CART_DESCRIPTION: 'Add some items to your cart to get started.',
});
