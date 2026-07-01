package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.*;
import com.serhat.secondhand.email.application.event.model.OfferEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
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

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferEmailNotificationService {

    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    @Async("notificationExecutor")
    public void notifyOfferReceived(Offer offer) {
        User recipient = offer != null ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        sendOfferTemplate(recipient, emailConfig.getOffer().getReceivedSubject(), "Yeni Bir Teklif Aldınız", offer, EmailType.OFFER_RECEIVED, null);

        var request = notificationTemplateCatalog.offerReceived(
                recipient.getId(), offer.getId(), offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(request, "offer", "offer-received:" + recipient.getId() + ":" + offer.getId());
    }

    @Async("notificationExecutor")
    public void notifyCounterReceived(Offer offer) {
        User recipient = getCounterRecipient(offer);
        if (recipient == null) return;
        sendOfferTemplate(recipient, emailConfig.getOffer().getCounterReceivedSubject(), "Karşı Teklif Aldınız", offer, EmailType.OFFER_COUNTER_RECEIVED, null);

        var request = notificationTemplateCatalog.offerCountered(
                recipient.getId(), offer.getId(), offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(request, "offer", "offer-countered:" + recipient.getId() + ":" + offer.getId());
    }

    @Async("notificationExecutor")
    public void notifyAcceptedToCreator(Offer offer) {
        User recipient = getCreator(offer);
        if (recipient == null) return;
        sendOfferTemplate(recipient, emailConfig.getOffer().getAcceptedSubject(), "Teklifiniz Kabul Edildi", offer, EmailType.OFFER_ACCEPTED, "Sıradaki Adım: Uygulama üzerinden ödemeyi tamamlayın.");

        var request = notificationTemplateCatalog.offerAccepted(
                recipient.getId(), offer.getId(), offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(request, "offer", "offer-accepted:" + recipient.getId() + ":" + offer.getId());
    }

    @Async("notificationExecutor")
    public void notifyRejectedToCreator(Offer offer) {
        User recipient = getCreator(offer);
        if (recipient == null) return;
        sendOfferTemplate(recipient, emailConfig.getOffer().getRejectedSubject(), "Teklifiniz Reddedildi", offer, EmailType.OFFER_REJECTED, null);

        var request = notificationTemplateCatalog.offerRejected(
                recipient.getId(), offer.getId(), offer.getListing().getId(),
                offer.getListing() != null ? offer.getListing().getTitle() : null
        );
        notificationEventPublisher.publishDispatch(request, "offer", "offer-rejected:" + recipient.getId() + ":" + offer.getId());
    }

    @Async("notificationExecutor")
    public void notifyExpiredToBoth(Offer offer) {
        if (offer == null) return;
        if (offer.getBuyer() != null) {
            sendOfferTemplate(offer.getBuyer(), emailConfig.getOffer().getExpiredSubject(), "Teklifinizin Süresi Doldu", offer, EmailType.OFFER_EXPIRED, null);
            var buyerRequest = notificationTemplateCatalog.offerExpired(
                    offer.getBuyer().getId(), offer.getId(), offer.getListing().getId(),
                    offer.getListing() != null ? offer.getListing().getTitle() : null, true
            );
            notificationEventPublisher.publishDispatch(buyerRequest, "offer", "offer-expired:" + offer.getBuyer().getId() + ":" + offer.getId() + ":buyer");
        }
        if (offer.getSeller() != null) {
            sendOfferTemplate(offer.getSeller(), emailConfig.getOffer().getExpiredSubject(), "Bir Teklifin Süresi Doldu", offer, EmailType.OFFER_EXPIRED, null);
            var sellerRequest = notificationTemplateCatalog.offerExpired(
                    offer.getSeller().getId(), offer.getId(), offer.getListing().getId(),
                    offer.getListing() != null ? offer.getListing().getTitle() : null, false
            );
            notificationEventPublisher.publishDispatch(sellerRequest, "offer", "offer-expired:" + offer.getSeller().getId() + ":" + offer.getId() + ":seller");
        }
    }

    @Async("notificationExecutor")
    public void notifyCompletedToBoth(Offer offer) {
        if (offer == null) return;
        if (offer.getBuyer() != null) {
            sendOfferTemplate(offer.getBuyer(), emailConfig.getOffer().getCompletedSubject(), "Teklif İşlemi Tamamlandı", offer, EmailType.OFFER_COMPLETED, null);
        }
        if (offer.getSeller() != null) {
            sendOfferTemplate(offer.getSeller(), emailConfig.getOffer().getCompletedSubject(), "Teklif İşlemi Tamamlandı", offer, EmailType.OFFER_COMPLETED, null);
        }
    }

    private void sendOfferTemplate(User recipient, String subject, String headline, Offer offer, EmailType type, String nextStep) {
        String unitPrice = "";
        if (offer.getTotalPrice() != null && offer.getQuantity() != null && offer.getQuantity() > 0) {
            unitPrice = offer.getTotalPrice().divide(BigDecimal.valueOf(offer.getQuantity()), 2, RoundingMode.HALF_UP) + " TL";
        }

        var data = OfferEmailData.builder()
                .userName(recipient.getName())
                .headerTitle(headline)
                .headline(headline)
                .listingTitle(offer.getListing() != null ? offer.getListing().getTitle() : "Bilinmeyen İlan")
                .quantity(offer.getQuantity() != null ? offer.getQuantity() : 0)
                .totalPrice(offer.getTotalPrice() != null ? (offer.getTotalPrice() + " TL") : "")
                .unitPrice(unitPrice)
                .expiresAt(offer.getExpiresAt() != null ? offer.getExpiresAt().toString() : "")
                .nextStep(nextStep)
                .build();

        EmailEvent<OfferEmailData> event = switch (type) {
            case OFFER_RECEIVED -> new OfferReceivedEmailEvent(recipient, subject, data);
            case OFFER_COUNTER_RECEIVED -> new OfferCounterReceivedEmailEvent(recipient, subject, data);
            case OFFER_ACCEPTED -> new OfferAcceptedEmailEvent(recipient, subject, data);
            case OFFER_REJECTED -> new OfferRejectedEmailEvent(recipient, subject, data);
            case OFFER_EXPIRED -> new OfferExpiredEmailEvent(recipient, subject, data);
            case OFFER_COMPLETED -> new OfferCompletedEmailEvent(recipient, subject, data);
            default -> throw new IllegalArgumentException("Unsupported offer email type: " + type);
        };

        emailEventPublisher.publish(event);
    }

    private User getCreator(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        return actor == OfferActor.BUYER ? offer.getBuyer() : actor == OfferActor.SELLER ? offer.getSeller() : null;
    }

    private User getCounterRecipient(Offer offer) {
        OfferActor actor = offer != null ? offer.getCreatedBy() : null;
        return actor == OfferActor.BUYER ? offer.getSeller() : actor == OfferActor.SELLER ? offer.getBuyer() : null;
    }
}
