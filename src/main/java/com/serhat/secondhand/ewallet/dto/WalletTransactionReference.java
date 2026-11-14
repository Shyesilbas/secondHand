package com.serhat.secondhand.ewallet.dto;

import java.util.UUID;

/**
 * What a wallet credit or debit is for: the listing it concerns and, for order money, the order and order line.
 * orderExternalId is Order.externalId, the value payment.order_id stores; orderItemId is order_items.id.
 */
public record WalletTransactionReference(
        UUID listingId,
        String listingTitle,
        String listingNo,
        UUID orderExternalId,
        Long orderItemId
) {

    private static final WalletTransactionReference NONE = new WalletTransactionReference(null, null, null, null, null);

    public static WalletTransactionReference none() {
        return NONE;
    }
}
