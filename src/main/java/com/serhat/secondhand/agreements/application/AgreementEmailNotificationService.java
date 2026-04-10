package com.serhat.secondhand.agreements.application;

import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.repository.EmailRepository;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Agreement güncellemeleri yalnızca gelen kutusu (Email) üzerinden iletilir; in-app bildirim oluşturulmaz.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgreementEmailNotificationService {

    private static final String BODY_FOOTER = "\n\nOpen Agreements in your account: Profile → Agreements (or /agreements/all).";
    private static final int BROADCAST_BATCH_SIZE = 150;

    private final EmailService emailService;
    private final EmailRepository emailRepository;
    private final UserRepository userRepository;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    public void notifyUserOutdatedAgreement(Long userId, AgreementType agreementType, String currentVersion) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        NotificationRequest template = notificationTemplateCatalog.agreementUpdatedForUser(
                userId, agreementType.name(), currentVersion);
        String subject = buildSubject(template);
        if (emailRepository.existsByUser_IdAndEmailTypeAndSubject(user.getId(), EmailType.AGREEMENT_UPDATED, subject)) {
            return;
        }
        String body = template.getMessage() + BODY_FOOTER;
        emailService.sendEmail(user, subject, body, EmailType.AGREEMENT_UPDATED);
        log.debug("Agreement outdated email queued for userId={} type={}", userId, agreementType);
    }

    public void notifyAllUsersAgreementPublished(AgreementType agreementType, String version) {
        NotificationRequest template = notificationTemplateCatalog.agreementUpdatedBroadcast(agreementType.name(), version);
        String subject = buildSubject(template);
        String body = template.getMessage() + BODY_FOOTER;

        int page = 0;
        Pageable pageable = PageRequest.of(page, BROADCAST_BATCH_SIZE);
        Page<User> batch;
        do {
            batch = userRepository.findAll(pageable);
            List<User> users = batch.getContent();
            List<Long> userIds = users.stream().map(User::getId).toList();
            if (userIds.isEmpty()) {
                pageable = batch.nextPageable();
                continue;
            }
            Set<Long> alreadySentUserIds = emailRepository.findUserIdsBySubjectAndEmailType(
                    userIds, EmailType.AGREEMENT_UPDATED, subject);
            for (User u : users) {
                if (alreadySentUserIds.contains(u.getId())) {
                    continue;
                }
                emailService.sendEmail(u, subject, body, EmailType.AGREEMENT_UPDATED);
            }
            pageable = batch.nextPageable();
        } while (batch.hasNext());

        log.info("Agreement publish emails sent for type={} version={}", agreementType, version);
    }

    private String buildSubject(NotificationRequest template) {
        return "SecondHand: " + template.getTitle();
    }
}
