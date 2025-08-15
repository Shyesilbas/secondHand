package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import com.serhat.secondhand.payment.repo.PaymentRepository;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final BankService bankService;
    private final CreditCardService creditCardService;
    private final ListingService listingService;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;

    @Getter
    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;

    @Getter
    @Value("${app.listing.promotion.fee}")
    private BigDecimal listingPromotionFee;

    @Getter
    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    @Transactional
    public PaymentDto createListingFeePayment(ListingFeePaymentRequest listingFeePaymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(listingFeePaymentRequest.listingId())
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        listingService.validateOwnership(listingFeePaymentRequest.listingId(), fromUser);

        BigDecimal creationFeeTax = listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100));
        BigDecimal totalCreationFee = listingCreationFee.add(creationFeeTax);

        PaymentRequest fullRequest = new PaymentRequest(
                fromUser.getId(),
                null,
                fromUser.getName(),
                fromUser.getSurname(),
                listing.getId(),
                totalCreationFee, // Use total fee including tax
                listingFeePaymentRequest.paymentType(),
                PaymentTransactionType.LISTING_CREATION,
                PaymentDirection.OUTGOING
        );

        return createPayment(fullRequest, authentication);
    }

    @Transactional
    public PaymentDto createPayment(PaymentRequest paymentRequest, Authentication authentication) {
        log.info("Creating payment for listing: {} with amount: {}", paymentRequest.listingId(), paymentRequest.amount());

        User fromUser = userService.getAuthenticatedUser(authentication);
        User toUser = null;
        if (paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION) {
            toUser = userService.findById(paymentRequest.toUserId());
        }

        if (toUser == null && paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION) {
            throw new BusinessException("Recipient user must not be null for this transaction type", HttpStatus.BAD_REQUEST, "NULL_RECIPIENT");
        }

        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero", HttpStatus.BAD_REQUEST, "INVALID_AMOUNT");
        }

        // This check is tricky for listing fees where you pay "to the system" (represented as yourself)
        if (paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION && fromUser.getId().equals(toUser.getId())) {
            throw new BusinessException("Cannot make payment to yourself", HttpStatus.BAD_REQUEST, "SELF_PAYMENT");
        }

        // Validate payment type
        if (paymentRequest.paymentType() == null) {
            throw new BusinessException("Payment type is required", HttpStatus.BAD_REQUEST, "PAYMENT_TYPE_REQUIRED");
        }

        boolean paymentSuccessful = switch (paymentRequest.paymentType()) {
            case CREDIT_CARD -> processCreditCardPayment(fromUser, toUser, paymentRequest.amount());
            case TRANSFER -> processBankTransfer(fromUser, toUser, paymentRequest.amount());
            default -> throw new BusinessException("Unsupported payment type", HttpStatus.BAD_REQUEST, "UNSUPPORTED_PAYMENT_TYPE");
        };

        Payment payment = Payment.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(paymentRequest.amount())
                .paymentType(paymentRequest.paymentType())
                .transactionType(paymentRequest.transactionType())
                .paymentDirection(paymentRequest.paymentDirection())
                .listingId(paymentRequest.listingId())
                .processedAt(LocalDateTime.now())
                .isSuccess(paymentSuccessful)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment {} created with ID: {}", paymentSuccessful ? "successfully" : "unsuccessfully", payment.getId());
        
        if (paymentSuccessful) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
            log.info("Published PaymentCompletedEvent for payment ID: {}", payment.getId());
        }

        return paymentMapper.toDto(payment);
    }

    private boolean processCreditCardPayment(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing credit card payment from user: {} to user: {}", fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM");
        boolean paymentSuccessful = creditCardService.processPayment(fromUser, amount);
        if (paymentSuccessful && toUser != null && !fromUser.getId().equals(toUser.getId())) {
            bankService.credit(toUser, amount);
            log.info("Credited {} to recipient's bank account.", amount);
        }
        return paymentSuccessful;
    }

    private boolean processBankTransfer(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing bank transfer from user: {} to user: {}", fromUser.getEmail(), toUser != null ? toUser.getEmail() : "SYSTEM");
        try {
            bankService.debit(fromUser, amount);
            if (toUser != null && !fromUser.getId().equals(toUser.getId())) {
                bankService.credit(toUser, amount);
            }
            log.info("Bank transfer successful.");
            return true;
        } catch (BusinessException e) {
            log.error("Error during bank transfer: {}", e.getMessage(), e);
            return false;
        }
    }

    public Page<PaymentDto> getMyPayments(Authentication authentication, int page, int size) {
        User user = userService.getAuthenticatedUser(authentication);
        Sort sort = Sort.by(Sort.Direction.DESC, "processedAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Payment> payments = paymentRepository.findByFromUserOrToUser(user, user, pageable);
        return payments.map(paymentMapper::toDto);
    }

    public Map<String, Object> getPaymentStatistics(Authentication authentication) {
        User user = userService.getAuthenticatedUser(authentication);
        var payments = paymentRepository.findByFromUserOrToUser(user, user);
        
        long totalPayments = payments.size();
        long successfulPayments = payments.stream().filter(Payment::isSuccess).count();
        BigDecimal totalAmount = payments.stream()
                .filter(Payment::isSuccess)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
            "totalPayments", totalPayments,
            "successfulPayments", successfulPayments,
            "failedPayments", totalPayments - successfulPayments,
            "successRate", totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0,
            "totalAmount", totalAmount
        );
    }

    public ListingFeeConfigDto getListingFeeConfig() {
        log.info("Getting listing fee configuration");

        BigDecimal creationFeeTax = listingCreationFee
                .multiply(listingFeeTax)
                .divide(BigDecimal.valueOf(100));
        BigDecimal totalCreationFee = listingCreationFee.add(creationFeeTax);

        return ListingFeeConfigDto.builder()
                .creationFee(listingCreationFee)
                .promotionFee(listingPromotionFee)
                .taxPercentage(listingFeeTax)
                .totalCreationFee(totalCreationFee)
                .build();
    }

}
