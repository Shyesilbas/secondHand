package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.EmailService;
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
    private final EmailService emailService;

    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;

    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    public void initiatePaymentVerification(Authentication authentication , InitiateVerificationRequest req) {
        User user = userService.getAuthenticatedUser(authentication);
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        StringBuilder details = new StringBuilder();
        details.append("\n\nPayment Details:\n");

        var type = req != null ? req.getTransactionType() : null;
        if (type == null) {
            type = PaymentTransactionType.ITEM_PURCHASE;
        }

        switch (type) {
            case ITEM_PURCHASE -> {
                details.append("Service: ITEM_PURCHASE\n");
                List<Cart> cartItems = cartRepository.findByUserWithListing(user);
                BigDecimal total = cartItems.stream()
                        .map(c -> c.getListing().getPrice().multiply(BigDecimal.valueOf(c.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                details.append("Order Summary:\n");
                cartItems.forEach(item -> {
                    String title = item.getListing() != null && item.getListing().getTitle() != null
                            ? item.getListing().getTitle() : "Item";
                    details.append("- ").append(title)
                            .append(" x").append(item.getQuantity())
                            .append(" — ").append(item.getListing().getPrice())
                            .append('\n');
                });
                details.append("Total: ").append(total).append(" TRY\n");
            }
            case LISTING_CREATION -> {
                details.append("Service: LISTING_CREATION\n");
                if (req != null && req.getListingId() != null) {
                    try {
                        listingService.findById(req.getListingId()).ifPresent(listing -> {
                            String title = listing.getTitle() != null ? listing.getTitle() : listing.getListingNo();
                            details.append("Listing: ").append(title).append('\n');
                        });
                    } catch (Exception ignored) {}
                }
                BigDecimal fee = calculateTotalListingFee();
                details.append("Amount: ").append(fee).append(" TRY\n");
            }
            case SHOWCASE_PAYMENT -> {
                details.append("Service: SHOWCASE_PAYMENT\n");
                if (req != null && req.getListingId() != null) {
                    try {
                        listingService.findById(req.getListingId()).ifPresent(listing -> {
                            String title = listing.getTitle() != null ? listing.getTitle() : listing.getListingNo();
                            details.append("Listing: ").append(title).append('\n');
                        });
                    } catch (Exception ignored) {}
                }
                if (req != null && req.getDays() != null) {
                    details.append("Days: ").append(req.getDays()).append('\n');
                }
                if (req != null && req.getAmount() != null) {
                    details.append("Amount: ").append(req.getAmount()).append(" TRY\n");
                }
            }
            default -> {
                details.append("Service: ").append(type.name()).append('\n');
                if (req != null && req.getAmount() != null) {
                    details.append("Amount: ").append(req.getAmount()).append(" TRY\n");
                }
            }
        }

        details.append("Date: ").append(java.time.LocalDateTime.now()).append('\n');

        emailService.sendPaymentVerificationEmail(user, code, details.toString());

    }

    public void validateOrGenerateVerification(User user, String code) {
        if (code == null || code.isBlank()) {
            String generatedCode = verificationService.generateCode();
            verificationService.generateVerification(user, generatedCode, CodeType.PAYMENT_VERIFICATION);
            emailService.sendPaymentVerificationEmail(user, generatedCode, "Payment verification code generated.");
            log.info("Payment verification code generated for user {}: {}", user.getEmail(), generatedCode);
            throw new BusinessException(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED);
        }
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            throw new BusinessException(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }
        // Verification code'u tek seferde kullanmak yerine, süresi dolana kadar geçerli tutuyoruz
        // Böylece sepetteki birden fazla ürün için aynı verification code kullanılabilir
        log.info("Verification code validated successfully for user: {}", user.getEmail());
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }
}
