package com.serhat.secondhand.payment.service;

import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentNotificationService {

    private final VerificationConfig verificationConfig;
    private final EmailService emailService;
    private final EmailConfig emailConfig;

    @Async("notificationExecutor")
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
                    user.getName(), code, verificationConfig.getExpiryMinutes());
            String content = base + (extraDetails != null ? ("\n" + extraDetails) : "");

            log.info("Attempting to send payment verification email to user: {}, code: {}", user.getEmail(), code);
            emailService.sendEmail(user, subject, content, EmailType.PAYMENT_VERIFICATION);
            log.info("Payment verification notification sent successfully to user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment verification notification to user {}: {}", user.getEmail(), e.getMessage(), e);
            throw new BusinessException("Failed to send payment verification email: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "PAYMENT_VERIFICATION_EMAIL_FAILED");
        }
    }
}
