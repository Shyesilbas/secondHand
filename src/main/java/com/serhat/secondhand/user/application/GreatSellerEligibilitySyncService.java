package com.serhat.secondhand.user.application;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GreatSellerEligibilitySyncService {

    private final UserRepository userRepository;
    private final GreatSellerService greatSellerService;
    private final EmailService emailService;
    private final EmailConfig emailConfig;
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    /**
     * Snapshotsiz ilk çalıştırma: kaydı günceller, bildirim göndermez (retroaktif spam önlenir).
     * Sonrasında false→true geçişinde in-app + e-posta.
     */
    @Transactional
    public void syncEligibilityAndNotify(Long sellerId) {
        if (sellerId == null) {
            return;
        }
        User user = userRepository.findById(sellerId).orElse(null);
        if (user == null || user.getAccountStatus() != AccountStatus.ACTIVE) {
            return;
        }

        boolean now = Boolean.TRUE.equals(greatSellerService.getStatus(sellerId).isEligible());
        Boolean previous = user.getGreatSellerEligibleSnapshot();

        if (previous == null) {
            user.setGreatSellerEligibleSnapshot(now);
            userRepository.save(user);
            return;
        }

        if (now && !previous) {
            notifyGreatSellerAchieved(user);
        }

        user.setGreatSellerEligibleSnapshot(now);
        userRepository.save(user);
    }

    private void notifyGreatSellerAchieved(User user) {
        try {
            var request = notificationTemplateCatalog.greatSellerAchieved(user.getId());
            notificationEventPublisher.publishDispatch(
                    request,
                    "greatSeller",
                    "great-seller:" + user.getId()
            );
        } catch (Exception e) {
            log.warn("Great Seller in-app notification failed for {}: {}", user.getId(), e.getMessage());
        }
        try {
            String subject = emailConfig.getGreatSellerSubject();
            org.thymeleaf.context.Context ctx = new org.thymeleaf.context.Context();
            ctx.setVariable("userName", user.getName());
            ctx.setVariable("headerTitle", "Harika Satıcı Rozeti!");
            ctx.setVariable("message", "Tebrikler — SecondHand'de Harika Satıcı rozeti kazandınız. Güvenilir satışlarınız ve harika yorumlarınız için teşekkür ederiz.");
            emailService.sendTemplateEmail(user, subject, "generic-notification", ctx, EmailType.GREAT_SELLER_ACHIEVEMENT);
        } catch (Exception e) {
            log.warn("Great Seller email failed for {}: {}", user.getId(), e.getMessage());
        }
    }
}
