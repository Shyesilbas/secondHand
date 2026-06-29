package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.application.event.OrderCompletedEvent;
import com.serhat.secondhand.order.application.event.OrderStatusChangedEvent;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.policy.OrderCompletionPolicy;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.order.validator.OrderStatusConsistencyLogger;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderCompletionServiceTest {

    private OrderCompletionService orderCompletionService;

    private OrderRepository orderRepository;
    private OrderMapper orderMapper;
    private OrderStatusConsistencyLogger orderStatusConsistencyLogger;
    private EscrowService escrowService;
    private OrderValidationService orderValidationService;
    private OrderLogService orderLogService;
    private OrderCompletionPolicy orderCompletionPolicy;
    private ApplicationEventPublisher eventPublisher;

    private User buyer;
    private User seller;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        orderMapper = mock(OrderMapper.class);
        orderStatusConsistencyLogger = mock(OrderStatusConsistencyLogger.class);
        escrowService = mock(EscrowService.class);
        orderValidationService = mock(OrderValidationService.class);
        orderLogService = mock(OrderLogService.class);
        orderCompletionPolicy = mock(OrderCompletionPolicy.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        orderCompletionService = new OrderCompletionService(
                orderRepository,
                orderMapper,
                orderStatusConsistencyLogger,
                escrowService,
                orderValidationService,
                orderLogService,
                orderCompletionPolicy,
                eventPublisher
        );

        buyer = new User();
        buyer.setId(1L);

        seller = new User();
        seller.setId(2L);

        order = new Order();
        order.setId(100L);
        order.setOrderNumber("ORD123");
        order.setUser(buyer);
        order.setStatus(OrderStatus.DELIVERED);

        orderItem = new OrderItem();
        orderItem.setId(200L);
        orderItem.setSeller(seller);
        orderItem.setOrder(order);
        order.setOrderItems(List.of(orderItem));
    }

    @Test
    void completeOrder_ShouldSucceed_WhenEscrowReleasedSuccessfully() {
        when(orderValidationService.validateOwnership(100L, buyer)).thenReturn(Result.success(order));
        when(orderCompletionPolicy.validateCompletable(order)).thenReturn(Result.success());
        when(escrowService.release(order)).thenReturn(Result.success());
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto mockDto = new OrderDto();
        when(orderMapper.toDto(any(Order.class))).thenReturn(mockDto);

        Result<OrderDto> result = orderCompletionService.completeOrder(100L, buyer);

        assertTrue(result.isSuccess());
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(eventPublisher).publishEvent(any(OrderCompletedEvent.class));
        verify(orderLogService).logOrderCompleted(order.getOrderNumber(), false);
    }

    @Test
    void completeOrder_ShouldFail_WhenEscrowReleaseFails() {
        when(orderValidationService.validateOwnership(100L, buyer)).thenReturn(Result.success(order));
        when(orderCompletionPolicy.validateCompletable(order)).thenReturn(Result.success());
        when(escrowService.release(order)).thenReturn(Result.error("escrow_fail", "Escrow failed"));

        Result<OrderDto> result = orderCompletionService.completeOrder(100L, buyer);

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.ORDER_COMPLETION_ESCROW_RELEASE_FAILED.getCode(), result.getErrorCode());
        assertNotEquals(OrderStatus.COMPLETED, order.getStatus());
    }

    @Test
    void verifyMeetupCode_ShouldConfirmHandover_WhenPinCodeIsCorrect() {
        order.setStatus(OrderStatus.MEETUP_PENDING);
        order.generateVerificationCode();
        String correctCode = order.getMeetupVerificationCode();

        when(orderRepository.findByOrderNumberWithItemsAndSellers("ORD123")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Result<Void> result = orderCompletionService.verifyMeetupCode("ORD123", correctCode, seller);

        assertTrue(result.isSuccess());
        assertEquals(OrderStatus.HANDOVER_CONFIRMED, order.getStatus());
        assertNotNull(order.getMeetupVerifiedAt());
        verify(eventPublisher).publishEvent(any(OrderStatusChangedEvent.class));
    }

    @Test
    void verifyMeetupCode_ShouldIncrementAttempts_WhenPinCodeIsIncorrect() {
        order.setStatus(OrderStatus.MEETUP_PENDING);
        order.generateVerificationCode();

        when(orderRepository.findByOrderNumberWithItemsAndSellers("ORD123")).thenReturn(Optional.of(order));

        Result<Void> result = orderCompletionService.verifyMeetupCode("ORD123", "wrong_code", seller);

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.MEETUP_VERIFICATION_FAILED.getCode(), result.getErrorCode());
        assertEquals(1, order.getVerificationAttempts());
    }

    @Test
    void verifyMeetupCode_ShouldLockoutVerification_OnThirdFailure() {
        order.setStatus(OrderStatus.MEETUP_PENDING);
        order.generateVerificationCode();
        order.setVerificationAttempts(2); // Next failure is 3rd

        when(orderRepository.findByOrderNumberWithItemsAndSellers("ORD123")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Result<Void> result = orderCompletionService.verifyMeetupCode("ORD123", "wrong_code", seller);

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.VERIFICATION_LOCKED.getCode(), result.getErrorCode());
        assertEquals(OrderStatus.VERIFICATION_LOCKED, order.getStatus());
        assertNotNull(order.getVerificationLockedUntil());
        verify(eventPublisher).publishEvent(any(OrderStatusChangedEvent.class));
    }

    @Test
    void verifyMeetupCode_ShouldFail_WhenCodeExpired() {
        order.setStatus(OrderStatus.MEETUP_PENDING);
        order.generateVerificationCode();
        // Artificially age generation by 6 minutes
        order.setMeetupVerificationCodeGeneratedAt(LocalDateTime.now().minusMinutes(6));

        when(orderRepository.findByOrderNumberWithItemsAndSellers("ORD123")).thenReturn(Optional.of(order));

        Result<Void> result = orderCompletionService.verifyMeetupCode("ORD123", order.getMeetupVerificationCode(), seller);

        assertTrue(result.isError());
        assertEquals(OrderErrorCodes.MEETUP_CODE_EXPIRED.getCode(), result.getErrorCode());
    }

    @Test
    void confirmHandoverCompletion_ShouldFinalizeOrder_WhenConfirmedByBuyer() {
        order.setStatus(OrderStatus.HANDOVER_CONFIRMED);
        when(orderRepository.findByOrderNumberWithItemsAndSellers("ORD123")).thenReturn(Optional.of(order));
        when(escrowService.release(order)).thenReturn(Result.success());
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto mockDto = new OrderDto();
        when(orderMapper.toDto(any(Order.class))).thenReturn(mockDto);

        Result<OrderDto> result = orderCompletionService.confirmHandoverCompletion("ORD123", true, buyer);

        assertTrue(result.isSuccess());
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(eventPublisher).publishEvent(any(OrderCompletedEvent.class));
    }
}
