package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService {

    private final ListingConfig listingConfig;
    private final IVerificationService verificationService;
    private final UserService userService;
    private final ListingService listingService;
    private final CartRepository cartRepository;
    private final PaymentNotificationService paymentNotificationService;
    private final PricingService pricingService;
    private final OfferService offerService;

    public void initiatePaymentVerification(Authentication authentication, InitiateVerificationRequest req) {
        User user = userService.getAuthenticatedUser(authentication);
        log.info("Initiating payment verification for user: {}, transactionType: {}, listingId: {}, days: {}, amount: {}", 
                user.getEmail(), 
                req != null ? req.getTransactionType() : null,
                req != null ? req.getListingId() : null,
                req != null ? req.getDays() : null,
                req != null ? req.getAmount() : null);
        
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        PaymentTransactionType type = (req != null && req.getTransactionType() != null)
                ? req.getTransactionType() : PaymentTransactionType.ITEM_PURCHASE;

        String details = buildPaymentDetails(user, type, req);
        log.info("Built payment details for user: {}, details length: {}", user.getEmail(), details != null ? details.length() : 0);
        
        try {
            paymentNotificationService.sendPaymentVerificationNotification(user, code, details);
            log.info("Payment verification notification sent successfully to user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment verification notification to user: {}, error: {}", user.getEmail(), e.getMessage(), e);
            throw e;
        }
    }

    private String buildPaymentDetails(User user, PaymentTransactionType type, InitiateVerificationRequest req) {
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
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        String couponCode = req != null ? req.getCouponCode() : null;
        Offer acceptedOffer = null;
        List<Cart> effectiveCartItems = cartItems;
        if (req != null && req.getOfferId() != null) {
            acceptedOffer = offerService.getAcceptedOfferForCheckout(user, req.getOfferId());
            effectiveCartItems = new ArrayList<>();
            for (Cart ci : cartItems) {
                if (ci.getListing() != null && acceptedOffer.getListing() != null && acceptedOffer.getListing().getId() != null
                        && acceptedOffer.getListing().getId().equals(ci.getListing().getId())) {
                    continue;
                }
                effectiveCartItems.add(ci);
            }
            effectiveCartItems.add(Cart.builder()
                    .user(user)
                    .listing(acceptedOffer.getListing())
                    .quantity(acceptedOffer.getQuantity())
                    .notes(null)
                    .build());
        }

        PricingResultDto pricing = acceptedOffer != null
                ? pricingService.priceCart(user, effectiveCartItems, couponCode, acceptedOffer.getListing().getId(), acceptedOffer.getQuantity(), acceptedOffer.getTotalPrice())
                : pricingService.priceCart(user, effectiveCartItems, couponCode);

        details.append("Order Summary:\n");
        if (pricing.getItems() != null) {
            for (var item : pricing.getItems()) {
                String title = "Item";
                if (effectiveCartItems != null) {
                    for (Cart ci : effectiveCartItems) {
                        if (ci.getListing() != null && ci.getListing().getId() != null && ci.getListing().getId().equals(item.getListingId())) {
                            title = ci.getListing().getTitle() != null ? ci.getListing().getTitle() : title;
                            break;
                        }
                    }
                }
                details.append("- ").append(title)
                        .append(" x").append(item.getQuantity())
                        .append(" — ").append(item.getCampaignUnitPrice()).append(" TRY\n");
            }
        }
        if (pricing.getCampaignDiscount() != null && pricing.getCampaignDiscount().compareTo(BigDecimal.ZERO) > 0) {
            details.append("Campaign Discount: -").append(pricing.getCampaignDiscount()).append(" TRY\n");
        }
        if (pricing.getCouponDiscount() != null && pricing.getCouponDiscount().compareTo(BigDecimal.ZERO) > 0) {
            details.append("Coupon Discount: -").append(pricing.getCouponDiscount()).append(" TRY\n");
        }
        details.append("Total: ").append(pricing.getTotal()).append(" TRY\n");
    }

    private void appendListingDetails(StringBuilder details, InitiateVerificationRequest req, BigDecimal amount) {
        if (req != null && req.getListingId() != null) {
            listingService.findById(req.getListingId()).ifPresent(listing -> {
                String title = listing.getTitle() != null ? listing.getTitle() : listing.getListingNo();
                details.append("Listing: ").append(title).append("\n");
            });
        }
        if (amount != null) {
            details.append("Amount: ").append(amount).append(" TRY\n");
        }
    }

    public void validateOrGenerateVerification(User user, String code) {
        if (code == null || code.isBlank()) {
            String generatedCode = verificationService.generateCode();
            verificationService.generateVerification(user, generatedCode, CodeType.PAYMENT_VERIFICATION);
            paymentNotificationService.sendPaymentVerificationNotification(user, generatedCode, "Payment verification code generated.");
            log.info("Payment verification code generated for user {}: {}", user.getEmail(), generatedCode);
            throw new BusinessException(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED);
        }
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            throw new BusinessException(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }

        log.info("Verification code validated successfully for user: {}", user.getEmail());
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal listingCreationFee = listingConfig.getCreation().getFee();
        BigDecimal listingFeeTax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }
}
