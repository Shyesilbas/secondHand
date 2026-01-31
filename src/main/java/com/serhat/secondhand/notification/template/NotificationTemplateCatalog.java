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
        return NotificationRequest.builder()
                .type(NotificationType.AGREEMENT_UPDATED)
                .title("Agreement updated")
                .message("“" + agreementName + "” was updated" + versionText + ". Click to review and accept.")
                .actionUrl("/agreements/all")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.AGREEMENT_TYPE, agreementType,
                        NotificationMetadataKeys.VERSION, safeVersion
                )))
                .build();
    }

    public NotificationRequest agreementUpdatedForUser(Long userId, String agreementType, String version) {
        NotificationRequest base = agreementUpdatedBroadcast(agreementType, version);
        return NotificationRequest.builder()
                .userId(userId)
                .type(base.getType())
                .title(base.getTitle())
                .message(base.getMessage())
                .actionUrl(base.getActionUrl())
                .metadata(base.getMetadata())
                .build();
    }

    public NotificationRequest orderCreated(Long userId, Long orderId, String orderNumber) {
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.ORDER_CREATED)
                .title("Order placed")
                .message("Your order #" + safe(orderNumber) + " was placed successfully.")
                .actionUrl("/profile/orders")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber)
                )))
                .build();
    }

    public NotificationRequest orderReceived(Long sellerId, Long orderId, String orderNumber, UUID listingId, String listingTitle) {
        String title = listingTitle == null || listingTitle.isBlank() ? "New order received" : "New order received";
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        return NotificationRequest.builder()
                .userId(sellerId)
                .type(NotificationType.ORDER_RECEIVED)
                .title(title)
                .message("You received a new order for " + listingText + " (order #" + safe(orderNumber) + ").")
                .actionUrl("/profile/i-sold")
                .metadata(toJson(payload))
                .build();
    }

    public NotificationRequest orderCancelled(Long userId, Long orderId, String orderNumber) {
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.ORDER_CANCELLED)
                .title("Order cancelled")
                .message("Order #" + safe(orderNumber) + " was cancelled.")
                .actionUrl("/profile/orders")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber)
                )))
                .build();
    }

    public NotificationRequest orderStatusChanged(Long userId, Long orderId, String orderNumber, String oldStatus, String newStatus) {
        String statusLabel = toTitle(newStatus);
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.ORDER_STATUS_CHANGED)
                .title("Order status updated")
                .message("Order #" + safe(orderNumber) + " is now " + statusLabel + ".")
                .actionUrl("/profile/orders")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.ORDER_ID, safeId(orderId),
                        NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber),
                        NotificationMetadataKeys.OLD_STATUS, safe(oldStatus),
                        NotificationMetadataKeys.NEW_STATUS, safe(newStatus)
                )))
                .build();
    }

    public NotificationRequest listingSold(Long sellerId, UUID listingId, Long orderId, String orderNumber, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "Your listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        return NotificationRequest.builder()
                .userId(sellerId)
                .type(NotificationType.LISTING_SOLD)
                .title("Listing sold")
                .message(listingText + " was sold (order #" + safe(orderNumber) + ").")
                .actionUrl("/profile/i-sold")
                .metadata(toJson(payload))
                .build();
    }

    public NotificationRequest offerReceived(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.OFFER_RECEIVED)
                .title("New offer received")
                .message("You received a new offer for " + listingText + ".")
                .actionUrl("/offers")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )))
                .build();
    }

    public NotificationRequest offerCountered(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.OFFER_COUNTERED)
                .title("Counter offer received")
                .message("You received a counter offer for " + listingText + ".")
                .actionUrl("/offers")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )))
                .build();
    }

    public NotificationRequest offerAccepted(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.OFFER_ACCEPTED)
                .title("Offer accepted")
                .message("Your offer for " + listingText + " was accepted.")
                .actionUrl("/offers")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )))
                .build();
    }

    public NotificationRequest offerRejected(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.OFFER_REJECTED)
                .title("Offer rejected")
                .message("Your offer for " + listingText + " was rejected.")
                .actionUrl("/offers")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )))
                .build();
    }

    public NotificationRequest offerExpired(Long userId, UUID offerId, UUID listingId, String listingTitle, boolean buyerSide) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        String message = buyerSide
                ? ("Your offer for " + listingText + " has expired.")
                : ("An offer for " + listingText + " has expired.");
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.OFFER_EXPIRED)
                .title("Offer expired")
                .message(message)
                .actionUrl("/offers")
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.OFFER_ID, safeUuid(offerId),
                        NotificationMetadataKeys.LISTING_ID, safeUuid(listingId),
                        NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle)
                )))
                .build();
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
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.LISTING_PRICE_DROPPED)
                .title("Price dropped")
                .message("The price dropped for " + listingText + priceText + ".")
                .actionUrl("/listings/" + safeUuid(listingId))
                .metadata(toJson(payload))
                .build();
    }

    public NotificationRequest listingNewFromFollowed(Long userId, UUID listingId, Long sellerId, String listingTitle) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a new listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.SELLER_ID, sellerId == null ? "" : String.valueOf(sellerId));
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.LISTING_NEW_FROM_FOLLOWED)
                .title("New listing")
                .message("A seller you follow posted " + listingText + ".")
                .actionUrl("/listings/" + safeUuid(listingId))
                .metadata(toJson(payload))
                .build();
    }

    public NotificationRequest listingFavorited(Long sellerId, UUID listingId, String listingTitle, Long actorUserId, String actorName) {
        String safeActor = actorName == null || actorName.isBlank() ? "Someone" : actorName;
        String listingText = listingTitle == null || listingTitle.isBlank() ? "your listing" : ("\"" + listingTitle + "\"");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ACTOR_USER_ID, safeId(actorUserId));
        return NotificationRequest.builder()
                .userId(sellerId)
                .type(NotificationType.LISTING_FAVORITED)
                .title("Listing favorited")
                .message(safeActor + " favorited " + listingText + ".")
                .actionUrl("/listings/" + safeUuid(listingId))
                .metadata(toJson(payload))
                .build();
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
        return NotificationRequest.builder()
                .userId(recipientUserId)
                .type(NotificationType.REVIEW_RECEIVED)
                .title("New review received")
                .message("You received a new review" + listingText + ratingText + ".")
                .actionUrl("/users/" + safeId(reviewedUserId) + "/reviews")
                .metadata(toJson(payload))
                .build();
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
        return NotificationRequest.builder()
                .userId(userId)
                .type(NotificationType.CHAT_MESSAGE_RECEIVED)
                .title("New message")
                .message(message)
                .actionUrl("/chat?room=" + safe(chatRoomId))
                .metadata(toJson(Map.of(
                        NotificationMetadataKeys.CHAT_ROOM_ID, safe(chatRoomId),
                        NotificationMetadataKeys.SENDER_ID, safe(senderId),
                        NotificationMetadataKeys.MESSAGE_ID, safe(messageId)
                )))
                .build();
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

