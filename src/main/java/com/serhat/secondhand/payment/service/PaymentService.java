package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.InitiateVerificationRequest;
import com.serhat.secondhand.payment.dto.ListingFeePaymentRequest;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final ListingFeeService listingFeeService;
    private final GenericPaymentService genericPaymentService;
    private final PaymentVerificationService paymentVerificationService;
    private final PurchasePaymentService purchasePaymentService;

    public PaymentDto createListingFeePayment(ListingFeePaymentRequest request, Authentication authentication) {
        PaymentRequest built = listingFeeService.buildListingFeePaymentRequest(request, authentication);
        return genericPaymentService.createPayment(built, authentication);
    }

    public PaymentDto createPayment(PaymentRequest paymentRequest, Authentication authentication) {
        return genericPaymentService.createPayment(paymentRequest, authentication);
    }

    public void initiatePaymentVerification(Authentication authentication, InitiateVerificationRequest req) {
        paymentVerificationService.initiatePaymentVerification(authentication,req);
    }

    public List<PaymentDto> createPurchasePayments(List<PaymentRequest> requests, Authentication authentication) {
        return purchasePaymentService.createPurchasePayments(requests, authentication);
    }
}
