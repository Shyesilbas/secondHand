package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericEmailData {
    private String userName;
    private String headerTitle;
    private String message;
    private String actionText;
    private String actionUrl;

    // One-time code block (verification, password reset, payment OTP)
    private String verificationCode;
    private String codeLabel;
    private String codeHint;

    // Structured receipt / order / details fields
    private String amount;
    private String amountLabel;
    private String currency;
    private String transactionNumber;
    private String typeLabel;
    private String listingTitle;
    private String paymentMethod;
    private String transactionDate;
}
