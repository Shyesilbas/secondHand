package com.serhat.secondhand.offer.email;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferEmailNotificationService {

    private final EmailService emailService;
    private final OfferEmailTemplateService templateService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Async("notificationExecutor")
    public void notifyOfferReceived(Offer offer) {
        User recipient = offer != null ? offer.getSeller() : null;
        if (recipient == null) {
            return;
        }
        var t = templateService.offerReceived(offer);
        emailService.sendEmail(recipient, t.subject(), t.content(), EmailType.OFFER_RECEIVED);
        
        try {
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "offerId", offer.getId().toString(),
                    "listingId", offer.getListing().getId().toString()
            ));
            var notificationResult = notificationService.createAndSend(NotificationRequest.builder()
                    .userId(recipient.getId())
                    .type(NotificationType.OFFER_RECEIVED)
                    .title("Yeni Teklif Aldınız")
                    .message(String.format("%s %s size '%s' için %s TRY teklif yaptı",
                            offer.getBuyer().getName(), offer.getBuyer().getSurname(),
                            offer.getListing().getTitle(), offer.getTotalPrice()))
                    .actionUrl("/offers/received")
                    .metadata(metadata)
                    .build());
            if (notificationResult.isError()) {
                log.error("Failed to create notification: {}", notificationResult.getMessage());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for offer received", e);
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
        
        try {
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "offerId", offer.getId().toString(),
                    "listingId", offer.getListing().getId().toString()
            ));
            var notificationResult = notificationService.createAndSend(NotificationRequest.builder()
                    .userId(recipient.getId())
                    .type(NotificationType.OFFER_COUNTERED)
                    .title("Karşı Teklif Aldınız")
                    .message(String.format("Satıcı '%s' için %s TRY karşı teklif yaptı",
                            offer.getListing().getTitle(), offer.getTotalPrice()))
                    .actionUrl("/offers/made")
                    .metadata(metadata)
                    .build());
            if (notificationResult.isError()) {
                log.error("Failed to create notification: {}", notificationResult.getMessage());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for offer countered", e);
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
        
        try {
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "offerId", offer.getId().toString(),
                    "listingId", offer.getListing().getId().toString()
            ));
            var notificationResult = notificationService.createAndSend(NotificationRequest.builder()
                    .userId(recipient.getId())
                    .type(NotificationType.OFFER_ACCEPTED)
                    .title("Teklifiniz Kabul Edildi")
                    .message(String.format("'%s' için yaptığınız teklif kabul edildi", offer.getListing().getTitle()))
                    .actionUrl("/offers/made")
                    .metadata(metadata)
                    .build());
            if (notificationResult.isError()) {
                log.error("Failed to create notification: {}", notificationResult.getMessage());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for offer accepted", e);
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
        
        try {
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "offerId", offer.getId().toString(),
                    "listingId", offer.getListing().getId().toString()
            ));
            var notificationResult = notificationService.createAndSend(NotificationRequest.builder()
                    .userId(recipient.getId())
                    .type(NotificationType.OFFER_REJECTED)
                    .title("Teklifiniz Reddedildi")
                    .message(String.format("'%s' için yaptığınız teklif reddedildi", offer.getListing().getTitle()))
                    .actionUrl("/offers/made")
                    .metadata(metadata)
                    .build());
            if (notificationResult.isError()) {
                log.error("Failed to create notification: {}", notificationResult.getMessage());
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for offer rejected", e);
        }
    }

    @Async("notificationExecutor")
    public void notifyExpiredToBoth(Offer offer) {
        if (offer == null) {
            return;
        }
        var t = templateService.offerExpired(offer);
        
        try {
            String metadata = objectMapper.writeValueAsString(Map.of(
                    "offerId", offer.getId().toString(),
                    "listingId", offer.getListing().getId().toString()
            ));
            
            if (offer.getBuyer() != null) {
                emailService.sendEmail(offer.getBuyer(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
                var buyerNotificationResult = notificationService.createAndSend(NotificationRequest.builder()
                        .userId(offer.getBuyer().getId())
                        .type(NotificationType.OFFER_EXPIRED)
                        .title("Teklif Süresi Doldu")
                        .message(String.format("'%s' için yaptığınız teklifin süresi doldu", offer.getListing().getTitle()))
                        .actionUrl("/offers/made")
                        .metadata(metadata)
                        .build());
                if (buyerNotificationResult.isError()) {
                    log.error("Failed to create notification: {}", buyerNotificationResult.getMessage());
                }
            }
            if (offer.getSeller() != null) {
                emailService.sendEmail(offer.getSeller(), t.subject(), t.content(), EmailType.OFFER_EXPIRED);
                var sellerNotificationResult = notificationService.createAndSend(NotificationRequest.builder()
                        .userId(offer.getSeller().getId())
                        .type(NotificationType.OFFER_EXPIRED)
                        .title("Teklif Süresi Doldu")
                        .message(String.format("'%s' için aldığınız teklifin süresi doldu", offer.getListing().getTitle()))
                        .actionUrl("/offers/received")
                        .metadata(metadata)
                        .build());
                if (sellerNotificationResult.isError()) {
                    log.error("Failed to create notification: {}", sellerNotificationResult.getMessage());
                }
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to create in-app notification for offer expired", e);
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

