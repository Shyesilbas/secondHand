package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
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
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    public void notifyOfferReceived(Offer offer) {
        User recipient = offer != null ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_RECEIVED);
        
        var request = notificationTemplateCatalog.offerReceived(
                recipient.getId(),
                offer.getId(),
                offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(
                request,
                "offer",
                "offer-received:" + recipient.getId() + ":" + offer.getId()
        );
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
        
        var request = notificationTemplateCatalog.offerCountered(
                recipient.getId(),
                offer.getId(),
                offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(
                request,
                "offer",
                "offer-countered:" + recipient.getId() + ":" + offer.getId()
        );
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
        
        var request = notificationTemplateCatalog.offerAccepted(
                recipient.getId(),
                offer.getId(),
                offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(
                request,
                "offer",
                "offer-accepted:" + recipient.getId() + ":" + offer.getId()
        );
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
        
        var request = notificationTemplateCatalog.offerRejected(
                recipient.getId(),
                offer.getId(),
                offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(
                request,
                "offer",
                "offer-rejected:" + recipient.getId() + ":" + offer.getId()
        );
    }

    @Async("notificationExecutor")
    public void notifyExpiredToBoth(Offer offer) {
        if (offer == null) {
            return;
        }
        var t = templateService.offerExpired(offer);
        
        if (offer.getBuyer() != null) {
            emailService.sendEmail(offer.getBuyer(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
            var buyerRequest = notificationTemplateCatalog.offerExpired(
                    offer.getBuyer().getId(),
                    offer.getId(),
                    offer.getListing().getId(),
                    offer.getListing() != null ? offer.getListing().getTitle() : null,
                    true
            );
            notificationEventPublisher.publishDispatch(
                    buyerRequest,
                    "offer",
                    "offer-expired:" + offer.getBuyer().getId() + ":" + offer.getId() + ":buyer"
            );
         }
         if (offer.getSeller() != null) {
             emailService.sendEmail(offer.getSeller(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
            var sellerRequest = notificationTemplateCatalog.offerExpired(
                    offer.getSeller().getId(),
                    offer.getId(),
                    offer.getListing().getId(),
                    offer.getListing() != null ? offer.getListing().getTitle() : null,
                    false
            );
            notificationEventPublisher.publishDispatch(
                    sellerRequest,
                    "offer",
                    "offer-expired:" + offer.getSeller().getId() + ":" + offer.getId() + ":seller"
            );
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

