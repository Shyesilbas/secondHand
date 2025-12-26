package com.serhat.secondhand.pricing.handler;

import com.serhat.secondhand.pricing.util.PricingUtil;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

public class OfferPriceHandler {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfferOverride {
        private UUID listingId;
        private Integer quantity;
        private BigDecimal totalPrice;
    }

    public static boolean isOfferLine(OfferOverride offerOverride, UUID listingId) {
        return offerOverride != null
                && offerOverride.getListingId() != null
                && offerOverride.getListingId().equals(listingId);
    }

    public static OfferPriceResult applyOfferOverride(OfferOverride offerOverride, int defaultQuantity, BigDecimal defaultUnitPrice) {
        if (offerOverride == null || offerOverride.getTotalPrice() == null) {
            return new OfferPriceResult(defaultQuantity, defaultUnitPrice, PricingUtil.scale(defaultUnitPrice.multiply(BigDecimal.valueOf(defaultQuantity))));
        }

        int quantity = offerOverride.getQuantity() != null && offerOverride.getQuantity() > 0 
                ? offerOverride.getQuantity() 
                : defaultQuantity;
        BigDecimal totalPrice = PricingUtil.scale(offerOverride.getTotalPrice());
        BigDecimal unitPrice = PricingUtil.scale(totalPrice.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP));

        return new OfferPriceResult(quantity, unitPrice, totalPrice);
    }

    @Data
    @AllArgsConstructor
    public static class OfferPriceResult {
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }
}

