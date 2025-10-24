package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentOrchestrator {
    
    private final PaymentService paymentService;
    private final PaymentVerificationService paymentVerificationService;

    public List<PaymentDto> processPayments(List<PaymentRequest> requests, Authentication authentication) {
        return paymentService.createPurchasePayments(requests, authentication);
    }

    public void validateOrGenerateVerification(User user, String code) {
        paymentVerificationService.validateOrGenerateVerification(user, code);
    }
}
