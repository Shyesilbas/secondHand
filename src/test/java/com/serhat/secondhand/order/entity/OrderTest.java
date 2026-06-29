package com.serhat.secondhand.order.entity;

import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.Carrier;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OrderTest {

    private Order order;
    private Shipping shipping;

    @BeforeEach
    void setUp() {
        order = new Order();
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        shipping = Shipping.builder()
                .order(order)
                .status(ShippingStatus.PENDING)
                .build();
        order.setShipping(shipping);
    }

    @Test
    void confirm_ShouldTransitionToConfirmed_WhenStatusIsPending() {
        order.confirm();
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void confirm_ShouldThrowIllegalStateException_WhenStatusIsNotPending() {
        order.setStatus(OrderStatus.CONFIRMED);
        assertThrows(IllegalStateException.class, () -> order.confirm());
    }

    @Test
    void cancel_ShouldTransitionToCancelled_WhenStatusIsCancellable() {
        order.setStatus(OrderStatus.CONFIRMED);
        order.cancel();
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void cancel_ShouldThrowIllegalStateException_WhenStatusIsNotCancellable() {
        order.setStatus(OrderStatus.SHIPPED);
        assertThrows(IllegalStateException.class, () -> order.cancel());
    }

    @Test
    void markAsPaid_ShouldUpdatePaymentStatusAndSetConfirmed_WhenStatusIsPending() {
        String ref = "pay_ref_123";
        order.markAsPaid(ref);

        assertEquals(PaymentStatus.COMPLETED, order.getPaymentStatus());
        assertEquals(ref, order.getPaymentReference());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void markAsProcessing_ShouldTransitionToProcessing_WhenStatusIsConfirmed() {
        order.setStatus(OrderStatus.CONFIRMED);
        order.markAsProcessing();
        assertEquals(OrderStatus.PROCESSING, order.getStatus());
    }

    @Test
    void markAsProcessing_ShouldThrowIllegalStateException_WhenStatusIsNotConfirmed() {
        order.setStatus(OrderStatus.PENDING);
        assertThrows(IllegalStateException.class, () -> order.markAsProcessing());
    }

    @Test
    void markAsShipped_ShouldTransitionToShippedAndShipShipping_WhenStatusIsProcessing() {
        order.setStatus(OrderStatus.PROCESSING);
        order.markAsShipped(Carrier.OTHER, "track123");

        assertEquals(OrderStatus.SHIPPED, order.getStatus());
        assertEquals(ShippingStatus.IN_TRANSIT, shipping.getStatus());
        assertEquals(Carrier.OTHER, shipping.getCarrier());
        assertEquals("track123", shipping.getTrackingNumber());
    }

    @Test
    void markAsShipped_ShouldThrowIllegalStateException_WhenStatusIsNotProcessing() {
        order.setStatus(OrderStatus.CONFIRMED);
        assertThrows(IllegalStateException.class, () -> order.markAsShipped(Carrier.OTHER, "track123"));
    }

    @Test
    void markAsDelivered_ShouldTransitionToDeliveredAndDeliverShipping_WhenStatusIsShipped() {
        order.setStatus(OrderStatus.SHIPPED);
        order.markAsDelivered();

        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        assertEquals(ShippingStatus.DELIVERED, shipping.getStatus());
        assertNotNull(shipping.getDeliveredAt());
    }

    @Test
    void markAsDelivered_ShouldThrowIllegalStateException_WhenStatusIsNotShipped() {
        order.setStatus(OrderStatus.PROCESSING);
        assertThrows(IllegalStateException.class, () -> order.markAsDelivered());
    }

    @Test
    void applyCompletion_ShouldSetCompletedAndDelivered() {
        order.setStatus(OrderStatus.DELIVERED);
        order.applyCompletion();

        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        assertEquals(ShippingStatus.DELIVERED, shipping.getStatus());
    }

    @Test
    void generateVerificationCode_ShouldGenerateValidOtpAndHash() {
        order.generateVerificationCode();

        assertNotNull(order.getMeetupVerificationCode());
        assertEquals(6, order.getMeetupVerificationCode().length());
        assertNotNull(order.getMeetupVerificationCodeHash());
        assertEquals(0, order.getVerificationAttempts());
        assertNull(order.getVerificationLockedUntil());
        assertNotNull(order.getMeetupVerificationCodeGeneratedAt());
    }
}
