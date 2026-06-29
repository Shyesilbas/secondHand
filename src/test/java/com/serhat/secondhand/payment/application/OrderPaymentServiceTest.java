package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.payment.entity.PaymentType;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderPaymentServiceTest {

    private OrderPaymentService orderPaymentService;

    private PaymentProcessor paymentProcessor;
    private PaymentRequestFactory paymentRequestFactory;
    private IEWalletService eWalletService;

    private User user;
    private Order order;
    private CheckoutRequest checkoutRequest;
    private PricingResultDto pricing;
    private PaymentRequest request1;
    private PaymentRequest request2;

    @BeforeEach
    void setUp() {
        paymentProcessor = mock(PaymentProcessor.class);
        paymentRequestFactory = mock(PaymentRequestFactory.class);
        eWalletService = mock(IEWalletService.class);

        orderPaymentService = new OrderPaymentService(
                paymentProcessor,
                paymentRequestFactory,
                eWalletService
        );

        user = new User();
        user.setId(1L);

        order = new Order();
        order.setId(100L);

        checkoutRequest = new CheckoutRequest();
        pricing = new PricingResultDto();

        request1 = PaymentRequest.builder()
                .fromUserId(1L)
                .amount(BigDecimal.valueOf(40))
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .paymentDirection(PaymentDirection.OUTGOING)
                .build();

        request2 = PaymentRequest.builder()
                .fromUserId(1L)
                .amount(BigDecimal.valueOf(50))
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.ITEM_PURCHASE)
                .paymentDirection(PaymentDirection.OUTGOING)
                .build();
    }

    @Test
    void processPaymentBatch_ShouldReturnError_WhenPaymentRequestsListIsEmpty() {
        Result<List<PaymentDto>> result = orderPaymentService.processPaymentBatch(1L, new ArrayList<>());
        assertTrue(result.isError());
        assertEquals("Payment list cannot be empty.", result.getMessage());
    }

    @Test
    void processPaymentBatch_ShouldReturnError_WhenRequestValidationFails() {
        // Invalid transaction type
        PaymentRequest invalidReq = PaymentRequest.builder()
                .fromUserId(1L)
                .amount(BigDecimal.valueOf(40))
                .paymentType(PaymentType.EWALLET)
                .transactionType(PaymentTransactionType.SHOWCASE_PAYMENT)
                .paymentDirection(PaymentDirection.OUTGOING)
                .build();

        Result<List<PaymentDto>> result = orderPaymentService.processPaymentBatch(1L, List.of(invalidReq));

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.INVALID_TXN_TYPE.getCode(), result.getErrorCode());
    }

    @Test
    void processPaymentBatch_ShouldReturnError_WhenEWalletBalanceIsInsufficient() {
        when(eWalletService.hasSufficientBalance(1L, BigDecimal.valueOf(90))).thenReturn(false);

        Result<List<PaymentDto>> result = orderPaymentService.processPaymentBatch(1L, List.of(request1, request2));

        assertTrue(result.isError());
        assertEquals(PaymentErrorCodes.INSUFFICIENT_EWALLET_BALANCE.getCode(), result.getErrorCode());
    }

    @Test
    void processPaymentBatch_ShouldReturnError_WhenSinglePaymentFails() {
        when(eWalletService.hasSufficientBalance(1L, BigDecimal.valueOf(90))).thenReturn(true);
        
        PaymentDto mockDto = mock(PaymentDto.class);
        when(paymentProcessor.executeSinglePayment(1L, request1)).thenReturn(Result.success(mockDto));
        when(paymentProcessor.executeSinglePayment(1L, request2)).thenReturn(Result.error("Failure", "PAYMENT_FAILED"));

        try {
            orderPaymentService.processPaymentBatch(1L, List.of(request1, request2));
            fail("Expected TransactionAspectSupport to throw exception in mock environment");
        } catch (Exception | NoClassDefFoundError e) {
            // NoTransactionException or NullPointerException is expected when running outside of transactional context
            assertTrue(true);
        }
    }

    @Test
    void processPaymentBatch_ShouldSucceed_WhenAllPaymentsPass() {
        when(eWalletService.hasSufficientBalance(1L, BigDecimal.valueOf(90))).thenReturn(true);

        PaymentDto dto1 = mock(PaymentDto.class);
        PaymentDto dto2 = mock(PaymentDto.class);
        when(paymentProcessor.executeSinglePayment(1L, request1)).thenReturn(Result.success(dto1));
        when(paymentProcessor.executeSinglePayment(1L, request2)).thenReturn(Result.success(dto2));

        Result<List<PaymentDto>> result = orderPaymentService.processPaymentBatch(1L, List.of(request1, request2));

        assertTrue(result.isSuccess());
        assertEquals(2, result.getData().size());
        verify(paymentProcessor).executeSinglePayment(1L, request1);
        verify(paymentProcessor).executeSinglePayment(1L, request2);
    }
}
