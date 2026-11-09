package com.serhat.secondhand.notification.util;

public final class NotificationMetadataKeys {

    private NotificationMetadataKeys() {
    }

    public static final String AGREEMENT_TYPE = "agreementType";
    public static final String VERSION = "version";

    public static final String ORDER_ID = "orderId";
    public static final String ORDER_NUMBER = "orderNumber";
    public static final String ITEM_COUNT = "itemCount";
    public static final String TOTAL_AMOUNT = "totalAmount";
    public static final String CURRENCY = "currency";
    public static final String AMOUNT_TEXT = "amountText";
    public static final String TRANSACTION_TYPE = "transactionType";
    public static final String TRANSACTION_TYPE_CODE = "transactionTypeCode";
    /** Why a notification was sent when the type alone does not say it, e.g. {@code SHIP_DEADLINE_MISSED}. */
    public static final String REASON = "reason";
    public static final String RECIPIENT_ROLE = "recipientRole";
    public static final String DEADLINE_HOURS = "deadlineHours";
    public static final String OLD_STATUS = "oldStatus";
    public static final String NEW_STATUS = "newStatus";

    public static final String OFFER_ID = "offerId";
    public static final String OFFER_AMOUNT = "offerAmount";
    public static final String QUANTITY = "quantity";

    public static final String LISTING_ID = "listingId";
    public static final String LISTING_TITLE = "listingTitle";
    public static final String SELLER_ID = "sellerId";
    public static final String SELLER_NAME = "sellerName";

    public static final String USER_ID = "userId";
    public static final String ACTOR_USER_ID = "actorUserId";
    public static final String ACTOR_NAME = "actorName";
    public static final String REVIEW_ID = "reviewId";
    public static final String RATING = "rating";
    public static final String ORDER_ITEM_ID = "orderItemId";

    public static final String OLD_PRICE = "oldPrice";
    public static final String NEW_PRICE = "newPrice";

    public static final String CHAT_ROOM_ID = "chatRoomId";
    public static final String SENDER_ID = "senderId";
    public static final String MESSAGE_ID = "messageId";
}

