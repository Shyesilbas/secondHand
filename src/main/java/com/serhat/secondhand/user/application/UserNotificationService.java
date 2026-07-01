package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.*;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
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

    private final EmailEventPublisher emailEventPublisher;
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

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Hoş Geldiniz!")
                    .message(content)
                    .build();

            emailEventPublisher.publish(new WelcomeEmailEvent(user, subject, data));
            log.info("Welcome notification event published for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish welcome notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    public void sendVerificationCodeNotification(User user, String verificationCode) {
        try {
            String subject = emailConfig.getVerificationSubject();
            String content = String.format(
                "<div style=\"text-align: center; margin: 24px 0;\">" +
                "  <p style=\"margin-bottom: 8px; font-size: 14px; color: #64748b; font-weight: 500;\">Doğrulama Kodunuz</p>" +
                "  <div style=\"display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 28px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5; font-family: monospace;\">%s</div>" +
                "  <p style=\"margin-top: 8px; font-size: 13px; color: #94a3b8;\">Bu kod 15 dakika boyunca geçerlidir.</p>" +
                "</div>",
                verificationCode
            );

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("E-posta Doğrulama")
                    .message(content)
                    .build();

            emailEventPublisher.publish(new VerificationCodeEmailEvent(user, subject, data));
            log.info("Verification code notification event published for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish verification code notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPasswordResetCodeNotification(User user, String verificationCode) {
        try {
            String subject = emailConfig.getPasswordResetSubject();
            String content = String.format(
                "<div style=\"text-align: center; margin: 24px 0;\">" +
                "  <p style=\"margin-bottom: 8px; font-size: 14px; color: #64748b; font-weight: 500;\">Şifre Sıfırlama Kodunuz</p>" +
                "  <div style=\"display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 28px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #4f46e5; font-family: monospace;\">%s</div>" +
                "  <p style=\"margin-top: 8px; font-size: 13px; color: #94a3b8;\">Bu kod 15 dakika boyunca geçerlidir.</p>" +
                "</div>",
                verificationCode
            );

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Şifre Sıfırlama")
                    .message(content)
                    .build();

            emailEventPublisher.publish(new PasswordResetEmailEvent(user, subject, data));
            log.info("Password reset code notification event published for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish password reset code notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPhoneNumberUpdatedNotification(User user) {
        try {
            String subject = emailConfig.getPhoneUpdateSubject();
            String content = "Telefon numaranız güncellendi. Bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.";

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Telefon Numarası Güncellendi")
                    .message(content)
                    .build();

            emailEventPublisher.publish(new PhoneUpdateEmailEvent(user, subject, data));
            log.info("Phone number update notification event published for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish phone update notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void sendPriceChangeNotification(User user, String listingTitle, String oldPriceStr, String newPriceStr, UUID listingId) {
        try {
            String subject = emailConfig.getPriceChangeSubject();
            String content = String.format("Favorilerinizdeki '%s' ilanının fiyatı %s'den %s'ye düştü.", listingTitle, oldPriceStr, newPriceStr);

            var data = GenericEmailData.builder()
                    .userName(user.getName())
                    .headerTitle("Fiyat Düştü!")
                    .message(content)
                    .actionText("İlanı İncele")
                    .actionUrl("/listings/" + listingId)
                    .build();

            emailEventPublisher.publish(new PriceChangeEmailEvent(user, subject, data));
            log.info("Price change notification event published for user: {}", user.getEmail());

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
            log.warn("Failed to publish price change notification for user {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
