package com.serhat.secondhand.review.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.DeliveryMethod;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.review.util.ReviewErrorCodes;
import com.serhat.secondhand.shipping.entity.Shipping;
import com.serhat.secondhand.shipping.entity.enums.ShippingStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReviewValidatorTest {

    private ReviewValidator reviewValidator;
    private User reviewer;
    private User otherUser;
    private Order order;
    private OrderItem orderItem;
    private Shipping shipping;

    @BeforeEach
    void setUp() {
        reviewValidator = new ReviewValidator();
        reviewer = mock(User.class);
        otherUser = mock(User.class);
        order = mock(Order.class);
        orderItem = mock(OrderItem.class);
        shipping = mock(Shipping.class);

        when(reviewer.getId()).thenReturn(1L);
        when(otherUser.getId()).thenReturn(2L);
        when(orderItem.getOrder()).thenReturn(order);
    }

    @Test
    void validateForCreate_ShouldReturnError_WhenOrderItemDoesNotBelongToUser() {
        when(order.getUser()).thenReturn(otherUser);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isError());
        assertEquals(ReviewErrorCodes.ORDER_ITEM_NOT_BELONG_TO_USER.getCode(), result.getErrorCode());
    }

    @Test
    void validateForCreate_ShouldReturnSuccess_WhenCargoDeliveryAndShippingDelivered() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.CARGO);
        when(order.getShipping()).thenReturn(shipping);
        when(shipping.getStatus()).thenReturn(ShippingStatus.DELIVERED);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isSuccess());
    }

    @Test
    void validateForCreate_ShouldReturnSuccess_WhenCargoDeliveryAndOrderCompleted() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.CARGO);
        when(order.getShipping()).thenReturn(shipping);
        when(shipping.getStatus()).thenReturn(ShippingStatus.IN_TRANSIT); // Not delivered, but order is completed
        when(order.getStatus()).thenReturn(OrderStatus.COMPLETED);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isSuccess());
    }

    @Test
    void validateForCreate_ShouldReturnError_WhenCargoDeliveryAndShippingNotDelivered() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.CARGO);
        when(order.getShipping()).thenReturn(shipping);
        when(shipping.getStatus()).thenReturn(ShippingStatus.IN_TRANSIT);
        when(order.getStatus()).thenReturn(OrderStatus.SHIPPED);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isError());
        assertEquals(ReviewErrorCodes.ORDER_NOT_DELIVERED.getCode(), result.getErrorCode());
    }

    @Test
    void validateForCreate_ShouldReturnSuccess_WhenSafeMeetupAndOrderStatusHandoverConfirmed() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.SAFE_MEETUP);
        when(order.getStatus()).thenReturn(OrderStatus.HANDOVER_CONFIRMED);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isSuccess());
    }

    @Test
    void validateForCreate_ShouldReturnSuccess_WhenSafeMeetupAndOrderStatusCompleted() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.SAFE_MEETUP);
        when(order.getStatus()).thenReturn(OrderStatus.COMPLETED);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isSuccess());
    }

    @Test
    void validateForCreate_ShouldReturnError_WhenSafeMeetupAndOrderStatusMeetupPending() {
        when(order.getUser()).thenReturn(reviewer);
        when(order.getDeliveryMethod()).thenReturn(DeliveryMethod.SAFE_MEETUP);
        when(order.getStatus()).thenReturn(OrderStatus.MEETUP_PENDING);

        Result<Void> result = reviewValidator.validateForCreate(reviewer, orderItem);

        assertTrue(result.isError());
        assertEquals(ReviewErrorCodes.ORDER_NOT_DELIVERED.getCode(), result.getErrorCode());
    }
}
