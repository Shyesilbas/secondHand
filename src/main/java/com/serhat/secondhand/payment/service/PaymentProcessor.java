package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
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
import org.springframework.security.core.Authentication;
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


    public PaymentDto process(PaymentRequest paymentRequest, Authentication authentication) {
        String idempotencyKey = paymentRequest.idempotencyKey() != null && !paymentRequest.idempotencyKey().isBlank()
                ? paymentRequest.idempotencyKey()
                : generateIdempotencyKey(paymentRequest, authentication);
        
        PaymentRequest requestWithIdempotency = createPaymentRequestWithIdempotency(paymentRequest, idempotencyKey);
        
        int maxRetries = 3;
        int attempt = 0;
        
        while (attempt < maxRetries) {
            try {
                return executePaymentWithTransaction(requestWithIdempotency, authentication);
            } catch (OptimisticLockException e) {
                attempt++;
                log.warn("Optimistic lock exception during payment processing, attempt {}/{}: {}", 
                        attempt, maxRetries, e.getMessage());
                
                if (attempt >= maxRetries) {
                    log.error("Payment processing failed after {} retries due to concurrent updates", maxRetries);
                    throw new BusinessException(PaymentErrorCodes.CONCURRENT_UPDATE);
                }
                
                try {
                    Thread.sleep(50 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new BusinessException(PaymentErrorCodes.PAYMENT_ERROR);
                }
            }
        }
        
        throw new BusinessException(PaymentErrorCodes.PAYMENT_ERROR);
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected PaymentDto executePaymentWithTransaction(PaymentRequest paymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        String idempotencyKey = paymentRequest.idempotencyKey();
        
        Payment existingPayment = paymentRepository.findByIdempotencyKeyAndFromUser(idempotencyKey, fromUser)
                .orElse(null);
        
        if (existingPayment != null) {
            validateIdempotencyKeyMatch(existingPayment, paymentRequest, fromUser);
            return paymentMapper.toDto(existingPayment);
        }
        
        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);

        paymentValidator.validatePaymentAgreements(paymentRequest);
        paymentVerificationService.validateOrGenerateVerification(fromUser, paymentRequest.verificationCode());
        paymentValidator.validatePaymentRequest(paymentRequest, fromUser);

        var strategy = paymentStrategyFactory.getStrategy(paymentRequest.paymentType());

        if (!strategy.canProcess(fromUser, toUser, paymentRequest.amount())) {
            throw new BusinessException(PaymentErrorCodes.PAYMENT_ERROR);
        }

        PaymentResult result = strategy.process(fromUser, toUser, paymentRequest.amount(), paymentRequest.listingId(), paymentRequest);

        Payment payment = paymentMapper.fromPaymentRequest(paymentRequest, fromUser, toUser, result);
        payment = paymentRepository.save(payment);

        if (result.success()) {
            eventPublisher.publishEvent(new PaymentCompletedEvent(this, payment));
        }

        return paymentMapper.toDto(payment);
    }
    
    private String generateIdempotencyKey(PaymentRequest paymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        return String.format("payment-%s-%s-%s-%s", 
                fromUser.getId(), 
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
    
    private void validateIdempotencyKeyMatch(Payment existingPayment, PaymentRequest paymentRequest, User fromUser) {
        boolean amountMatches = existingPayment.getAmount().compareTo(paymentRequest.amount()) == 0;
        boolean listingMatches = (existingPayment.getListingId() == null && paymentRequest.listingId() == null) ||
                (existingPayment.getListingId() != null && existingPayment.getListingId().equals(paymentRequest.listingId()));
        boolean paymentTypeMatches = existingPayment.getPaymentType() == paymentRequest.paymentType();
        boolean fromUserMatches = existingPayment.getFromUser().getId().equals(fromUser.getId());
        
        if (!amountMatches || !listingMatches || !paymentTypeMatches || !fromUserMatches) {
            throw new BusinessException(PaymentErrorCodes.IDEMPOTENCY_KEY_CONFLICT);
        }
    }
}
