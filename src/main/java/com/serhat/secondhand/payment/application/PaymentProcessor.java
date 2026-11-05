package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentResult;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.outbox.PaymentOutboxService;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.payment.port.out.PaymentProviderPort;
import com.serhat.secondhand.payment.util.PaymentIdempotencyHelper;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.payment.util.PaymentProcessingConstants;
import com.serhat.secondhand.payment.util.PaymentRedisIdempotencyService;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentProcessor {

    private final List<PaymentProviderPort> providers;
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

        PaymentRequest requestWithIdempotency = paymentIdempotencyHelper.withIdempotencyKey(paymentRequest,
                idempotencyKey);
        String fingerprint = buildRequestFingerprint(userId, requestWithIdempotency);

        PaymentRedisIdempotencyService.ClaimResult claimResult = paymentRedisIdempotencyService.claim(idempotencyKey,
                fingerprint);

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
                    .orElseGet(() -> Result.error("Processed already.",
                            PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT.toString()));
        }

        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            return executeInCallerTransaction(userId, requestWithIdempotency, idempotencyKey, fingerprint);
        }
        return executeWithRetry(userId, requestWithIdempotency, idempotencyKey, fingerprint);
    }

    /**
     * Most callers (checkout, showcase, membership, listing fee) already run in a transaction, so the
     * payment row is only durable once that transaction commits. The Redis marker therefore follows the
     * outcome of the caller's transaction instead of being set before the commit. An optimistic lock
     * conflict cannot be retried here because the shared transaction is already marked rollback-only,
     * so it propagates to the caller.
     */
    private Result<PaymentDto> executeInCallerTransaction(Long userId, PaymentRequest request,
                                                          String idempotencyKey, String fingerprint) {
        boolean[] succeeded = { false };
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED && succeeded[0]) {
                    paymentRedisIdempotencyService.markCompleted(idempotencyKey, fingerprint);
                } else if (status == STATUS_UNKNOWN) {
                    log.warn("Payment transaction outcome unknown for idempotency key {}; marker kept until TTL",
                            idempotencyKey);
                } else {
                    paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
                }
            }
        });
        Result<PaymentDto> result = self.executePaymentWithTransaction(userId, request);
        succeeded[0] = result.isSuccess();
        return result;
    }

    private Result<PaymentDto> executeWithRetry(Long userId, PaymentRequest request,
                                                String idempotencyKey, String fingerprint) {
        int maxRetries = PaymentProcessingConstants.MAX_OPTIMISTIC_LOCK_RETRIES;
        int attempt = 0;
        try {
            while (true) {
                try {
                    // Commits before returning, so the marker below reflects a committed payment.
                    Result<PaymentDto> result = self.executePaymentWithTransaction(userId, request);
                    if (result.isSuccess()) {
                        paymentRedisIdempotencyService.markCompleted(idempotencyKey, fingerprint);
                    } else {
                        paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
                    }
                    return result;
                } catch (OptimisticLockingFailureException | OptimisticLockException e) {
                    attempt++;
                    log.warn("Optimistic lock conflict during payment, attempt {}/{}", attempt, maxRetries);
                    if (attempt >= maxRetries) {
                        paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
                        return Result.error("Concurrent Update", PaymentErrorCodes.CONCURRENT_UPDATE.toString());
                    }
                    sleepBeforeRetry(attempt);
                }
            }
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
            return Result.error("Processing payment interrupted.", PaymentErrorCodes.PAYMENT_ERROR.toString());
        } catch (RuntimeException e) {
            paymentRedisIdempotencyService.releaseIfPending(idempotencyKey, fingerprint);
            throw e;
        }
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

        Result<PaymentPreCheckService.PreCheckContext> preCheckResult = paymentPreCheckService.preCheck(userId,
                paymentRequest);
        if (preCheckResult.isError()) {
            return Result.error(preCheckResult.getMessage(), preCheckResult.getErrorCode());
        }
        PaymentPreCheckService.PreCheckContext context = preCheckResult.getData();

        PaymentProviderPort strategy = providers.stream()
                .filter(p -> p.supports(paymentRequest.providerName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No provider for: " + paymentRequest.providerName()));

        if (!strategy.canProcess(context.fromUser(), context.toUser(), paymentRequest.amount())) {
            return Result.error("Payment Method is not eligible.", PaymentErrorCodes.PAYMENT_ERROR.toString());
        }

        PaymentResult result = strategy.process(context.fromUser(), context.toUser(), paymentRequest.amount(),
                paymentRequest.listingId(), paymentRequest);

        Payment payment = paymentMapper.fromPaymentRequest(paymentRequest, context.fromUser(), context.toUser(),
                result);
        payment = paymentRepository.save(payment);

        evictUserPaymentStatsCache(userId);

        if (!result.success()) {
            return Result.error(result.errorMessage() != null ? result.errorMessage() : "Payment failed.",
                    PaymentErrorCodes.PAYMENT_ERROR.toString());
        }
        paymentOutboxService.enqueuePaymentCompleted(payment);

        return Result.success(paymentMapper.toDto(payment));
    }

    private Result<Void> validateIdempotencyKeyMatch(Payment existingPayment, PaymentRequest paymentRequest,
            Long userId) {
        boolean amountMatches = existingPayment.getAmount().compareTo(paymentRequest.amount()) == 0;
        boolean listingMatches = (existingPayment.getListingId() == null && paymentRequest.listingId() == null) ||
                (existingPayment.getListingId() != null
                        && existingPayment.getListingId().equals(paymentRequest.listingId()));
        boolean orderItemMatches = (existingPayment.getOrderItemId() == null && paymentRequest.orderItemId() == null) ||
                (existingPayment.getOrderItemId() != null
                        && existingPayment.getOrderItemId().equals(paymentRequest.orderItemId()));
        boolean paymentTypeMatches = existingPayment.getProviderName() != null
                && existingPayment.getProviderName().equals(paymentRequest.providerName());
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
                paymentRequest.providerName() + "|" +
                paymentRequest.amount() + "|" +
                paymentRequest.listingId() + "|" +
                paymentRequest.orderItemId();
    }

    private void evictUserPaymentStatsCache(Long userId) {
        // Stats are cached per user and provider filter, and a payment changes both the payer's and the
        // recipient's numbers, so clear the whole cache like the escrow and e-wallet paths do.
        org.springframework.cache.Cache cache = cacheManager.getCache("payment:stats");
        if (cache != null) {
            cache.clear();
        }
    }
}
