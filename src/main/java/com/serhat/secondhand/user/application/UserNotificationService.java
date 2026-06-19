package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.application.event.UserRegisteredEvent;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserNotificationService {

    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserRegistered(UserRegisteredEvent event) {
        sendWelcomeNotification(event.user());
    }

    public void sendWelcomeNotification(User user) {
        try {
            String subject = emailConfig.getWelcomeSubject();
            String content = "SecondHand'e Hoş Geldiniz! Hesabınız başarıyla oluşturuldu. Artık ikinci el eşyalarınızı satabilir, beğendiğiniz ürünleri satın alabilir ve diğer kullanıcılarla güvenli bir şekilde iletişim kurabilirsiniz. Keyifli alışverişler!";
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Hoş Geldiniz!");
            ctx.setVariable("message", content);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.WELCOME);
            log.info("Welcome notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send welcome notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendVerificationCodeNotification(User user, String verificationCode) {
        try {
            String subject = emailConfig.getVerificationSubject();
            String content = String.format("Doğrulama kodunuz: %s. Bu kod 15 dakika boyunca geçerlidir.", verificationCode);
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "E-posta Doğrulama");
            ctx.setVariable("message", content);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.VERIFICATION_CODE);
            log.info("Verification code notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send verification code notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPasswordResetCodeNotification(User user, String verificationCode) {
        try {
            String subject = emailConfig.getPasswordResetSubject();
            String content = String.format("Şifre sıfırlama kodunuz: %s. Bu kod 15 dakika boyunca geçerlidir.", verificationCode);
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Şifre Sıfırlama");
            ctx.setVariable("message", content);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.PASSWORD_RESET);
            log.info("Password reset code notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send password reset code notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPhoneNumberUpdatedNotification(User user) {
        try {
            String subject = emailConfig.getPhoneUpdateSubject();
            String content = "Telefon numaranız güncellendi. Bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.";
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Telefon Numarası Güncellendi");
            ctx.setVariable("message", content);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.NOTIFICATION);
            log.info("Phone number update notification sent to user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send phone update notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPriceChangeNotification(User user, String listingTitle, String oldPriceStr, String newPriceStr, UUID listingId) {
        try {
            String subject = emailConfig.getPriceChangeSubject();
            String content = String.format("Favorilerinizdeki '%s' ilanının fiyatı %s'den %s'ye düştü.", listingTitle, oldPriceStr, newPriceStr);
            
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Fiyat Düştü!");
            ctx.setVariable("message", content);
            ctx.setVariable("actionText", "İlanı İncele");
            ctx.setVariable("actionUrl", "/listings/" + listingId);
            
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.NOTIFICATION);
            log.info("Price change notification sent to user: {}", user.getEmail());
            
            var request = notificationTemplateCatalog.listingPriceDropped(
                    user.getId(),
                    listingId,
                    oldPriceStr,
                    newPriceStr,
                    listingTitle
            );
            notificationEventPublisher.publishDispatch(
                    request,
                    "user",
                    "price-dropped:" + user.getId() + ":" + (listingId != null ? listingId : "no-listing") + ":" + newPriceStr
            );
        } catch (Exception e) {
            log.warn("Failed to send price change notification to user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
