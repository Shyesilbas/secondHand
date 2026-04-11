package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.offer.entity.Offer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OfferEmailTemplateService {

    private final EmailConfig emailConfig;

    public EmailTemplate offerReceived(Offer offer) {
        String subject = emailConfig.getOffer().getReceivedSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getReceivedHeadline());
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate counterReceived(Offer offer) {
        String subject = emailConfig.getOffer().getCounterReceivedSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getCounterReceivedHeadline());
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerAccepted(Offer offer) {
        String subject = emailConfig.getOffer().getAcceptedSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getAcceptedHeadline());
        content = content + "\n" + emailConfig.getOffer().getAcceptedNextStepLine() + "\n";
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerRejected(Offer offer) {
        String subject = emailConfig.getOffer().getRejectedSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getRejectedHeadline());
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerExpired(Offer offer) {
        String subject = emailConfig.getOffer().getExpiredSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getExpiredHeadline());
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerCompleted(Offer offer) {
        String subject = emailConfig.getOffer().getCompletedSubject();
        String content = buildBaseContent(offer, emailConfig.getOffer().getCompletedHeadline());
        return new EmailTemplate(subject, content);
    }

    private String buildBaseContent(Offer offer, String headline) {
        String listingTitle = offer != null && offer.getListing() != null && offer.getListing().getTitle() != null
                ? offer.getListing().getTitle()
                : emailConfig.getOffer().getListingFallback();
        String listingNo = offer != null && offer.getListing() != null ? offer.getListing().getListingNo() : null;
        Integer qty = offer != null ? offer.getQuantity() : null;
        BigDecimal total = offer != null ? offer.getTotalPrice() : null;
        BigDecimal unit = computeUnit(total, qty);
        LocalDateTime expiresAt = offer != null ? offer.getExpiresAt() : null;

        StringBuilder sb = new StringBuilder();
        sb.append(emailConfig.getOffer().getGreeting()).append("\n\n");
        sb.append(headline).append("\n\n");
        sb.append(emailConfig.getOffer().getListingLabel()).append(": ").append(listingTitle);
        if (listingNo != null && !listingNo.isBlank()) {
            sb.append(" (").append(listingNo).append(")");
        }
        sb.append("\n");
        sb.append(emailConfig.getOffer().getQuantityLabel()).append(": ").append(qty != null ? qty : 0).append("\n");
        sb.append(emailConfig.getOffer().getTotalPriceLabel()).append(": ").append(total != null ? total : BigDecimal.ZERO).append("\n");
        sb.append(emailConfig.getOffer().getUnitPriceLabel()).append(": ").append(unit != null ? unit : BigDecimal.ZERO).append("\n");
        if (expiresAt != null) {
            sb.append(emailConfig.getOffer().getExpiresAtLabel()).append(": ").append(expiresAt).append("\n");
        }
        sb.append("\n").append(emailConfig.getOffer().getClosing()).append("\n");
        return sb.toString();
    }

    private BigDecimal computeUnit(BigDecimal total, Integer quantity) {
        if (total == null || quantity == null || quantity <= 0) {
            return null;
        }
        return total.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP);
    }

    public record EmailTemplate(String subject, String content) {
    }
}

