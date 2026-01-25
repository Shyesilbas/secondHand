package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.service.OfferService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.pricing.service.PricingService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public void initiatePaymentVerification(Long userId, InitiateVerificationRequest req) {
        // 1. Kullanıcıyı ID üzerinden çek
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new RuntimeException(userResult.getMessage());
        }
        User user = userResult.getData();

        log.info("Initiating payment verification for user: {}, transactionType: {}", user.getEmail(),
                req != null ? req.getTransactionType() : "NULL");

        // 2. Kod üret ve kaydet
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        // 3. Bildirim detaylarını oluştur
        PaymentTransactionType type = (req != null && req.getTransactionType() != null)
                ? req.getTransactionType() : PaymentTransactionType.ITEM_PURCHASE;

        String details = buildPaymentDetails(user, type, req);

        try {
            paymentNotificationService.sendPaymentVerificationNotification(user, code, details);
            log.info("Payment verification notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", user.getEmail(), e);
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
        // Repository ID metodunu kullanıyoruz
        List<Cart> cartItems = cartRepository.findByUserIdWithListing(user.getId());
        String couponCode = req != null ? req.getCouponCode() : null;
        Offer acceptedOffer = null;
        List<Cart> effectiveCartItems = cartItems;

        if (req != null && req.getOfferId() != null) {
            // OfferService artik userId alıyor
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

    public Result<Void> validateOrGenerateVerification(User user, String code) {
        if (code == null || code.isBlank()) {
            String generatedCode = verificationService.generateCode();
            verificationService.generateVerification(user, generatedCode, CodeType.PAYMENT_VERIFICATION);
            paymentNotificationService.sendPaymentVerificationNotification(user, generatedCode, "Payment verification code generated.");
            return Result.error(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED.toString(), "Doğrulama kodu gerekli.");
        }
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            return Result.error(PaymentErrorCodes.INVALID_VERIFICATION_CODE.toString(), "Geçersiz doğrulama kodu.");
        }
        return Result.success();
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return fee.add(taxAmount);
    }
}