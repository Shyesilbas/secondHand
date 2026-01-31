package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserNotificationService {

    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final NotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    public void sendWelcomeNotification(User user) {
        try {
            String subject = emailConfig.getWelcomeSubject();
            String content = String.format(emailConfig.getWelcomeContent(), user.getName());
            emailService.sendEmail(user, subject, content, EmailType.WELCOME);
            log.info("Welcome notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send welcome notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendVerificationCodeNotification(User user, String verificationCode) {
        try {
            String subject = emailConfig.getVerificationSubject();
            String content = String.format(emailConfig.getVerificationContent(), user.getName(), verificationCode);
            emailService.sendEmail(user, subject, content, EmailType.VERIFICATION_CODE);
            log.info("Verification code notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send verification code notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPhoneNumberUpdatedNotification(User user) {
        try {
            String subject = emailConfig.getPhoneUpdateSubject();
            String content = String.format(emailConfig.getPhoneUpdateContent(), user.getName());
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Phone number update notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send phone update notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPriceChangeNotification(User user, String listingTitle, String oldPriceStr, String newPriceStr, UUID listingId) {
        try {
            String subject = emailConfig.getPriceChangeSubject();
            String content = String.format(emailConfig.getPriceChangeContent(), user.getName(), listingTitle, oldPriceStr, newPriceStr);
            emailService.sendEmail(user, subject, content, EmailType.NOTIFICATION);
            log.info("Price change notification sent to user: {}", user.getEmail());
            
            var notificationResult = notificationService.createAndSend(
                    notificationTemplateCatalog.listingPriceDropped(
                            user.getId(),
                            listingId,
                            oldPriceStr,
                            newPriceStr,
                            listingTitle
                    )
            );
            if (notificationResult.isError()) {
                log.error("Failed to create notification: {}", notificationResult.getMessage());
            }
        } catch (Exception e) {
            log.warn("Failed to send price change notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
