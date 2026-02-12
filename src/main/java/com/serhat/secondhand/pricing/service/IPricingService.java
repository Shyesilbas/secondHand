package com.serhat.secondhand.pricing.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface IPricingService {
    
    PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode);
    
    PricingResultDto priceCart(User buyer, List<Cart> cartItems, String couponCode, 
                               UUID offerListingId, Integer offerQuantity, BigDecimal offerTotalPrice);
}
