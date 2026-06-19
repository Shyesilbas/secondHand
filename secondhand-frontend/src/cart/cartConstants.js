export const CART_PAYMENT_TYPES = Object.freeze({
  EWALLET: 'EWALLET',
});

export const CART_CHECKOUT_DEFAULTS = Object.freeze({
  INITIAL_STEP: 1,
  INITIAL_CHECKOUT_STEP: 1,
  VERIFICATION_TRANSACTION_TYPE: 'ITEM_PURCHASE',
});

export const CART_CHECKOUT_STEPS = Object.freeze([
  { id: 1, title: 'Address & Note', description: 'Shipping and billing' },
  { id: 2, title: 'Payment Method', description: 'Choose payment option' },
  { id: 3, title: 'Review & Confirm', description: 'Review details and confirm' },
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
  EMPTY_CART_DESCRIPTION: 'Save items you love and checkout when you are ready.',
  EMPTY_CART_FAVORITES_TITLE: 'From your favorites',
  EMPTY_CART_FAVORITES_SUB: 'Jump back into listings you saved.',
  EMPTY_CART_SEE_ALL_FAVORITES: 'See all favorites',
  EMPTY_CART_GUEST_FAVORITES: 'Sign in to see your saved favorites here.',
  EMPTY_CART_SIGN_IN: 'Sign in',
});
