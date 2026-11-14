package com.serhat.secondhand.payment.dto;

import java.time.LocalDateTime;

/** Response of {@code POST /initiate-verification}: the OTP stops being accepted at {@code expiresAt}. */
public record PaymentVerificationDto(LocalDateTime expiresAt) {
}
