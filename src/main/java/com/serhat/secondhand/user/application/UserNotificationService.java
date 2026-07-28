package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.*;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.core.verification.IVerificationService;
import com.serhat.secondhand.user.application.event.UserRegisteredEvent;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

@Service
@Slf4j
public class UserNotificationService {

    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;
    private final IVerificationService verificationService;

    public UserNotificationService(
            EmailEventPublisher emailEventPublisher,
            EmailConfig emailConfig,
            NotificationEventPublisher notificationEventPublisher,
            NotificationTemplateCatalog notificationTemplateCatalog,
            @Lazy IVerificationService verificationService) {
        this.emailEventPublisher = emailEventPublisher;
        this.emailConfig = emailConfig;
        this.notificationEventPublisher = notificationEventPublisher;
        this.notificationTemplateCatalog = notificationTemplateCatalog;
        this.verificationService = verificationService;
    }

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserRegistered(UserRegisteredEvent event) {
        sendWelcomeNotification(event.user());
        try {
            var verificationOpt = verificationService.findLatestActiveVerification(event.user(), com.serhat.secondhand.core.verification.CodeType.ACCOUNT_VERIFICATION);
            String code;
            if (verificationOpt.isPresent()) {
                code = verificationOpt.get().getCode();
            } else {
                code = verificationService.generateCode();
                verificationService.generateVerification(event.user(), code, com.serhat.secondhand.core.verification.CodeType.ACCOUNT_VERIFICATION);
            }
            sendVerificationCodeNotification(event.user(), code);
            log.info("Account verification code email sent on registration for user: {}", event.user().getEmail());
        } catch (Exception e) {
            log.warn("Failed to send account verification email on registration for user {}: {}", event.user().getEmail(), e.getMessage());
        }
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
                "  <p style=\"margin-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;\">Doğrulama Kodunuz</p>" +
                "  <div style=\"display: inline-block; background-color: #f0fdf4; border: 1px solid #a7f3d0; padding: 14px 32px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #047857; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;\">%s</div>" +
                "  <p style=\"margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: 600;\">Bu güvenlik kodu 15 dakika boyunca geçerlidir.</p>" +
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
                "  <p style=\"margin-bottom: 10px; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;\">Şifre Sıfırlama Kodunuz</p>" +
                "  <div style=\"display: inline-block; background-color: #f0fdf4; border: 1px solid #a7f3d0; padding: 14px 32px; border-radius: 14px; font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #047857; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;\">%s</div>" +
                "  <p style=\"margin-top: 10px; font-size: 12px; color: #94a3b8; font-weight: 600;\">Bu güvenlik kodu 15 dakika boyunca geçerlidir.</p>" +
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
