package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PaymentProcessor paymentProcessor;

    @Transactional
    public List<PaymentDto> createPurchasePayments(List<PaymentRequest> requests, Authentication authentication) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessException(PaymentErrorCodes.EMPTY_PAYMENT_BATCH);
        }

        List<PaymentDto> results = new ArrayList<>();
        for (PaymentRequest request : requests) {
            validatePurchaseRequest(request);
            results.add(paymentProcessor.process(request, authentication));
        }
        return results;
    }

    @Transactional
    public PaymentDto createPayment(PaymentRequest request, Authentication authentication) {
        if (request.transactionType() == PaymentTransactionType.ITEM_PURCHASE) {
            validatePurchaseRequest(request);
        }
        return paymentProcessor.process(request, authentication);
    }

    private void validatePurchaseRequest(PaymentRequest request) {
        if (request.transactionType() != PaymentTransactionType.ITEM_PURCHASE) {
            throw new BusinessException(PaymentErrorCodes.INVALID_TXN_TYPE);
        }
        if (request.paymentDirection() != PaymentDirection.OUTGOING) {
            throw new BusinessException(PaymentErrorCodes.INVALID_DIRECTION);
        }
    }
}
