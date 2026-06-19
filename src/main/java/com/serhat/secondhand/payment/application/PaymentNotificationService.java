package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.config.VerificationConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
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
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    public void sendPaymentSuccessNotification(User user, PaymentDto paymentDto) {
        try {
            String subject = emailConfig.getPaymentSuccessSubject();
            String listingTitle = paymentDto.listingTitle() != null ? paymentDto.listingTitle() : "Ödeme";
            String content = String.format("'%s' başlıklı ilan için %s tutarındaki %s işleminiz başarıyla tamamlandı.",
                    listingTitle, paymentDto.amount(), paymentDto.transactionType());
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Ödeme Başarılı");
            ctx.setVariable("message", content);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.NOTIFICATION);
            log.info("Payment success notification sent to user: {}", user.getEmail());

            String amountText = paymentDto.amount() != null ? paymentDto.amount().toPlainString() : "";
            String cur = paymentDto.currency() != null ? paymentDto.currency() : "";
            String typeLabel = paymentDto.transactionType() != null ? paymentDto.transactionType().name() : "";
            notificationEventPublisher.publishDispatch(
                    notificationTemplateCatalog.paymentSucceeded(
                            user.getId(), amountText, cur, paymentDto.listingTitle(), typeLabel),
                    "payment", "payment-success:" + user.getId() + ":" + paymentDto.paymentId());
        } catch (Exception e) {
            log.warn("Failed to send payment success notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendPaymentVerificationNotification(User user, String code, String extraDetails) {
        try {
            String subject = emailConfig.getPaymentVerificationSubject();
            String base = String.format("Ödeme doğrulama kodunuz: %s. Bu kod %d dakika boyunca geçerlidir.", 
                    code, verificationConfig.getExpiryMinutes());
            String content = base + (extraDetails != null ? ("\n" + extraDetails) : "");

            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Ödeme Doğrulama");
            ctx.setVariable("message", content);

            log.info("Attempting to send payment verification email to user: {}, code: {}", user.getEmail(), code);
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.PAYMENT_VERIFICATION);
            log.info("Payment verification notification sent successfully to user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment verification notification to user {}: {}", user.getEmail(), e.getMessage(), e);
            throw new BusinessException("Failed to send payment verification email: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "PAYMENT_VERIFICATION_EMAIL_FAILED");
        }
    }
}
