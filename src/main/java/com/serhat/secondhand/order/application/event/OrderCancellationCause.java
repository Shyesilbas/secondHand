package com.serhat.secondhand.order.application.event;

/** Why an order was cancelled; drives the wording of the buyer and seller messages. */
public enum OrderCancellationCause {
    /** A participant cancelled the order themselves. */
    PARTICIPANT_REQUEST,
    /** The system cancelled a cargo order the seller did not ship in time. */
    SHIP_DEADLINE_MISSED,
    /** The system cancelled an unshipped cargo order because the seller was banned. */
    SELLER_RESTRICTED;

    public boolean isSystemCancellation() {
        return this != PARTICIPANT_REQUEST;
    }
}
