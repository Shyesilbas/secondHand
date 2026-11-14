export const CART_PAYMENT_TYPES = Object.freeze({
 EWALLET: 'EWALLET',
});

export const CART_CHECKOUT_DEFAULTS = Object.freeze({
 INITIAL_STEP: 1,
 INITIAL_CHECKOUT_STEP: 1,
 VERIFICATION_TRANSACTION_TYPE: 'ITEM_PURCHASE',
});

// Payment and review share one step: the wallet is the only payment method, so there is nothing to choose separately.
export const CART_CHECKOUT_STEPS = Object.freeze([
 { id: 1, labelKey: 'checkout_step_delivery', label: 'Teslimat' },
 { id: 2, labelKey: 'checkout_step_payment', label: 'Ödeme ve onay' },
 { id: 3, labelKey: 'checkout_step_verification', label: 'Doğrulama' },
]);

export const CART_MESSAGES = Object.freeze({
 RESERVATION_FAILED: 'We could not reserve the items in your cart. Some may be out of stock.',
 COUPON_NOT_APPLIED: 'The coupon could not be applied; prices are shown without it.',
 COUPON_NO_LONGER_APPLIES: 'Your coupon no longer applies, so payment cannot go through with it. Go back to your cart and remove it to continue.',
 PRICING_PREVIEW_FAILED: 'We could not load the final price. Prices appear once it loads; try again to continue.',
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
