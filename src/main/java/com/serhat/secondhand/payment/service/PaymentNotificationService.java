package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationService {

    private final EmailService emailService;
    private final EmailConfig emailConfig;

    @Value("${app.verification.code.expiry.minutes:3}")
    private int verificationExpiryMinutes;

    public void sendPaymentSuccessNotification(User user, PaymentDto paymentDto, String listingTitle) {
        try {
            String subject = emailConfig.getPaymentSuccessSubject();
            String content = String.format(emailConfig.getPaymentSuccessContent(), 
                    user.getName(), listingTitle, paymentDto.amount(), paymentDto.transactionType());
            
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Payment success notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send payment success notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendPaymentVerificationNotification(User user, String code, String extraDetails) {
        try {
            String subject = emailConfig.getPaymentVerificationSubject();
            String base = String.format(emailConfig.getPaymentVerificationContent(), 
                    user.getName(), code, verificationExpiryMinutes);
            String content = base + (extraDetails != null ? ("\n" + extraDetails) : "");

            emailService.sendEmail(user, subject, content, EmailType.PAYMENT_VERIFICATION);
            log.info("Payment verification notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send payment verification notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
