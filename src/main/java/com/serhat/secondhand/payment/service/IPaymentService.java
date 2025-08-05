package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface IPaymentService {

    List<PaymentDto> getPayments();
    PaymentDto createPayment(PaymentRequest paymentRequest);
    
    // Controller-specific methods
    Map<String, Object> getPaymentsPaginated(int page, int size, String sortBy, String sortDir);
    Map<String, Object> getPaymentStatistics();
    Map<String, Object> checkUserPaymentCapability(Authentication authentication);
    Map<String, Object> validatePaymentRequest(PaymentRequest paymentRequest);

}
