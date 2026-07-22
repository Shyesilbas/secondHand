package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class InitiateVerificationRequest {
    private PaymentTransactionType transactionType;
    private String providerName;
    private UUID listingId;
    private BigDecimal amount;
    private String receiverName;
    private String receiverSurname;
    private Integer days;
    private String couponCode;
    private UUID offerId;
    private boolean isBulk;
    private String customTitle;

}


