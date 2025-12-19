package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService {

    private final IVerificationService verificationService;
    private final UserService userService;
    private final ListingService listingService;
    private final CartRepository cartRepository;
    private final PaymentNotificationService paymentNotificationService;

    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;

    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    public void initiatePaymentVerification(Authentication authentication, InitiateVerificationRequest req) {
        User user = userService.getAuthenticatedUser(authentication);
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        PaymentTransactionType type = (req != null && req.getTransactionType() != null)
                ? req.getTransactionType() : PaymentTransactionType.ITEM_PURCHASE;

        String details = buildPaymentDetails(user, type, req);
        paymentNotificationService.sendPaymentVerificationNotification(user, code, details);
    }

    private String buildPaymentDetails(User user, PaymentTransactionType type, InitiateVerificationRequest req) {
        StringBuilder details = new StringBuilder("\n\nPayment Details:\n");
        details.append("Service: ").append(type.name().replace("_", " ")).append("\n");

        switch (type) {
            case ITEM_PURCHASE -> appendCartDetails(details, user);
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

    private void appendCartDetails(StringBuilder details, User user) {
        List<Cart> cartItems = cartRepository.findByUserWithListing(user);
        BigDecimal total = cartItems.stream()
                .map(c -> c.getListing().getPrice().multiply(BigDecimal.valueOf(c.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        details.append("Order Summary:\n");
        for (Cart item : cartItems) {
            String title = (item.getListing() != null && item.getListing().getTitle() != null)
                    ? item.getListing().getTitle() : "Item";
            details.append("- ").append(title)
                    .append(" x").append(item.getQuantity())
                    .append(" — ").append(item.getListing().getPrice()).append("\n");
        }
        details.append("Total: ").append(total).append(" TRY\n");
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
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }
}
