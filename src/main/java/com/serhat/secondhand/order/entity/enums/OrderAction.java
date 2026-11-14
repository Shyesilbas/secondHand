package com.serhat.secondhand.order.entity.enums;

/**
 * An operation the current viewer may start on an order. The backend computes the set per viewer
 * ({@code OrderViewPolicy}) from the same policies that guard the endpoints; the frontend only
 * renders controls for the actions it receives.
 */
public enum OrderAction {
    /** Buyer: {@code PUT /{id}/cancel}. */
    CANCEL,
    /** Buyer: {@code POST /{id}/refund}, inside the refund window. */
    REFUND,
    /** Buyer: {@code PUT /{id}/complete} (confirm receipt). */
    COMPLETE,
    /** Buyer: {@code PUT /{id}/address} and {@code PUT /{id}/notes}. */
    EDIT,
    /** Buyer: create a review for the order's items. */
    REVIEW,
    /** Buyer: show the meetup OTP/QR code and regenerate it. */
    SHOW_MEETUP_CODE,
    /** Buyer or seller: {@code POST /{orderNumber}/confirm-handover-completion}. */
    CONFIRM_HANDOVER,
    /** Seller: {@code PUT /{id}/ship}. */
    SHIP,
    /** Seller: {@code POST /{orderNumber}/verify-meetup}. */
    VERIFY_MEETUP
}
