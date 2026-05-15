package com.serhat.secondhand.user.application.event;

/** Yorum veya satış sonrası Great Seller uygunluğu tekrar hesaplanır. */
public record SellerEligibilityRecheckEvent(Long sellerId) {
}
