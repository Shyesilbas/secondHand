package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.payment.dto.PaymentDto;

import java.util.List;

public interface IPaymentService {

    List<PaymentDto> getPayments();

}
