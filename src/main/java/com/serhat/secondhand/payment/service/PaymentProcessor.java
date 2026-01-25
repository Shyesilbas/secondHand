package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.entity.events.PaymentCompletedEvent;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repo.PaymentRepository;
import com.serhat.secondhand.payment.strategy.PaymentStrategyFactory;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentValidationHelper;
import com.serhat.secondhand.payment.validator.PaymentValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessor {

    private final PaymentStrategyFactory paymentStrategyFactory;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final PaymentValidationHelper paymentValidationHelper;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;
    private final PaymentVerificationService paymentVerificationService;
    private final PaymentValidator paymentValidator;

    public Result<PaymentDto> process(Long userId, PaymentRequest paymentRequest) {
        log.info("Processing payment request for userId: {}", userId);

        String idempotencyKey = (paymentRequest.idempotencyKey() != null && !paymentRequest.idempotencyKey().isBlank())
                ? paymentRequest.idempotencyKey()
                : generateIdempotencyKey(paymentRequest, userId);

        PaymentRequest requestWithIdempotency = createPaymentRequestWithIdempotency(paymentRequest, idempotencyKey);

        int maxRetries = 3;
        int attempt = 0;

        while (attempt < maxRetries) {
            try {
                return executePaymentWithTransaction(userId, requestWithIdempotency);
            } catch (OptimisticLockException e) {
                attempt++;
                log.warn("Optimistic lock exception during payment, attempt {}/{}", attempt, maxRetries);

                if (attempt >= maxRetries) {
                    return Result.error(PaymentErrorCodes.CONCURRENT_UPDATE.toString(), "Concurrent Update");
                }

                try {
                    Thread.sleep(50 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return Result.error(PaymentErrorCodes.PAYMENT_ERROR.toString(), "Processing payment interrupted.");
                }
            }
        }

        return Result.error(PaymentErrorCodes.PAYMENT_ERROR.toString(), "Unexpected error occurred during payment processing.");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Result<PaymentDto> executePaymentWithTransaction(Long userId, PaymentRequest paymentRequest) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            return Result.error(userResult.getErrorCode(), userResult.getMessage());
        }
        User fromUser = userResult.getData();
        String idempotencyKey = paymentRequest.idempotencyKey();

        Payment existingPayment = paymentRepository.findByIdempotencyKeyAndFromUserId(idempotencyKey, userId)
                .orElse(null);

        if (existingPayment != null) {
            Result<Void> validationResult = validateIdempotencyKeyMatch(existingPayment, paymentRequest, userId);
            if (validationResult.isError()) {
                return Result.error(validationResult.getErrorCode(), validationResult.getMessage());
            }
            return Result.success(paymentMapper.toDto(existingPayment));
        }

        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);

        Result<Void> agreementsResult = paymentValidator.validatePaymentAgreements(paymentRequest);
        if (agreementsResult.isError()) {
            return Result.error(agreementsResult.getErrorCode(), agreementsResult.getMessage());
        }

        Result<Void> verificationResult = paymentVerificationService.validateOrGenerateVerification(fromUser, paymentRequest.verificationCode());
        if (verificationResult.isError()) {
            return Result.error(verificationResult.getErrorCode(), verificationResult.getMessage());
        }

        Result<Void> requestValidationResult = paymentValidator.validatePaymentRequest(paymentRequest, fromUser);
        if (requestValidationResult.isError()) {
            return Result.error(requestValidationResult.getErrorCode(), requestValidationResult.getMessage());
        }

        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(fromUser, toUser, paymentRequest.amount())) {
            return Result.error(PaymentErrorCodes.PAYMENT_ERROR.toString(), "Payment Method is not eligible.");
        }

        PaymentResult result = strategy.process(fromUser, toUser, paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = paymentMapper.fromPaymentRequest(paymentRequest, fromUser, toUser, result);
        payment = paymentRepository.save(payment);

        if (result.success()) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
        }

        return Result.success(paymentMapper.toDto(payment));
    }

    private String generateIdempotencyKey(PaymentRequest paymentRequest, Long userId) {
        return String.format("payment-%s-%s-%s-%s",
                userId,
                paymentRequest.amount(),
                paymentRequest.listingId() != null ? paymentRequest.listingId() : "null",
                paymentRequest.paymentType());
    }

    private PaymentRequest createPaymentRequestWithIdempotency(PaymentRequest original, String idempotencyKey) {
        return PaymentRequest.builder()
                .fromUserId(original.fromUserId())
                .toUserId(original.toUserId())
                .receiverName(original.receiverName())
                .receiverSurname(original.receiverSurname())
                .listingId(original.listingId())
                .amount(original.amount())
                .paymentType(original.paymentType())
                .transactionType(original.transactionType())
                .paymentDirection(original.paymentDirection())
                .verificationCode(original.verificationCode())
                .agreementsAccepted(original.agreementsAccepted())
                .acceptedAgreementIds(original.acceptedAgreementIds())
                .idempotencyKey(idempotencyKey)
                .build();
    }

    private Result<Void> validateIdempotencyKeyMatch(Payment existingPayment, PaymentRequest paymentRequest, Long userId) {
        boolean amountMatches = existingPayment.getAmount().compareTo(paymentRequest.amount()) == 0;
        boolean listingMatches = (existingPayment.getListingId() == null && paymentRequest.listingId() == null) ||
                (existingPayment.getListingId() != null && existingPayment.getListingId().equals(paymentRequest.listingId()));
        boolean paymentTypeMatches = existingPayment.getPaymentType() == paymentRequest.paymentType();
        boolean fromUserMatches = existingPayment.getFromUser().getId().equals(userId);

        if (!amountMatches || !listingMatches || !paymentTypeMatches || !fromUserMatches) {
            return Result.error(PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString(), "Processed already.");
        }
        return Result.success();
    }
}