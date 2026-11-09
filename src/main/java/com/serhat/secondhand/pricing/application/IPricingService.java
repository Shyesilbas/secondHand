package com.serhat.secondhand.pricing.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IPricingService {
    
    PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode);
    
    PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode, 
                               UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice);

    /**
     * Checkout pricing: like {@link #priceCart}, but a requested coupon that is unknown, not usable or
     * gives no discount is an error (its coupon error code) instead of being silently dropped.
     * Offer arguments may be null.
     */
    Result<PricingResultDto> priceCartForCheckout(User buyer, List<Cart> cartItems, String couponCode,
                                                  UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice);
}
