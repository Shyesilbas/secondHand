package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.cart.repository.CartRepository;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.*;
import com.serhat.secondhand.payment.entity.*;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.strategy.PaymentStrategyFactory;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final ListingService listingService;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;
    private final IVerificationService verificationService;
    private final EmailService emailService;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final CartRepository cartRepository;
    private final PaymentValidationHelper paymentValidationHelper;

    @Getter
    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;

    @Getter
    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    // ---------------- LISTING FEE PAYMENT ----------------
    @Transactional
    public PaymentDto createListingFeePayment(ListingFeePaymentRequest request, Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(request.listingId())
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.LISTING_NOT_FOUND));

        listingService.validateOwnership(request.listingId(), user);

        BigDecimal totalFee = calculateTotalListingFee();

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .fromUserId(user.getId())
                .toUserId(null)
                .receiverName("System")
                .receiverSurname("Payment")
                .listingId(listing.getId())
                .amount(totalFee)
                .paymentType(request.paymentType())
                .transactionType(PaymentTransactionType.LISTING_CREATION)
                .paymentDirection(PaymentDirection.OUTGOING)
                .verificationCode(request.verificationCode())
                .build();

        return createPayment(paymentRequest, authentication);
    }

    private BigDecimal calculateTotalListingFee() {
        BigDecimal taxAmount = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return listingCreationFee.add(taxAmount);
    }

    @Transactional
    public PaymentDto createPayment(PaymentRequest paymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);

        validateOrGenerateVerification(fromUser, paymentRequest.verificationCode(), paymentRequest);

        paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, toUser);

        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(fromUser, toUser, paymentRequest.amount())) {
            throw new BusinessException(PaymentErrorCodes.UNSUPPORTED_PAYMENT_TYPE);
        }

        PaymentResult result = strategy.process(fromUser, toUser, paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = Payment.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(paymentRequest.amount())
                .paymentType(paymentRequest.paymentType())
                .transactionType(paymentRequest.transactionType())
                .paymentDirection(paymentRequest.paymentDirection())
                .listingId(paymentRequest.listingId())
                .processedAt(result.processedAt())
                .isSuccess(result.success())
                .build();

        payment = paymentRepository.save(payment);

        if (result.success()) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
        }

        return paymentMapper.toDto(payment);
    }

    public void initiatePaymentVerification(Authentication authentication, InitiateVerificationRequest req) {
        User user = userService.getAuthenticatedUser(authentication);
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);

        StringBuilder details = new StringBuilder();
        details.append("\n\nPayment Details:\n");

        var type = req != null ? req.getTransactionType() : null;
        if (type == null) {
            type = com.serhat.secondhand.payment.entity.PaymentTransactionType.ITEM_PURCHASE;
        }

        switch (type) {
            case ITEM_PURCHASE -> {
                details.append("Service: ITEM_PURCHASE\n");
                List<Cart> cartItems = cartRepository.findByUserWithListing(user);
                java.math.BigDecimal total = cartItems.stream()
                        .map(c -> c.getListing().getPrice().multiply(java.math.BigDecimal.valueOf(c.getQuantity())))
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
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
                java.math.BigDecimal fee = calculateTotalListingFee();
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

    public void verifyPaymentCode(Authentication authentication, String code) {
        User user = userService.getAuthenticatedUser(authentication);
        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            throw new BusinessException(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }
        verificationService.findLatestActiveVerification(user, CodeType.PAYMENT_VERIFICATION)
                .ifPresent(verificationService::markVerificationAsUsed);
    }

    @Transactional
    public List<PaymentDto> createPurchasePayments(List<PaymentRequest> requests, Authentication authentication) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.EMPTY_PAYMENT_BATCH);
        }

        List<PaymentDto> results = new ArrayList<>();
        for (PaymentRequest request : requests) {
            if (request.transactionType() != PaymentTransactionType.ITEM_PURCHASE) {
                throw new BusinessException(PaymentErrorCodes.INVALID_TXN_TYPE);
            }
            if (request.paymentDirection() != PaymentDirection.OUTGOING) {
                throw new BusinessException(PaymentErrorCodes.INVALID_DIRECTION);
            }
            results.add(createPayment(request, authentication));
        }
        return results;
    }

    private void validateOrGenerateVerification(User user, String code, PaymentRequest request) {
        if (code == null || code.isBlank()) {
            String generatedCode = verificationService.generateCode();
            verificationService.generateVerification(user, generatedCode, CodeType.PAYMENT_VERIFICATION);

            StringBuilder details = new StringBuilder();
            details.append("\n\nPayment Details:\n");
            details.append("Service: ");
            if (request.transactionType() == PaymentTransactionType.LISTING_CREATION) {
                details.append("Listing Fee");
            } else if (request.transactionType() == PaymentTransactionType.SHOWCASE_PAYMENT) {
                details.append("Showcase Payment");
            } else if (request.transactionType() == PaymentTransactionType.ITEM_PURCHASE) {
                details.append("Item Purchase");
            } else {
                details.append(String.valueOf(request.transactionType()));
            }
            details.append('\n');
            details.append("Amount: ").append(request.amount()).append(" TRY\n");
            if (request.listingId() != null) {
                try {
                    listingService.findById(request.listingId()).ifPresent(listing -> {
                        String title = listing.getTitle() != null ? listing.getTitle() : listing.getListingNo();
                        details.append("Listing: ").append(title).append('\n');
                    });
                } catch (Exception ignored) {}
            }
            if (request.receiverName() != null) {
                details.append("Receiver: ").append(request.receiverName());
                if (request.receiverSurname() != null) details.append(' ').append(request.receiverSurname());
                details.append('\n');
            }
            details.append("Date: ").append(java.time.LocalDateTime.now()).append('\n');

            emailService.sendPaymentVerificationEmail(user, generatedCode, details.toString());

            log.info("Payment verification code generated for user {}: {}", user.getEmail(), generatedCode);

            throw new BusinessException(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED);
        }

        boolean valid = verificationService.validateVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            throw new BusinessException(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }

        verificationService.findLatestActiveVerification(user, CodeType.PAYMENT_VERIFICATION)
                .ifPresent(verificationService::markVerificationAsUsed);
    }

    private PaymentDto mapPaymentToDtoWithListingInfo(Payment payment, User currentUser) {
        PaymentDto baseDto = paymentMapper.toDto(payment);
        String listingTitle = null;
        String listingNo = null;

        if (payment.getListingId() != null) {
            Optional<Listing> listing = listingService.findById(payment.getListingId());
            if (listing.isPresent()) {
                listingTitle = listing.get().getTitle();
                listingNo = listing.get().getListingNo();
            }
        }

        PaymentDirection direction;
        PaymentTransactionType transactionType;

        boolean isEwalletFlow = payment.getTransactionType() == PaymentTransactionType.EWALLET_DEPOSIT
                || payment.getTransactionType() == PaymentTransactionType.EWALLET_WITHDRAWAL
                || payment.getTransactionType() == PaymentTransactionType.EWALLET_PAYMENT_RECEIVED;

        if (payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION ||
                payment.getTransactionType() == PaymentTransactionType.SHOWCASE_PAYMENT ||
                isEwalletFlow) {
            direction = payment.getPaymentDirection();
            transactionType = payment.getTransactionType();
        } else {
            if (payment.getFromUser().getId().equals(currentUser.getId())) {
                direction = PaymentDirection.OUTGOING;
                transactionType = PaymentTransactionType.ITEM_PURCHASE;
            } else {
                direction = PaymentDirection.INCOMING;
                transactionType = PaymentTransactionType.ITEM_SALE;
            }
        }

        return new PaymentDto(
                baseDto.paymentId(),
                baseDto.senderName(),
                baseDto.senderSurname(),
                baseDto.receiverName(),
                baseDto.receiverSurname(),
                baseDto.amount(),
                baseDto.paymentType(),
                transactionType,
                direction,
                baseDto.listingId(),
                listingTitle,
                listingNo,
                baseDto.createdAt(),
                baseDto.isSuccess()
        );
    }

    public Page<PaymentDto> getMyPayments(Authentication authentication, int page, int size) {
        User user = userService.getAuthenticatedUser(authentication);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "processedAt"));
        Page<Payment> payments = paymentRepository.findByFromUserOrToUser(user, user, pageable);
        return payments.map(payment -> mapPaymentToDtoWithListingInfo(payment, user));
    }

    public Map<String, Object> getPaymentStatistics(Authentication authentication) {
        return getPaymentStatistics(authentication, null);
    }

    public Map<String, Object> getPaymentStatistics(Authentication authentication, PaymentType filterType) {
        User user = userService.getAuthenticatedUser(authentication);
        var payments = paymentRepository.findByFromUserOrToUser(user, user);
        if (filterType != null) {
            payments = payments.stream().filter(p -> p.getPaymentType() == filterType).toList();
        }

        long total = payments.size();
        long successful = payments.stream().filter(Payment::isSuccess).count();
        BigDecimal totalAmount = payments.stream().filter(Payment::isSuccess)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalPayments", total,
                "successfulPayments", successful,
                "failedPayments", total - successful,
                "successRate", total > 0 ? (double) successful / total * 100 : 0,
                "totalAmount", totalAmount
        );
    }

    public ListingFeeConfigDto getListingFeeConfig() {
        BigDecimal totalFee = calculateTotalListingFee();
        return ListingFeeConfigDto.builder()
                .creationFee(listingCreationFee)
                .taxPercentage(listingFeeTax)
                .totalCreationFee(totalFee)
                .build();
    }
}
