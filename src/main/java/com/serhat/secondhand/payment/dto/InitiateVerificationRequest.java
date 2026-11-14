package com.serhat.secondhand.payment.dto;

import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
/**
 * Identifies what the OTP is for. It carries no amount: the e-mail shows the price the backend
 * computes for the transaction type, never a client-supplied figure.
 */
public class InitiateVerificationRequest {
    private PaymentTransactionType transactionType;
    private String providerName;
    private UUID listingId;
    private String receiverName;
    private String receiverSurname;
    private Integer days;
    private String couponCode;
    private UUID offerId;

}


