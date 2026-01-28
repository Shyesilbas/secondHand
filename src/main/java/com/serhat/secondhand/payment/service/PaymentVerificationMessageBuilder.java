package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentVerificationMessageBuilder {

    private final ListingConfig listingConfig;
    private final ListingService listingService;
    private final CartRepository cartRepository;
    private final PricingService pricingService;
    private final OfferService offerService;

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
        List<Cart> cartItems = cartRepository.findByUserIdWithListing(user.getId());
        String couponCode = req != null ? req.getCouponCode() : null;
        Offer acceptedOffer = null;
        List<Cart> effectiveCartItems = cartItems;

        if (req != null && req.getOfferId() != null) {
            Result<Offer> offerResult = offerService.getAcceptedOfferForCheckout(user.getId(), req.getOfferId());
            if (offerResult.isError()) {
                throw new RuntimeException(offerResult.getMessage());
            }
            acceptedOffer = offerResult.getData();
            effectiveCartItems = new ArrayList<>();
            for (Cart ci : cartItems) {
                if (ci.getListing() != null && acceptedOffer.getListing().getId().equals(ci.getListing().getId())) {
                    continue;
                }
                effectiveCartItems.add(ci);
            }
            effectiveCartItems.add(Cart.builder()
                    .user(user)
                    .listing(acceptedOffer.getListing())
                    .quantity(acceptedOffer.getQuantity())
                    .build());
        }

        PricingResultDto pricing = acceptedOffer != null
                ? pricingService.priceCart(user, effectiveCartItems, couponCode, acceptedOffer.getListing().getId(), acceptedOffer.getQuantity(), acceptedOffer.getTotalPrice())
                : pricingService.priceCart(user, effectiveCartItems, couponCode);

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
            listingService.findById(req.getListingId()).ifPresent(listing -> {
                details.append("Listing: ").append(listing.getTitle()).append("\n");
            });
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

