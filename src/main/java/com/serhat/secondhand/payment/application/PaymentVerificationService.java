package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.redis.ExpiringCounter;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.verification.CodeType;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.dto.PaymentVerificationDto;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.checkout.application.PaymentVerificationMessageBuilder;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService implements IPaymentVerificationService {

    /** Wrong codes allowed per issued code; the next attempt needs a new code. */
    static final int MAX_FAILED_ATTEMPTS = 3;
    /** Outlives the code itself (app.verification.expiry-minutes), so the counter cannot expire mid-code. */
    static final Duration FAILED_ATTEMPT_WINDOW = Duration.ofMinutes(15);
    static final String FAILED_ATTEMPT_KEY_PREFIX = "v4:payment:otp_fail:";
    /** Transaction resource holding the code this transaction already consumed for a user. */
    private static final String CONSUMED_CODE_RESOURCE_PREFIX = PaymentVerificationService.class.getName() + ".consumed:";

    private final IVerificationService verificationService;
    private final IUserService userService;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentVerificationMessageBuilder paymentVerificationMessageBuilder;
    private final StringRedisTemplate redisTemplate;
    private final ExpiringCounter expiringCounter;

    @Override
    public PaymentVerificationDto initiatePaymentVerification(Long userId, InitiateVerificationRequest req) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) {
            throw new BusinessException(userResult.getMessage(), org.springframework.http.HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
        }
        User user = userResult.getData();

        log.info("Initiating payment verification for user: {}, transactionType: {}", user.getEmail(),
                req != null ? req.getTransactionType() : "NULL");

        String code = verificationService.generateCode();
        var verification = verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);
        resetFailedAttempts(user);

        PaymentTransactionType type = (req != null && req.getTransactionType() != null)
                ? req.getTransactionType() : PaymentTransactionType.ITEM_PURCHASE;

        String details = paymentVerificationMessageBuilder.buildPaymentDetails(user, type, req);

        try {
            paymentNotificationService.sendPaymentVerificationNotification(user, code, details);
            log.info("Payment verification notification sent to user: {}", user.getEmail());
        } catch (RuntimeException e) {
            log.error("Failed to send notification to user: {}", user.getEmail(), e);
            throw e;
        }
        return new PaymentVerificationDto(verification.getCodeExpiresAt());
    }

    @Override
    public boolean isVerificationRequired(String code) {
        return code == null || code.isBlank();
    }

    @Override
    public void generateAndSendVerification(User user) {
        String code = verificationService.generateCode();
        verificationService.generateVerification(user, code, CodeType.PAYMENT_VERIFICATION);
        resetFailedAttempts(user);
        paymentNotificationService.sendPaymentVerificationNotification(user, code, null);
        log.info("Payment verification code generated and sent to user: {}", user.getEmail());
    }

    /**
     * Accepts each issued code once. A checkout pays every seller in one transaction and validates the same
     * code for each payment, so a code this transaction already consumed is accepted again; a rollback undoes
     * the consumption. Wrong codes are counted in Redis, outside the transaction, so a rolled-back checkout
     * cannot reset the counter.
     */
    @Override
    public Result<Void> validateCode(User user, String code) {
        String consumedKey = CONSUMED_CODE_RESOURCE_PREFIX + user.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && code.equals(TransactionSynchronizationManager.getResource(consumedKey))) {
            return Result.success();
        }

        if (failedAttempts(user) >= MAX_FAILED_ATTEMPTS) {
            return Result.error(PaymentErrorCodes.PAYMENT_VERIFICATION_LOCKED);
        }

        if (!verificationService.consumeVerificationCode(user, code, CodeType.PAYMENT_VERIFICATION)) {
            recordFailedAttempt(user);
            return Result.error(PaymentErrorCodes.INVALID_VERIFICATION_CODE);
        }

        rememberConsumedCode(consumedKey, code);
        return Result.success();
    }

    private void rememberConsumedCode(String consumedKey, String code) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }
        TransactionSynchronizationManager.unbindResourceIfPossible(consumedKey);
        TransactionSynchronizationManager.bindResource(consumedKey, code);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                TransactionSynchronizationManager.unbindResourceIfPossible(consumedKey);
            }
        });
    }

    private long failedAttempts(User user) {
        String value = redisTemplate.opsForValue().get(failedAttemptKey(user));
        return value == null ? 0 : Long.parseLong(value);
    }

    private void recordFailedAttempt(User user) {
        expiringCounter.increment(failedAttemptKey(user), FAILED_ATTEMPT_WINDOW);
    }

    private void resetFailedAttempts(User user) {
        redisTemplate.delete(failedAttemptKey(user));
    }

    private static String failedAttemptKey(User user) {
        return FAILED_ATTEMPT_KEY_PREFIX + user.getId();
    }
}
