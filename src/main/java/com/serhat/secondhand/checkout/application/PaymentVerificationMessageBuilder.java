package com.serhat.secondhand.checkout.application;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.IListingService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.application.IPricingService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentVerificationMessageBuilder {

    private final ListingConfig listingConfig;
    private final IListingService listingService;
    private final IPricingService pricingService;
    private final CheckoutPricingContextFactory checkoutPricingContextFactory;

    public String buildPaymentDetails(User user, PaymentTransactionType type, InitiateVerificationRequest req) {
        StringBuilder details = new StringBuilder("\n\nPayment Details:\n");
        details.append("Service: ").append(type.name().replace("_", " ")).append("\n");

        switch (type) {
            case ITEM_PURCHASE -> appendCartDetails(details, user, req);
            case LISTING_CREATION -> appendListingDetails(details, req, calculateTotalListingFee());
            case SHOWCASE_PAYMENT -> {
                appendListingDetails(details, req, req != null ? req.getAmount() : null);
                if (req != null && req.getDays() != null) {
                    details.append("Days: ").append(req.getDays()).append("\n");
                }
            }
            default -> {
                if (req != null && req.getAmount() != null) {
                    details.append("Amount: ").append(req.getAmount()).append(" TRY\n");
                }
            }
        }

        details.append("Date: ").append(java.time.LocalDateTime.now()).append("\n");
        return details.toString();
    }

    private void appendCartDetails(StringBuilder details, User user, InitiateVerificationRequest req) {
        String couponCode = req != null ? req.getCouponCode() : null;
        Offer acceptedOffer = null;

        if (req != null && req.getOfferId() != null) {
            // Reuse CheckoutPricingContextFactory offer resolution to avoid duplication
            com.serhat.secondhand.order.dto.CheckoutRequest syntheticRequest =
                    com.serhat.secondhand.order.dto.CheckoutRequest.builder()
                            .offerId(req.getOfferId())
                            .couponCode(couponCode)
                            .build();

            Result<CheckoutPricingContextFactory.CheckoutPricingContext> contextResult =
                    checkoutPricingContextFactory.build(user.getId(), syntheticRequest);

            if (contextResult.isError()) {
                throw new BusinessException(contextResult.getMessage(),
                        org.springframework.http.HttpStatus.BAD_REQUEST, contextResult.getErrorCode());
            }

            CheckoutPricingContextFactory.CheckoutPricingContext ctx = contextResult.getData();
            appendPricingSummary(details, ctx.pricing());
            return;
        }

        // No offer — price cart directly
        List<Cart> cartItems = checkoutPricingContextFactory.buildEffectiveCartItems(
                new java.util.ArrayList<>(), null, user);
        PricingResultDto pricing = pricingService.priceCart(user, cartItems, couponCode);
        appendPricingSummary(details, pricing);
    }

    private void appendPricingSummary(StringBuilder details, PricingResultDto pricing) {
        details.append("Order Summary:\n");
        if (pricing.getItems() != null) {
            for (var item : pricing.getItems()) {
                details.append("- Item x").append(item.getQuantity())
                        .append(" — ").append(item.getCampaignUnitPrice()).append(" TRY\n");
            }
        }
        details.append("Total: ").append(pricing.getTotal()).append(" TRY\n");
    }

    private void appendListingDetails(StringBuilder details, InitiateVerificationRequest req, BigDecimal amount) {
        if (req != null && req.getListingId() != null) {
            listingService.findById(req.getListingId()).ifPresent(listing ->
                    details.append("Listing: ").append(listing.getTitle()).append("\n"));
        }
        if (amount != null) {
            details.append("Amount: ").append(amount).append(" TRY\n");
        }
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}
