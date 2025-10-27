package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.agreements.service.AgreementService;
import com.serhat.secondhand.agreements.entity.enums.AgreementGroup;
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
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GenericPaymentService {

    private final PaymentStrategyFactory paymentStrategyFactory;
    private final PaymentRepository paymentRepository;
    private final UserService userService;
    private final PaymentValidationHelper paymentValidationHelper;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;
    private final PaymentVerificationService paymentVerificationService;
    private final AgreementService agreementService;


    @Transactional
    public PaymentDto createPayment(PaymentRequest paymentRequest, Authentication authentication) {
        User fromUser = userService.getAuthenticatedUser(authentication);
        User toUser = paymentValidationHelper.resolveToUser(paymentRequest, userService);

        // Validate payment agreements
        validatePaymentAgreements(paymentRequest);

        paymentVerificationService.validateOrGenerateVerification(fromUser, paymentRequest.verificationCode());

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

    private void validatePaymentAgreements(PaymentRequest paymentRequest) {
        if (!paymentRequest.agreementsAccepted()) {
            throw new BusinessException(PaymentErrorCodes.AGREEMENTS_NOT_ACCEPTED);
        }

        var requiredAgreements = agreementService.getRequiredAgreements(AgreementGroup.ONLINE_PAYMENT);
        var acceptedAgreementIds = paymentRequest.acceptedAgreementIds();

        if (acceptedAgreementIds == null || acceptedAgreementIds.size() != requiredAgreements.size()) {
            throw new BusinessException(PaymentErrorCodes.INVALID_AGREEMENT_COUNT);
        }

        var requiredAgreementIds = requiredAgreements.stream()
                .map(agreement -> agreement.getAgreementId())
                .toList();

        if (!acceptedAgreementIds.containsAll(requiredAgreementIds)) {
            throw new BusinessException(PaymentErrorCodes.REQUIRED_AGREEMENTS_NOT_ACCEPTED);
        }
    }
}

