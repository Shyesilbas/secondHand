package com.serhat.secondhand.offer.email;

import com.serhat.secondhand.offer.entity.Offer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OfferEmailTemplateService {

    public EmailTemplate offerReceived(Offer offer) {
        String subject = "SecondHand - New Offer Received";
        String content = buildBaseContent(offer, "You received a new offer.");
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate counterReceived(Offer offer) {
        String subject = "SecondHand - Counter Offer Received";
        String content = buildBaseContent(offer, "You received a counter offer.");
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerAccepted(Offer offer) {
        String subject = "SecondHand - Offer Accepted";
        String content = buildBaseContent(offer, "Your offer has been accepted.");
        content = content + "\nNext step: Complete checkout in the app.\n";
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerRejected(Offer offer) {
        String subject = "SecondHand - Offer Rejected";
        String content = buildBaseContent(offer, "Your offer has been rejected.");
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerExpired(Offer offer) {
        String subject = "SecondHand - Offer Expired";
        String content = buildBaseContent(offer, "An offer has expired.");
        return new EmailTemplate(subject, content);
    }

    public EmailTemplate offerCompleted(Offer offer) {
        String subject = "SecondHand - Offer Completed";
        String content = buildBaseContent(offer, "The purchase has been completed for this offer.");
        return new EmailTemplate(subject, content);
    }

    private String buildBaseContent(Offer offer, String headline) {
        String listingTitle = offer != null && offer.getListing() != null && offer.getListing().getTitle() != null ? offer.getListing().getTitle() : "Listing";
        String listingNo = offer != null && offer.getListing() != null ? offer.getListing().getListingNo() : null;
        Integer qty = offer != null ? offer.getQuantity() : null;
        BigDecimal total = offer != null ? offer.getTotalPrice() : null;
        BigDecimal unit = computeUnit(total, qty);
        LocalDateTime expiresAt = offer != null ? offer.getExpiresAt() : null;

        StringBuilder sb = new StringBuilder();
        sb.append("Hello,\n\n");
        sb.append(headline).append("\n\n");
        sb.append("Listing: ").append(listingTitle);
        if (listingNo != null && !listingNo.isBlank()) {
            sb.append(" (").append(listingNo).append(")");
        }
        sb.append("\n");
        sb.append("Quantity: ").append(qty != null ? qty : 0).append("\n");
        sb.append("Total price: ").append(total != null ? total : BigDecimal.ZERO).append("\n");
        sb.append("Unit price: ").append(unit != null ? unit : BigDecimal.ZERO).append("\n");
        if (expiresAt != null) {
            sb.append("Expires at: ").append(expiresAt).append("\n");
        }
        sb.append("\nBest regards,\nSecondHand Team\n");
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

