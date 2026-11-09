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
        return orderCreated(userId, orderId, orderNumber, null, null, null, null, null);
    }

    public NotificationRequest orderCreated(Long userId, Long orderId, String orderNumber,
                                            UUID listingId, String listingTitle, Integer itemCount,
                                            String totalAmount, String currency) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        payload.put(NotificationMetadataKeys.TOTAL_AMOUNT, safe(totalAmount));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CREATED,
                "Order placed",
                "Your order #" + safe(orderNumber) + " was placed successfully.",
                "/profile/orders",
                toJson(payload));
    }

    public NotificationRequest orderReceived(Long sellerId, Long orderId, String orderNumber, UUID listingId, String listingTitle) {
        return orderReceived(sellerId, orderId, orderNumber, listingId, listingTitle, null, null, null);
    }

    public NotificationRequest orderReceived(Long sellerId, Long orderId, String orderNumber,
                                             UUID listingId, String listingTitle, Integer itemCount,
                                             String totalAmount, String currency) {
        String title = "New order received";
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        payload.put(NotificationMetadataKeys.TOTAL_AMOUNT, safe(totalAmount));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
        return NotificationRequest.of(
                sellerId,
                NotificationType.ORDER_RECEIVED,
                title,
                "You received a new order for " + listingText + " (order #" + safe(orderNumber) + ").",
                "/profile/i-sold",
                toJson(payload));
    }

    public NotificationRequest orderCancelled(Long userId, Long orderId, String orderNumber) {
        return orderCancelled(userId, orderId, orderNumber, null, null, null);
    }

    public NotificationRequest orderCancelled(Long userId, Long orderId, String orderNumber,
                                              UUID listingId, String listingTitle, Integer itemCount) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CANCELLED,
                "Order cancelled",
                "Order #" + safe(orderNumber) + " was cancelled.",
                "/profile/orders",
                toJson(payload));
    }

    public NotificationRequest orderStatusChanged(Long userId, Long orderId, String orderNumber, String oldStatus, String newStatus) {
        return orderStatusChanged(userId, orderId, orderNumber, oldStatus, newStatus, null, null, null);
    }

    public NotificationRequest orderStatusChanged(Long userId, Long orderId, String orderNumber,
                                                  String oldStatus, String newStatus,
                                                  UUID listingId, String listingTitle, Integer itemCount) {
        String statusLabel = toTitle(newStatus);
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.OLD_STATUS, safe(oldStatus));
        payload.put(NotificationMetadataKeys.NEW_STATUS, safe(newStatus));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_STATUS_CHANGED,
                "Order status updated",
                "Order #" + safe(orderNumber) + " is now " + statusLabel + ".",
                "/profile/orders",
                toJson(payload));
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
        return offerReceived(userId, offerId, listingId, listingTitle, null, null);
    }

    public NotificationRequest offerReceived(Long userId, UUID offerId, UUID listingId, String listingTitle, String offerAmount, Integer quantity) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_RECEIVED,
                "New offer received",
                "You received a new offer for " + listingText + ".",
                "/offers",
                toJson(offerPayload(offerId, listingId, listingTitle, offerAmount, quantity)));
    }

    public NotificationRequest offerCountered(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        return offerCountered(userId, offerId, listingId, listingTitle, null, null);
    }

    public NotificationRequest offerCountered(Long userId, UUID offerId, UUID listingId, String listingTitle, String offerAmount, Integer quantity) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_COUNTERED,
                "Counter offer received",
                "You received a counter offer for " + listingText + ".",
                "/offers",
                toJson(offerPayload(offerId, listingId, listingTitle, offerAmount, quantity)));
    }

    public NotificationRequest offerAccepted(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        return offerAccepted(userId, offerId, listingId, listingTitle, null, null);
    }

    public NotificationRequest offerAccepted(Long userId, UUID offerId, UUID listingId, String listingTitle, String offerAmount, Integer quantity) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_ACCEPTED,
                "Offer accepted",
                "Your offer for " + listingText + " was accepted.",
                "/offers",
                toJson(offerPayload(offerId, listingId, listingTitle, offerAmount, quantity)));
    }

    public NotificationRequest offerRejected(Long userId, UUID offerId, UUID listingId, String listingTitle) {
        return offerRejected(userId, offerId, listingId, listingTitle, null, null);
    }

    public NotificationRequest offerRejected(Long userId, UUID offerId, UUID listingId, String listingTitle, String offerAmount, Integer quantity) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_REJECTED,
                "Offer rejected",
                "Your offer for " + listingText + " was rejected.",
                "/offers",
                toJson(offerPayload(offerId, listingId, listingTitle, offerAmount, quantity)));
    }

    public NotificationRequest offerExpired(Long userId, UUID offerId, UUID listingId, String listingTitle, boolean buyerSide) {
        return offerExpired(userId, offerId, listingId, listingTitle, buyerSide, null, null);
    }

    public NotificationRequest offerExpired(Long userId, UUID offerId, UUID listingId, String listingTitle, boolean buyerSide, String offerAmount, Integer quantity) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a listing" : ("“" + listingTitle + "”");
        String message = buyerSide
                ? ("Your offer for " + listingText + " has expired.")
                : ("An offer for " + listingText + " has expired.");
        Map<String, String> payload = offerPayload(offerId, listingId, listingTitle, offerAmount, quantity);
        payload.put(NotificationMetadataKeys.RECIPIENT_ROLE, buyerSide ? "BUYER" : "SELLER");
        return NotificationRequest.of(
                userId,
                NotificationType.OFFER_EXPIRED,
                "Offer expired",
                message,
                "/offers",
                toJson(payload));
    }

    private Map<String, String> offerPayload(UUID offerId, UUID listingId, String listingTitle, String offerAmount, Integer quantity) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.OFFER_ID, safeUuid(offerId));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.OFFER_AMOUNT, safe(offerAmount));
        payload.put(NotificationMetadataKeys.QUANTITY, safeId(quantity));
        return payload;
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
        return listingNewFromFollowed(userId, listingId, sellerId, listingTitle, null, null, null);
    }

    public NotificationRequest listingNewFromFollowed(Long userId, UUID listingId, Long sellerId, String listingTitle,
                                                      String sellerName, String amountText, String currency) {
        String listingText = listingTitle == null || listingTitle.isBlank() ? "a new listing" : ("“" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.SELLER_ID, sellerId == null ? "" : String.valueOf(sellerId));
        payload.put(NotificationMetadataKeys.SELLER_NAME, safe(sellerName));
        payload.put(NotificationMetadataKeys.AMOUNT_TEXT, safe(amountText));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
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
        payload.put(NotificationMetadataKeys.ACTOR_NAME, safe(actorName));
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

    public NotificationRequest paymentSucceeded(Long userId, String amountText, String currency, String listingTitle, String transactionTypeLabel) {
        return paymentSucceeded(userId, amountText, currency, listingTitle, transactionTypeLabel, null, null);
    }

    public NotificationRequest paymentSucceeded(Long userId, String amountText, String currency, String listingTitle,
                                                String transactionTypeLabel, String transactionTypeCode, UUID listingId) {
        String title = "Payment received";
        String listingPart = listingTitle == null || listingTitle.isBlank() ? "" : (" for “" + listingTitle + "”");
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.AMOUNT_TEXT, safe(amountText));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
        payload.put(NotificationMetadataKeys.TRANSACTION_TYPE, safe(transactionTypeLabel));
        payload.put(NotificationMetadataKeys.TRANSACTION_TYPE_CODE, safe(transactionTypeCode));
        return NotificationRequest.of(
                userId,
                NotificationType.PAYMENT_SUCCESS,
                title,
                "Your payment" + listingPart + " was successful (" + safe(amountText) + " " + safe(currency) + ").",
                "/ewallet",
                toJson(payload));
    }

    public NotificationRequest orderCompleted(Long buyerId, Long orderId, String orderNumber) {
        return orderCompleted(buyerId, orderId, orderNumber, null, null, null, null, null);
    }

    public NotificationRequest orderCompleted(Long buyerId, Long orderId, String orderNumber,
                                              UUID listingId, String listingTitle, Integer itemCount,
                                              String totalAmount, String currency) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        payload.put(NotificationMetadataKeys.TOTAL_AMOUNT, safe(totalAmount));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
        return NotificationRequest.of(
                buyerId,
                NotificationType.ORDER_COMPLETED,
                "Order completed",
                "Order #" + safe(orderNumber) + " is completed. Thank you for shopping!",
                "/profile/orders",
                toJson(payload));
    }

    public NotificationRequest orderRefunded(Long buyerId, Long orderId, String orderNumber) {
        return orderRefunded(buyerId, orderId, orderNumber, null, null, null, null, null);
    }

    public NotificationRequest orderRefunded(Long buyerId, Long orderId, String orderNumber,
                                             UUID listingId, String listingTitle, Integer itemCount,
                                             String totalAmount, String currency) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        payload.put(NotificationMetadataKeys.TOTAL_AMOUNT, safe(totalAmount));
        payload.put(NotificationMetadataKeys.CURRENCY, safe(currency));
        return NotificationRequest.of(
                buyerId,
                NotificationType.ORDER_REFUNDED,
                "Order refunded",
                "Order #" + safe(orderNumber) + " has been refunded.",
                "/profile/orders",
                toJson(payload));
    }

    /** The system cancelled an order its seller did not ship in time; the buyer is refunded. */
    public NotificationRequest orderCancelledShipDeadline(Long userId, Long orderId, String orderNumber, int deadlineHours, boolean sellerSide) {
        return orderCancelledShipDeadline(userId, orderId, orderNumber, deadlineHours, sellerSide, null, null, null);
    }

    public NotificationRequest orderCancelledShipDeadline(Long userId, Long orderId, String orderNumber,
                                                          int deadlineHours, boolean sellerSide,
                                                          UUID listingId, String listingTitle, Integer itemCount) {
        String message = sellerSide
                ? "Order #" + safe(orderNumber) + " was cancelled because it was not shipped within " + deadlineHours + " hours."
                : "Order #" + safe(orderNumber) + " was cancelled because the seller did not ship it within " + deadlineHours + " hours. Your payment was refunded.";
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.REASON, "SHIP_DEADLINE_MISSED");
        payload.put(NotificationMetadataKeys.RECIPIENT_ROLE, sellerSide ? "SELLER" : "BUYER");
        payload.put(NotificationMetadataKeys.DEADLINE_HOURS, String.valueOf(deadlineHours));
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CANCELLED,
                "Order cancelled",
                message,
                sellerSide ? "/profile/i-sold" : "/profile/orders",
                toJson(payload));
    }

    public NotificationRequest orderCancelledCounterparty(Long userId, Long orderId, String orderNumber) {
        return orderCancelledCounterparty(userId, orderId, orderNumber, null, null, null);
    }

    public NotificationRequest orderCancelledCounterparty(Long userId, Long orderId, String orderNumber,
                                                          UUID listingId, String listingTitle, Integer itemCount) {
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put(NotificationMetadataKeys.ORDER_ID, safeId(orderId));
        payload.put(NotificationMetadataKeys.ORDER_NUMBER, safe(orderNumber));
        payload.put(NotificationMetadataKeys.REASON, "COUNTERPARTY_CANCELLED");
        payload.put(NotificationMetadataKeys.LISTING_ID, safeUuid(listingId));
        payload.put(NotificationMetadataKeys.LISTING_TITLE, safe(listingTitle));
        payload.put(NotificationMetadataKeys.ITEM_COUNT, safeId(itemCount));
        return NotificationRequest.of(
                userId,
                NotificationType.ORDER_CANCELLED,
                "Order cancelled",
                "Order #" + safe(orderNumber) + " was cancelled by the other party.",
                "/profile/orders",
                toJson(payload));
    }

    public NotificationRequest greatSellerAchieved(Long userId) {
        return NotificationRequest.of(
                userId,
                NotificationType.GREAT_SELLER_ACHIEVED,
                "Great Seller",
                "You earned the Great Seller badge. Keep up the great work!",
                "/profile",
                toJson(Map.of(NotificationMetadataKeys.USER_ID, safeId(userId))));
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

