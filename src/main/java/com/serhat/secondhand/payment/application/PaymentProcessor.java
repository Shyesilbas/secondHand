package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.outbox.PaymentOutboxService;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.strategy.PaymentStrategyFactory;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import com.serhat.secondhand.payment.util.PaymentRedisIdempotencyService;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessor {

    private final PaymentStrategyFactory paymentStrategyFactory;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentIdempotencyHelper paymentIdempotencyHelper;
    private final PaymentPreCheckService paymentPreCheckService;
    private final PaymentOutboxService paymentOutboxService;
    private final PaymentRedisIdempotencyService paymentRedisIdempotencyService;
    private final org.springframework.cache.CacheManager cacheManager;

    @Lazy
    @Autowired
    private PaymentProcessor self;

    public Result<PaymentDto> executeSinglePayment(Long userId, PaymentRequest paymentRequest) {
        log.info("Processing payment request for userId: {}", userId);

        String idempotencyKey = (paymentRequest.idempotencyKey() != null && !paymentRequest.idempotencyKey().isBlank())
                ? paymentRequest.idempotencyKey()
                : paymentIdempotencyHelper.buildIdempotencyKey(paymentRequest, userId);

        PaymentRequest requestWithIdempotency = paymentIdempotencyHelper.withIdempotencyKey(paymentRequest, idempotencyKey);
        String fingerprint = buildRequestFingerprint(userId, requestWithIdempotency);

        PaymentRedisIdempotencyService.ClaimResult claimResult =
                paymentRedisIdempotencyService.claim(idempotencyKey, fingerprint);

        if (claimResult == PaymentRedisIdempotencyService.ClaimResult.CONFLICT) {
            return Result.error("Processed already.", PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString());
        }

        if (claimResult == PaymentRedisIdempotencyService.ClaimResult.IN_PROGRESS) {
            return Result.error("Payment request is already being processed.",
                    PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString());
        }

        if (claimResult == PaymentRedisIdempotencyService.ClaimResult.ALREADY_COMPLETED) {
            return paymentRepository.findByIdempotencyKeyAndFromUserId(idempotencyKey, userId)
                    .map(payment -> Result.success(paymentMapper.toDto(payment)))
                    .orElseGet(() -> Result.error("Processed already.", PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString()));
        }

        int maxRetries = PaymentProcessingConstants.MAX_OPTIMISTIC_LOCK_RETRIES;
        int attempt = 0;
        boolean completed = false;

        while (attempt < maxRetries) {
            try {
                Result<PaymentDto> result = self.executePaymentWithTransaction(userId, requestWithIdempotency);
                if (result.isSuccess()) {
                    paymentRedisIdempotencyService.markCompleted(idempotencyKey, fingerprint);
                    completed = true;
                } else {
                    paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
                }
                return result;
            } catch (OptimisticLockException e) {
                attempt++;
                log.warn("Optimistic lock exception during payment, attempt {}/{}", attempt, maxRetries);

                if (attempt >= maxRetries) {
                    return Result.error("Concurrent Update", PaymentErrorCodes.CONCURRENT_UPDATE.toString());
                }

                try {
                    sleepBeforeRetry(attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return Result.error("Processing payment interrupted.", PaymentErrorCodes.PAYMENT_ERROR.toString());
                }
            }
        }

        if (!completed) {
            paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
        }
        return Result.error("Unexpected error occurred during payment processing.", PaymentErrorCodes.PAYMENT_ERROR.toString());
    }

    @Transactional
    public Result<PaymentDto> executePaymentWithTransaction(Long userId, PaymentRequest paymentRequest) {
        String idempotencyKey = paymentRequest.idempotencyKey();

        Payment existingPayment = paymentRepository.findByIdempotencyKeyAndFromUserId(idempotencyKey, userId)
                .orElse(null);

        if (existingPayment != null) {
            Result<Void> validationResult = validateIdempotencyKeyMatch(existingPayment, paymentRequest, userId);
            if (validationResult.isError()) {
                return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
            }
            return Result.success(paymentMapper.toDto(existingPayment));
        }

        Result<PaymentPreCheckService.PreCheckContext> preCheckResult = paymentPreCheckService.preCheck(userId, paymentRequest);
        if (preCheckResult.isError()) {
            return Result.error(preCheckResult.getMessage(), preCheckResult.getErrorCode());
        }
        PaymentPreCheckService.PreCheckContext context = preCheckResult.getData();

        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(context.fromUser(), context.toUser(), paymentRequest.amount())) {
            return Result.error("Payment Method is not eligible.", PaymentErrorCodes.PAYMENT_ERROR.toString());
        }

        PaymentResult result = strategy.process(context.fromUser(), context.toUser(), paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = paymentMapper.fromPaymentRequest(paymentRequest, context.fromUser(), context.toUser(), result);
        payment = paymentRepository.save(payment);

        if (result.success()) {
            paymentOutboxService.enqueuePaymentCompleted(payment);
        }

        evictUserPaymentStatsCache(userId);

        return Result.success(paymentMapper.toDto(payment));
    }

    private Result<Void> validateIdempotencyKeyMatch(Payment existingPayment, PaymentRequest paymentRequest, Long userId) {
        boolean amountMatches = existingPayment.getAmount().compareTo(paymentRequest.amount()) == 0;
        boolean listingMatches = (existingPayment.getListingId() == null && paymentRequest.listingId() == null) ||
                (existingPayment.getListingId() != null && existingPayment.getListingId().equals(paymentRequest.listingId()));
        boolean orderItemMatches = (existingPayment.getOrderItemId() == null && paymentRequest.orderItemId() == null) ||
                (existingPayment.getOrderItemId() != null && existingPayment.getOrderItemId().equals(paymentRequest.orderItemId()));
        boolean paymentTypeMatches = existingPayment.getPaymentType() == paymentRequest.paymentType();
        boolean fromUserMatches = existingPayment.getFromUser().getId().equals(userId);

        if (!amountMatches || !listingMatches || !orderItemMatches || !paymentTypeMatches || !fromUserMatches) {
            return Result.error("Processed already.", PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString());
        }
        return Result.success();
    }

    private void sleepBeforeRetry(int attempt) throws InterruptedException {
        Thread.sleep(PaymentProcessingConstants.BASE_RETRY_BACKOFF_MS * attempt);
    }

    private String buildRequestFingerprint(Long userId, PaymentRequest paymentRequest) {
        return userId + "|" +
                paymentRequest.paymentType() + "|" +
                paymentRequest.amount() + "|" +
                paymentRequest.listingId() + "|" +
                paymentRequest.orderItemId();
    }

    private void evictUserPaymentStatsCache(Long userId) {
        org.springframework.cache.Cache cache = cacheManager.getCache("paymentStats");
        if (cache != null) {
            cache.evict(userId + "_null");
            for (com.serhat.secondhand.payment.entity.PaymentType type : com.serhat.secondhand.payment.entity.PaymentType.values()) {
                cache.evict(userId + "_" + type.name());
            }
        }
    }
}
