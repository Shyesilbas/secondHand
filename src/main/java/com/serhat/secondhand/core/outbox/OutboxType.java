package com.serhat.secondhand.core.outbox;

/** The transactional outbox tables that can be inspected and requeued by operators. */
public enum OutboxType {
    PAYMENT,
    ORDER,
    ESCROW
}
