package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferEmailNotificationService {

    private final EmailService emailService;
    private final OfferEmailTemplateService templateService;
    private final NotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    public void notifyOfferReceived(Offer offer) {
        User recipient = offer != null ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_RECEIVED);
        
        var notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.offerReceived(
                        recipient.getId(),
                        offer.getId(),
                        offer.getListing().getId(),
                        offer.getListing() != null ? offer.getListing().getTitle() : null
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void notifyCounterReceived(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getSeller() : actor == OfferActor.SELLER ? offer.getBuyer() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.counterReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_COUNTER_RECEIVED);
        
        var notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.offerCountered(
                        recipient.getId(),
                        offer.getId(),
                        offer.getListing().getId(),
                        offer.getListing() != null ? offer.getListing().getTitle() : null
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void notifyAcceptedToCreator(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getBuyer() : actor == OfferActor.SELLER ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerAccepted(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_ACCEPTED);
        
        var notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.offerAccepted(
                        recipient.getId(),
                        offer.getId(),
                        offer.getListing().getId(),
                        offer.getListing() != null ? offer.getListing().getTitle() : null
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void notifyRejectedToCreator(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getBuyer() : actor == OfferActor.SELLER ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerRejected(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_REJECTED);
        
        var notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.offerRejected(
                        recipient.getId(),
                        offer.getId(),
                        offer.getListing().getId(),
                        offer.getListing() != null ? offer.getListing().getTitle() : null
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
    }

    @Async("notificationExecutor")
    public void notifyExpiredToBoth(Offer offer) {
        if (offer == null) {
            return;
        }
        var t = templateService.offerExpired(offer);
        
        if (offer.getBuyer() != null) {
            emailService.sendEmail(offer.getBuyer(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
            var buyerNotificationResult = notificationService.createAndSend(
                    notificationTemplateCatalog.offerExpired(
                            offer.getBuyer().getId(),
                            offer.getId(),
                            offer.getListing().getId(),
                            offer.getListing() != null ? offer.getListing().getTitle() : null,
                            true
                    )
            );
            if (buyerNotificationResult.isError()) {
                log.error("Failed to create notification: {}", buyerNotificationResult.getMessage());
            }
        }
        if (offer.getSeller() != null) {
            emailService.sendEmail(offer.getSeller(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
            var sellerNotificationResult = notificationService.createAndSend(
                    notificationTemplateCatalog.offerExpired(
                            offer.getSeller().getId(),
                            offer.getId(),
                            offer.getListing().getId(),
                            offer.getListing() != null ? offer.getListing().getTitle() : null,
                            false
                    )
            );
            if (sellerNotificationResult.isError()) {
                log.error("Failed to create notification: {}", sellerNotificationResult.getMessage());
            }
        }
    }

    @Async("notificationExecutor")
    public void notifyCompletedToBoth(Offer offer) {
        if (offer == null) {
            return;
        }
        var t = templateService.offerCompleted(offer);
        if (offer.getBuyer() != null) {
            emailService.sendEmail(offer.getBuyer(), t.subject(), t.content(), EmailType.OFFER_COMPLETED);
        }
        if (offer.getSeller() != null) {
            emailService.sendEmail(offer.getSeller(), t.subject(), t.content(), EmailType.OFFER_COMPLETED);
        }
    }
}

