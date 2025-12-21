package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class InitiateVerificationRequest {
    private PaymentTransactionType transactionType;
    private PaymentType paymentType;
    private UUID listingId;
    private BigDecimal amount;
    private String receiverName;
    private String receiverSurname;
    private Integer days;
    private String couponCode;
    private UUID offerId;

}


