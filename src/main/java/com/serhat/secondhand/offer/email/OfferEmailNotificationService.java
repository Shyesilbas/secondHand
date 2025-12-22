package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OfferEmailNotificationService {

    private final EmailService emailService;
    private final OfferEmailTemplateService templateService;

    public void notifyOfferReceived(Offer offer) {
        User recipient = offer != null ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_RECEIVED);
    }

    public void notifyCounterReceived(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getSeller() : actor == OfferActor.SELLER ? offer.getBuyer() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.counterReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_COUNTER_RECEIVED);
    }

    public void notifyAcceptedToCreator(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getBuyer() : actor == OfferActor.SELLER ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerAccepted(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_ACCEPTED);
    }

    public void notifyRejectedToCreator(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        User recipient = actor == OfferActor.BUYER ? offer.getBuyer() : actor == OfferActor.SELLER ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerRejected(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_REJECTED);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyExpiredToBoth(Offer offer) {
        if (offer == null) {
            return;
        }
        var t = templateService.offerExpired(offer);
        if (offer.getBuyer() != null) {
            emailService.sendEmail(offer.getBuyer(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
        }
        if (offer.getSeller() != null) {
            emailService.sendEmail(offer.getSeller(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
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

