package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
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

    @Getter
    @Value("${app.listing.creation.fee}")
    private BigDecimal listingCreationFee;


    @Getter
    @Value("${app.listing.fee.tax}")
    private BigDecimal listingFeeTax;

    private final PaymentValidationHelper paymentValidationHelper;

    @Transactional
    public PaymentDto createListingFeePayment(ListingFeePaymentRequest listingFeePaymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        Listing listing = listingService.findById(listingFeePaymentRequest.listingId())
                .orElseThrow(() -> new BusinessException(PaymentErrorCodes.LISTING_NOT_FOUND));

        listingService.validateOwnership(listingFeePaymentRequest.listingId(), fromUser);

                if (listingFeePaymentRequest.verificationCode() == null || listingFeePaymentRequest.verificationCode().isBlank()) {
            String code = verificationService.generateCode();
            verificationService.generateVerification(fromUser, code, CodeType.PAYMENT_VERIFICATION);
            emailService.sendPaymentVerificationEmail(fromUser, code);
            
                        log.info("Payment verification code generated for user {}: {}", fromUser.getEmail(), code);
            
            throw new BusinessException(PaymentErrorCodes.PAYMENT_VERIFICATION_REQUIRED);
        }

                boolean valid = verificationService.validateVerificationCode(fromUser, listingFeePaymentRequest.verificationCode(), CodeType.PAYMENT_VERIFICATION);
        if (!valid) {
            throw new BusinessException(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }

        PaymentRequest fullRequest = getPaymentRequest(listingFeePaymentRequest, fromUser, listing);

        PaymentDto result = createPayment(fullRequest, authentication);
                verificationService.findLatestActiveVerification(fromUser, CodeType.PAYMENT_VERIFICATION)
                .ifPresent(verificationService::markVerificationAsUsed);
        return result;
    }

    private PaymentRequest getPaymentRequest(ListingFeePaymentRequest listingFeePaymentRequest, User fromUser, Listing listing) {
        BigDecimal creationFeeTax =
                listingCreationFee.multiply(listingFeeTax).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal totalCreationFee = listingCreationFee.add(creationFeeTax);

        return new PaymentRequest(
                fromUser.getId(),
                null, // System payment - no recipient user
                "System",
                "Payment",
                listing.getId(),
                totalCreationFee,
                listingFeePaymentRequest.paymentType(),
                PaymentTransactionType.LISTING_CREATION,
                PaymentDirection.OUTGOING
        );
    }

    @Transactional
    public PaymentDto createPayment(PaymentRequest paymentRequest, Authentication authentication) {
        log.info("Creating payment for listing: {} with amount: {}", paymentRequest.listingId(), paymentRequest.amount());

        User fromUser = userService.getAuthenticatedUser(authentication);
        User toUser;
        toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);
        paymentValidationHelper.validatePaymentRequest(paymentRequest, fromUser, toUser);


        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(fromUser, toUser, paymentRequest.amount())) {
            throw new BusinessException(PaymentErrorCodes.UNSUPPORTED_PAYMENT_TYPE);
        }
        PaymentResult paymentResult = strategy.process(fromUser, toUser, paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = Payment.builder()
                .fromUser(fromUser)
                .toUser(toUser)
                .amount(paymentRequest.amount())
                .paymentType(paymentRequest.paymentType())
                .transactionType(paymentRequest.transactionType())
                .paymentDirection(paymentRequest.paymentDirection())
                .listingId(paymentRequest.listingId())
                .processedAt(paymentResult.processedAt())
                .isSuccess(paymentResult.success())
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment {} created with ID: {}", paymentResult.success() ? "successfully" : "unsuccessfully", payment.getId());

        if (paymentResult.success()) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
            log.info("Published PaymentCompletedEvent for payment ID: {}", payment.getId());
        }

        return paymentMapper.toDto(payment);
    }


    @Transactional
    public List<PaymentDto> createPurchasePayments(List<PaymentRequest> paymentRequests, Authentication authentication) {
        if (paymentRequests == null || paymentRequests.isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.EMPTY_PAYMENT_BATCH);
        }

        List<PaymentDto> results = new ArrayList<>();
        for (PaymentRequest request : paymentRequests) {
            if (request.transactionType() != PaymentTransactionType.ITEM_PURCHASE) {
                throw new BusinessException(PaymentErrorCodes.INVALID_TXN_TYPE);
            }
            if (request.paymentDirection() != PaymentDirection.OUTGOING) {
                throw new BusinessException(PaymentErrorCodes.INVALID_DIRECTION);
            }
            PaymentDto result = createPayment(request, authentication);
            results.add(result);
        }
        return results;
    }
    
    private PaymentDto mapPaymentToDtoWithListingInfo(Payment payment, User currentUser) {
        PaymentDto baseDto = paymentMapper.toDto(payment);
        
        String listingTitle = null;
        String listingNo = null;
        
        if (payment.getListingId() != null) {
            try {
                Optional<Listing> listing = listingService.findById(payment.getListingId());
                if (listing.isPresent()) {
                    listingTitle = listing.get().getTitle();
                    listingNo = listing.get().getListingNo();
                }
            } catch (Exception e) {
                log.warn("Could not fetch listing info for payment {}: {}", payment.getId(), e.getMessage());
            }
        }
        
                PaymentDirection userDirection;
        PaymentTransactionType userTransactionType;
        
        // Preserve original transaction type for system payments like LISTING_CREATION
        if (payment.getTransactionType() == PaymentTransactionType.LISTING_CREATION ||
            payment.getTransactionType() == PaymentTransactionType.SHOWCASE_PAYMENT) {
            userDirection = payment.getFromUser().getId().equals(currentUser.getId()) 
                ? PaymentDirection.OUTGOING : PaymentDirection.INCOMING;
            userTransactionType = payment.getTransactionType();
        } else {
            // For user-to-user transactions, map based on user perspective
            if (payment.getFromUser().getId().equals(currentUser.getId())) {
                userDirection = PaymentDirection.OUTGOING;
                userTransactionType = PaymentTransactionType.ITEM_PURCHASE;
            } else {
                userDirection = PaymentDirection.INCOMING;
                userTransactionType = PaymentTransactionType.ITEM_SALE;
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
            userTransactionType,
            userDirection,
            baseDto.listingId(),
            listingTitle,
            listingNo,
            baseDto.createdAt(),
            baseDto.isSuccess()
        );
    }

    public Page<PaymentDto> getMyPayments(Authentication authentication, int page, int size) {
        User user = userService.getAuthenticatedUser(authentication);
        Sort sort = Sort.by(Sort.Direction.DESC, "processedAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Payment> payments = paymentRepository.findByFromUserOrToUser(user, user, pageable);
        return payments.map(payment -> mapPaymentToDtoWithListingInfo(payment, user));
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

    public Map<String, Object> getPaymentStatistics(Authentication authentication, PaymentType filterType) {
        User user = userService.getAuthenticatedUser(authentication);
        var payments = paymentRepository.findByFromUserOrToUser(user, user);

        if (filterType != null) {
            payments = payments.stream().filter(p -> p.getPaymentType() == filterType).toList();
        }

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
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalCreationFee = listingCreationFee.add(creationFeeTax);

        return ListingFeeConfigDto.builder()
                .creationFee(listingCreationFee)
                .taxPercentage(listingFeeTax)
                .totalCreationFee(totalCreationFee)
                .build();
    }

}
