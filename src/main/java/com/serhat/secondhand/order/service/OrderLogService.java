package com.serhat.secondhand.order.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Centralized logging service for the Order package.
 * Provides semantic, structured log methods with consistent format:
 * [ORDER] [ACTION] key=value ...
 *
 * This eliminates scattered log.info/warn/error calls across services
 * and ensures uniform log output for monitoring and debugging.
 */
@Component
@Slf4j
public class OrderLogService {

    private static final String PREFIX = "[ORDER]";

    // ==================== Order Lifecycle ====================

    public void logOrderCreated(String orderNumber, Long userId, String email) {
        log.info("{} [CREATED] orderNumber={} userId={} email={}", PREFIX, orderNumber, userId, email);
    }

    public void logOrderCancelled(String orderNumber, boolean partial, String buyerEmail) {
        log.info("{} [CANCELLED] orderNumber={} partial={} buyer={}", PREFIX, orderNumber, partial, buyerEmail);
    }

    public void logOrderRefunded(String orderNumber, BigDecimal amount, boolean partial, String buyerEmail) {
        log.info("{} [REFUNDED] orderNumber={} amount={} partial={} buyer={}", PREFIX, orderNumber, amount, partial, buyerEmail);
    }

    public void logOrderCompleted(String orderNumber, boolean isAutomatic) {
        log.info("{} [COMPLETED] orderNumber={} automatic={}", PREFIX, orderNumber, isAutomatic);
    }

    // ==================== Status Changes ====================

    public void logStatusChanged(String orderNumber, String oldStatus, String newStatus) {
        log.info("{} [STATUS_CHANGED] orderNumber={} from={} to={}", PREFIX, orderNumber, oldStatus, newStatus);
    }

    // ==================== Escrow Operations ====================

    public void logEscrowCreated(Long orderItemId, BigDecimal amount, String sellerEmail) {
        log.info("{} [ESCROW_CREATED] orderItemId={} amount={} seller={}", PREFIX, orderItemId, amount, sellerEmail);
    }

    public void logEscrowReleased(int count, String orderNumber) {
        log.info("{} [ESCROW_RELEASED] count={} orderNumber={}", PREFIX, count, orderNumber);
    }

    public void logEscrowReleaseFailed(String orderNumber, String errorMsg) {
        log.error("{} [ESCROW_RELEASE_FAILED] orderNumber={} error={}", PREFIX, orderNumber, errorMsg);
    }

    public void logEscrowCancelFailed(String orderNumber, String errorMsg) {
        log.error("{} [ESCROW_CANCEL_FAILED] orderNumber={} error={}", PREFIX, orderNumber, errorMsg);
    }

    // ==================== Refund / Payment ====================

    public void logRefundProcessed(BigDecimal amount, String buyerEmail, String orderNumber) {
        log.info("{} [REFUND_PROCESSED] amount={} buyer={} orderNumber={}", PREFIX, amount, buyerEmail, orderNumber);
    }

    public void logRefundFailed(String orderNumber, String errorMsg) {
        log.error("{} [REFUND_FAILED] orderNumber={} error={}", PREFIX, orderNumber, errorMsg);
    }

    // ==================== Stock ====================

    public void logStockRestored(UUID listingId, int delta) {
        log.debug("{} [STOCK_RESTORED] listingId={} quantity={}", PREFIX, listingId, delta);
    }

    // ==================== Modifications ====================

    public void logOrderModified(String orderNumber, String field) {
        log.info("{} [MODIFIED] orderNumber={} field={}", PREFIX, orderNumber, field);
    }

    // ==================== API Requests ====================

    public void logApiRequest(String action, String userEmail) {
        log.debug("{} [API] action={} user={}", PREFIX, action, userEmail);
    }

    public void logApiMutation(String action, Long orderId, String userEmail) {
        log.info("{} [API] action={} orderId={} user={}", PREFIX, action, orderId, userEmail);
    }

    // ==================== Notifications ====================

    public void logNotificationSent(String type, String orderNumber) {
        log.info("{} [NOTIFICATION_SENT] type={} orderNumber={}", PREFIX, type, orderNumber);
    }

    public void logNotificationFailed(String type, String orderNumber, String errorMsg) {
        log.warn("{} [NOTIFICATION_FAILED] type={} orderNumber={} error={}", PREFIX, type, orderNumber, errorMsg);
    }

    // ==================== Scheduler ====================

    public void logSchedulerStarted() {
        log.info("{} [SCHEDULER] status=STARTED", PREFIX);
    }

    public void logSchedulerCompleted(int updatedCount) {
        if (updatedCount > 0) {
            log.info("{} [SCHEDULER] status=COMPLETED updatedCount={}", PREFIX, updatedCount);
        } else {
            log.debug("{} [SCHEDULER] status=COMPLETED updatedCount=0", PREFIX);
        }
    }

    // ==================== Data Warnings ====================

    public void logDataWarning(String message, Object... args) {
        log.warn("{} [DATA_WARNING] " + message, prependPrefix(args));
    }

    // ==================== Status Inconsistency ====================

    public void logStatusInconsistency(String orderStatus, String shippingStatus) {
        log.warn("{} [STATUS_INCONSISTENCY] orderStatus={} shippingStatus={}", PREFIX, orderStatus, shippingStatus);
    }

    private Object[] prependPrefix(Object[] args) {
        Object[] prefixed = new Object[args.length + 1];
        prefixed[0] = PREFIX;
        System.arraycopy(args, 0, prefixed, 1, args.length);
        return prefixed;
    }
}

