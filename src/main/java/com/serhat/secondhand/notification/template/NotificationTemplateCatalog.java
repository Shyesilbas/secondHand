package com.serhat.secondhand.notification.template;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.notification.dto.NotificationRequest;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import com.serhat.secondhand.notification.util.NotificationMetadataKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificationTemplateCatalog {

    private final ObjectMapper objectMapper;

    public NotificationRequest agreementUpdatedBroadcast(String agreementType, String version) {
        String agreementName = toTitle(agreementType);
        String safeVersion = version == null ? "" : version.trim();
        String versionText = safeVersion.isEmpty() ? "" : (" v" + safeVersion);
        return NotificationRequest.of(
                null,
                NotificationType.AGREEMENT_UPDATED,
                "Agreement updated",
                "“" + agreementName + "” was updated" + versionText + ". Click to review and accept.",
                "/agreements/all",
                toJson(Map.of(
                        NotificationMetadataKeys.AGREEMENT_TYPE, agreementType,
                        NotificationMetadataKeys.VERSION, safeVersion
                )));
    }

    public NotificationRequest agreementUpdatedForUser(Long userId, String agreementType, String version) {
        NotificationRequest base = agreementUpdatedBroadcast(agreementType, version);
        return NotificationRequest.of(
                userId,
                base.getType(),
                base.getTitle(),
                base.getMessage(),
                base.getActionUrl(),
                base.getMetadata());
    }

    public NotificationRequest orderCreated(Long userId, Long orderId, String orderNumber) {
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CREATED,
                "Order placed",
                "Your order #" + safe(orderNumber) + " was placed successfully.",
                "/profile/orders",
                toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber)
                )));
    }

    public NotificationRequest orderReceived(Long sellerId, Long orderId, String orderNumber, UUID listingId, String listingTitle) {
        String title = listingTitle == null || listingTitle.isBlank() ? "New order received" : "New order received";
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        return NotificationRequest.of(
                sellerId,
                NotificationType.ORDER_RECEIVED,
                title,
                "You received a new order for " + listingText + " (order #" + safe(orderNumber) + ").",
                "/profile/i-sold",
                toJson(payload));
    }

    public NotificationRequest orderCancelled(Long userId, Long orderId, String orderNumber) {
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CANCELLED,
                "Order cancelled",
                "Order #" + safe(orderNumber) + " was cancelled.",
                "/profile/orders",
                toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber)
                )));
    }

    public NotificationRequest orderStatusChanged(Long userId, Long orderId, String orderNumber, String oldStatus, String newStatus) {
        String statusLabel = toTitle(newStatus);
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_STATUS_CHANGED,
                "Order status updated",
                "Order #" + safe(orderNumber) + " is now " + statusLabel + ".",
                "/profile/orders",
                toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber),
                        NotificationMetadataKeys.OLD_STATUS, safe(oldStatus),
                        NotificationMetadataKeys.NEW_STATUS, safe(newStatus)
                )));
    }

    public NotificationRequest listingSold(Long sellerId, UUID listingId, Long orderId, String orderNumber, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "Your listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        return NotificationRequest.of(
                sellerId,
                NotificationType.LISTING_SOLD,
                "Listing sold",
                listingText + " was sold (order #" + safe(orderNumber) + ").",
                "/profile/i-sold",
                toJson(payload));
    }

    public NotificationRequest offerReceived(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_RECEIVED,
                "New offer received",
                "You received a new offer for " + listingText + ".",
                "/offers",
                toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )));
    }

    public NotificationRequest offerCountered(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_COUNTERED,
                "Counter offer received",
                "You received a counter offer for " + listingText + ".",
                "/offers",
                toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )));
    }

    public NotificationRequest offerAccepted(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_ACCEPTED,
                "Offer accepted",
                "Your offer for " + listingText + " was accepted.",
                "/offers",
                toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )));
    }

    public NotificationRequest offerRejected(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_REJECTED,
                "Offer rejected",
                "Your offer for " + listingText + " was rejected.",
                "/offers",
                toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )));
    }

    public NotificationRequest offerExpired(Long userId, UUID offerId, UUID listingId, String listingTitle, boolean buyerSide) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        String message = buyerSide
                ? ("Your offer for " + listingText + " has expired.")
                : ("An offer for " + listingText + " has expired.");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_EXPIRED,
                "Offer expired",
                message,
                "/offers",
                toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )));
    }

    public NotificationRequest listingPriceDropped(Long userId, UUID listingId, String oldPrice, String newPrice, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        String oldPart = oldPrice == null || oldPrice.isBlank() ? "" : (" from " + oldPrice);
        String newPart = newPrice == null || newPrice.isBlank() ? "" : (" to " + newPrice);
        String priceText = (oldPart.isEmpty() && newPart.isEmpty()) ? "" : (oldPart + newPart);
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.OLD_PRICE, safe(oldPrice));
        payload.put(NotificationMetadataKeys.NEW_PRICE, safe(newPrice));
        return NotificationRequest.of(
                userId,
                NotificationType.LISTING_PRICE_DROPPED,
                "Price dropped",
                "The price dropped for " + listingText + priceText + ".",
                "/listings/" + safeUuid(listingId),
                toJson(payload));
    }

    public NotificationRequest listingNewFromFollowed(Long userId, UUID listingId, Long sellerId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a new listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.SELLER_ID, sellerId == null ? "" : String.valueOf(sellerId));
        return NotificationRequest.of(
                userId,
                NotificationType.LISTING_NEW_FROM_FOLLOWED,
                "New listing",
                "A seller you follow posted " + listingText + ".",
                "/listings/" + safeUuid(listingId),
                toJson(payload));
    }

    public NotificationRequest listingFavorited(Long sellerId, UUID listingId, String listingTitle, Long actorUserId, String actorName) {
        String safeActor = actorName == null || actorName.isBlank() ? "Someone" : actorName;
        String listingText = listingTitle == null || listingTitle.isBlank() ? "your listing" : ("\"" + listingTitle + "\"");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ACTOR_USER_ID, safeId(actorUserId));
        return NotificationRequest.of(
                sellerId,
                NotificationType.LISTING_FAVORITED,
                "Listing favorited",
                safeActor + " favorited " + listingText + ".",
                "/listings/" + safeUuid(listingId),
                toJson(payload));
    }

    public NotificationRequest reviewReceived(Long recipientUserId, Long reviewedUserId, Integer reviewId, Integer rating, Long orderItemId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "" : (" for “" + listingTitle + "”");
        String ratingText = rating == null ? "" : (" (" + rating + "/5)");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.USER_ID, safeId(reviewedUserId));
        payload.put(NotificationMetadataKeys.REVIEW_ID, safeId(reviewId));
        payload.put(NotificationMetadataKeys.RATING, safeId(rating));
        payload.put(NotificationMetadataKeys.ORDER_ITEM_ID, safeId(orderItemId));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        return NotificationRequest.of(
                recipientUserId,
                NotificationType.REVIEW_RECEIVED,
                "New review received",
                "You received a new review" + listingText + ratingText + ".",
                "/users/" + safeId(reviewedUserId) + "/reviews",
                toJson(payload));
    }

    public NotificationRequest chatMessageReceived(Long userId, String chatRoomId, String senderId, String messageId, String senderName, String messagePreview) {
        String message;
        if (senderName != null && !senderName.isBlank() && messagePreview != null && !messagePreview.isBlank()) {
            message = senderName + ": " + messagePreview;
        } else if (senderName != null && !senderName.isBlank()) {
            message = "New message from " + senderName + ".";
        } else {
            message = "You received a new message.";
        }
        return NotificationRequest.of(
                userId,
                NotificationType.CHAT_MESSAGE_RECEIVED,
                "New message",
                message,
                "/chat?room=" + safe(chatRoomId),
                toJson(Map.of(
                        NotificationMetadataKeys.CHAT_ROOM_ID, safe(chatRoomId),
                        NotificationMetadataKeys.SENDER_ID, safe(senderId),
                        NotificationMetadataKeys.MESSAGE_ID, safe(messageId)
                )));
    }

    private String toJson(Map<String, String> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to build notification metadata", e);
        }
    }

    private String safeUuid(UUID id) {
        return id == null ? "" : id.toString();
    }

    private String safeId(Object id) {
        return id == null ? "" : String.valueOf(id);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String toTitle(String code) {
        if (code == null) return "";
        String lower = String.valueOf(code).replace('_', ' ').toLowerCase(Locale.ROOT);
        String[] parts = lower.split(" ");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p.isBlank()) continue;
            sb.append(Character.toUpperCase(p.charAt(0)));
            if (p.length() > 1) sb.append(p.substring(1));
            sb.append(' ');
        }
        return sb.toString().trim();
    }
}

