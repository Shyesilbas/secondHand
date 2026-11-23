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
 RESERVATION_FAILED: 'Sepetinizdeki ürünler rezerve edilemedi. Bazı ürünlerin stoğu tükenmiş olabilir.',
 COUPON_NOT_APPLIED: 'Kupon uygulanamadı; fiyatlar kuponsuz gösteriliyor.',
 COUPON_NO_LONGER_APPLIES: 'Kuponunuz artık geçerli değil. Devam etmek için sepete dönüp kuponu kaldırın.',
 PRICING_PREVIEW_FAILED: 'Güncel fiyatlar yüklenemedi. Devam etmek için tekrar deneyin.',
 CHECKOUT_FAILED: 'Ödeme işlemi tamamlanamadı',
 CHECKOUT_FAILED_TITLE: 'Ödeme başarısız',
 VERIFICATION_SEND_FAILED: 'Doğrulama kodu gönderilemedi',
 VERIFICATION_SEND_FAILED_TITLE: 'Doğrulama başarısız',
 VERIFICATION_SENT_TITLE: 'Doğrulama kodu gönderildi',
 VERIFICATION_SENT_DESCRIPTION: 'Doğrulama kodu için e-postanızı kontrol edin.',
 ORDER_PLACED_TITLE: 'Siparişiniz oluşturuldu',
 ORDER_PLACED_DESCRIPTION: 'Siparişiniz alındı. Kısa süre içinde onay e-postası alacaksınız.',
 OFFER_LOAD_FAILED: 'Teklif yüklenemedi',
 COUPON_APPLY_FAILED: 'Kupon uygulanamadı',
 EMPTY_CART_TITLE: 'Sepetiniz boş',
 EMPTY_CART_DESCRIPTION: 'Beğendiğiniz ilanları sepete ekleyin, hazır olduğunuzda güvenle satın alın.',
 EMPTY_CART_FAVORITES_TITLE: 'Favorilerinizden',
 EMPTY_CART_FAVORITES_SUB: 'Kaydettiğiniz ilanlara hızlıca geri dönün.',
 EMPTY_CART_SEE_ALL_FAVORITES: 'Tüm favorileri gör',
 EMPTY_CART_GUEST_FAVORITES: 'Kaydettiğiniz favori ilanları görmek için giriş yapın.',
 EMPTY_CART_SIGN_IN: 'Giriş yap',
});
