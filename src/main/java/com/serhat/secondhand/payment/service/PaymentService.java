package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final BankService bankService;
    private final CreditCardService creditCardService;
    private final ListingService listingService; // New dependency
    private final ApplicationEventPublisher eventPublisher;

    @Getter
    @Value("${app.listing.creation.fee:50.00}")
    private BigDecimal listingCreationFee;

    @Transactional
    public PaymentDto createListingFeePayment(ListingFeePaymentRequest listingFeePaymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(listingFeePaymentRequest.listingId())
                .orElseThrow(() -> new BusinessException("Listing not found", HttpStatus.NOT_FOUND, "LISTING_NOT_FOUND"));

        listingService.validateOwnership(listingFeePaymentRequest.listingId(), fromUser);

        User toUser = fromUser; 

        PaymentRequest fullRequest = new PaymentRequest(
                toUser.getId(),
                listingFeePaymentRequest.listingId(),
                listingCreationFee,
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
        User toUser = userService.findById(paymentRequest.toUserId());

        if (paymentRequest.amount() == null || paymentRequest.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero", HttpStatus.BAD_REQUEST, "INVALID_AMOUNT");
        }
        
        // This check is tricky for listing fees where you pay "to the system" (represented as yourself)
        if (paymentRequest.transactionType() != PaymentTransactionType.LISTING_CREATION && fromUser.getId().equals(toUser.getId())) {
            throw new BusinessException("Cannot make payment to yourself", HttpStatus.BAD_REQUEST, "SELF_PAYMENT");
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

        return toDto(payment);
    }

    private boolean processCreditCardPayment(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing credit card payment from user: {} to user: {}", fromUser.getEmail(), toUser.getEmail());
        boolean paymentSuccessful = creditCardService.processPayment(fromUser, amount);
        if (paymentSuccessful && !fromUser.getId().equals(toUser.getId())) {
            bankService.credit(toUser, amount);
            log.info("Credited {} to recipient's bank account.", amount);
        }
        return paymentSuccessful;
    }

    private boolean processBankTransfer(User fromUser, User toUser, BigDecimal amount) {
        log.info("Processing bank transfer from user: {} to user: {}", fromUser.getEmail(), toUser.getEmail());
        try {
            bankService.debit(fromUser, amount);
            if (!fromUser.getId().equals(toUser.getId())) {
                 bankService.credit(toUser, amount);
            }
            log.info("Bank transfer successful.");
            return true;
        } catch (BusinessException e) {
            log.error("Error during bank transfer: {}", e.getMessage(), e);
            return false;
        }
    }

    public Page<PaymentDto> getMyPayments(Authentication authentication, int page, int size, String sortBy, String sortDir) {
        User user = userService.getAuthenticatedUser(authentication);
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Payment> payments = paymentRepository.findByFromUserOrToUser(user, user, pageable);
        return payments.map(this::toDto);
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

    private PaymentDto toDto(Payment payment) {
        return new PaymentDto(
                payment.getId(),
                payment.getFromUser().getName(),
                payment.getFromUser().getSurname(),
                payment.getToUser().getName(),
                payment.getToUser().getSurname(),
                payment.getAmount(),
                payment.getPaymentType(),
                payment.getTransactionType(),
                payment.getPaymentDirection(),
                payment.getListingId(),
                payment.getProcessedAt(),
                payment.isSuccess()
        );
    }
}
