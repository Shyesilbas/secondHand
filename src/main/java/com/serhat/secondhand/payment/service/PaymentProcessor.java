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
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
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
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;
    private final PaymentIdempotencyHelper paymentIdempotencyHelper;
    private final PaymentPreCheckService paymentPreCheckService;

    public Result<PaymentDto> executeSinglePayment(Long userId, PaymentRequest paymentRequest) {
        log.info("Processing payment request for userId: {}", userId);

        String idempotencyKey = (paymentRequest.idempotencyKey() != null && !paymentRequest.idempotencyKey().isBlank())
                ? paymentRequest.idempotencyKey()
                : paymentIdempotencyHelper.buildIdempotencyKey(paymentRequest, userId);

        PaymentRequest requestWithIdempotency = paymentIdempotencyHelper.withIdempotencyKey(paymentRequest, idempotencyKey);

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

        Result<PaymentPreCheckContext> preCheckResult = paymentPreCheckService.preCheck(userId, paymentRequest);
        if (preCheckResult.isError()) {
            return Result.error(preCheckResult.getErrorCode(), preCheckResult.getMessage());
        }
        PaymentPreCheckContext context = preCheckResult.getData();

        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(context.fromUser(), context.toUser(), paymentRequest.amount())) {
            return Result.error(PaymentErrorCodes.PAYMENT_ERROR.toString(), "Payment Method is not eligible.");
        }

        PaymentResult result = strategy.process(context.fromUser(), context.toUser(), paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = paymentMapper.fromPaymentRequest(paymentRequest, context.fromUser(), context.toUser(), result);
        payment = paymentRepository.save(payment);

        if (result.success()) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
        }

        return Result.success(paymentMapper.toDto(payment));
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