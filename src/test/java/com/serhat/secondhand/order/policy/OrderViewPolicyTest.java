package com.serhat.secondhand.order.policy;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderAction;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.util.OrderBusinessConstants;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OrderViewPolicyTest {

    private static final long SELLER_ID = 10L;

    private final OrderViewPolicy policy = new OrderViewPolicy(new OrderCancellationPolicy(), new OrderRefundPolicy(),
            new OrderCompletionPolicy(), new OrderShippingPolicy());

    @Test
    void buyer_deliveredInsideRefundWindow_canRefundCompleteAndReview_withDeadlinesFromDeliveredAt() {
        LocalDateTime deliveredAt = LocalDateTime.now().minusHours(2);
        Order order = cargoOrder(OrderStatus.DELIVERED, ShippingStatus.DELIVERED, deliveredAt, SELLER_ID);

        OrderViewPolicy.View view = policy.buyerView(order);

        assertThat(view.allowedActions()).containsExactlyInAnyOrder(OrderAction.REFUND, OrderAction.COMPLETE, OrderAction.REVIEW);
        assertThat(view.refundDeadline()).isEqualTo(deliveredAt.plusHours(OrderBusinessConstants.REFUND_WINDOW_HOURS));
        assertThat(view.autoCompleteAt()).isEqualTo(deliveredAt.plusHours(OrderBusinessConstants.AUTO_COMPLETION_HOURS));
        assertThat(view.shipDeadline()).isNull();
    }

    @Test
    void buyer_deliveredAfterRefundWindow_cannotRefundButCanStillComplete() {
        LocalDateTime deliveredAt = LocalDateTime.now().minusHours(OrderBusinessConstants.REFUND_WINDOW_HOURS + 1L);
        Order order = cargoOrder(OrderStatus.DELIVERED, ShippingStatus.DELIVERED, deliveredAt, SELLER_ID);

        assertThat(policy.buyerView(order).allowedActions())
                .doesNotContain(OrderAction.REFUND)
                .contains(OrderAction.COMPLETE);
    }

    @Test
    void buyer_processingCargo_cannotCancelOrEdit_andSeesShipDeadline() {
        Order order = cargoOrder(OrderStatus.PROCESSING, ShippingStatus.PENDING, null, SELLER_ID);

        OrderViewPolicy.View view = policy.buyerView(order);

        assertThat(view.allowedActions()).isEmpty();
        assertThat(view.shipDeadline()).isEqualTo(order.getCreatedAt().plusHours(OrderBusinessConstants.SHIP_DEADLINE_HOURS));
    }

    @Test
    void buyer_confirmedCargo_canCancelAndEdit() {
        Order order = cargoOrder(OrderStatus.CONFIRMED, ShippingStatus.PENDING, null, SELLER_ID);

        assertThat(policy.buyerView(order).allowedActions()).containsExactlyInAnyOrder(OrderAction.CANCEL, OrderAction.EDIT);
    }

    @Test
    void seller_confirmedSingleSellerCargo_canShip() {
        Order order = cargoOrder(OrderStatus.CONFIRMED, ShippingStatus.PENDING, null, SELLER_ID);

        assertThat(policy.sellerView(order, SELLER_ID).allowedActions()).containsExactly(OrderAction.SHIP);
    }

    @Test
    void seller_mixedSellerCargo_cannotShip() {
        Order order = cargoOrder(OrderStatus.CONFIRMED, ShippingStatus.PENDING, null, SELLER_ID, 11L);

        assertThat(policy.sellerView(order, SELLER_ID).allowedActions()).doesNotContain(OrderAction.SHIP);
    }

    @Test
    void seller_shippedCargo_cannotShipAgain() {
        Order order = cargoOrder(OrderStatus.SHIPPED, ShippingStatus.IN_TRANSIT, null, SELLER_ID);

        assertThat(policy.sellerView(order, SELLER_ID).allowedActions()).isEmpty();
    }

    @Test
    void meetupPending_buyerShowsCodeAndMayConfirm_sellerOnlyVerifies() {
        LocalDateTime generatedAt = LocalDateTime.now().minusMinutes(1);
        Order order = meetupOrder(OrderStatus.MEETUP_PENDING);
        order.setMeetupVerificationCodeGeneratedAt(generatedAt);

        OrderViewPolicy.View buyer = policy.buyerView(order);
        OrderViewPolicy.View seller = policy.sellerView(order, SELLER_ID);

        assertThat(buyer.allowedActions()).containsExactlyInAnyOrder(
                OrderAction.CANCEL, OrderAction.SHOW_MEETUP_CODE, OrderAction.CONFIRM_HANDOVER);
        assertThat(buyer.meetupCodeExpiresAt()).isEqualTo(generatedAt.plusMinutes(OrderBusinessConstants.MEETUP_CODE_TTL_MINUTES));
        assertThat(seller.allowedActions()).containsExactly(OrderAction.VERIFY_MEETUP);
        assertThat(seller.meetupCodeExpiresAt()).isNull();
    }

    @Test
    void handoverConfirmed_bothSidesMayConfirm_andAutoCompleteFollowsMeetupWindow() {
        LocalDateTime verifiedAt = LocalDateTime.now().minusHours(1);
        Order order = meetupOrder(OrderStatus.HANDOVER_CONFIRMED);
        order.setMeetupVerifiedAt(verifiedAt);

        assertThat(policy.buyerView(order).allowedActions())
                .contains(OrderAction.COMPLETE, OrderAction.CONFIRM_HANDOVER, OrderAction.REVIEW);
        assertThat(policy.sellerView(order, SELLER_ID).allowedActions()).containsExactly(OrderAction.CONFIRM_HANDOVER);
        assertThat(policy.buyerView(order).autoCompleteAt())
                .isEqualTo(verifiedAt.plusHours(OrderBusinessConstants.MEETUP_AUTO_COMPLETION_HOURS));
    }

    private static Order cargoOrder(OrderStatus status, ShippingStatus shippingStatus, LocalDateTime deliveredAt, Long... sellerIds) {
        Shipping shipping = new Shipping();
        shipping.setStatus(shippingStatus);
        shipping.setDeliveredAt(deliveredAt);
        Order order = Order.builder()
                .id(1L)
                .status(status)
                .deliveryMethod(DeliveryMethod.CARGO)
                .shipping(shipping)
                .createdAt(LocalDateTime.now().minusHours(3))
                .orderItems(new ArrayList<>())
                .build();
        for (Long sellerId : sellerIds) {
            order.getOrderItems().add(OrderItem.builder().seller(User.builder().id(sellerId).build()).quantity(1).build());
        }
        return order;
    }

    private static Order meetupOrder(OrderStatus status) {
        return Order.builder()
                .id(2L)
                .status(status)
                .deliveryMethod(DeliveryMethod.SAFE_MEETUP)
                .createdAt(LocalDateTime.now().minusHours(3))
                .orderItems(new ArrayList<>(List.of(
                        OrderItem.builder().seller(User.builder().id(SELLER_ID).build()).quantity(1).build())))
                .build();
    }
}
