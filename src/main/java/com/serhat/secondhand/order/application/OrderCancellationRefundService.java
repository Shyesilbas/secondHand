package com.serhat.secondhand.order.application;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.payment.orchestrator.PaymentOrchestrator;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.core.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderCancellationRefundService {

    private static final String REFUND_FAILED_MESSAGE = "Failed to process refund. Please contact support.";
    private static final String REFUND_FAILED_CODE = "REFUND_FAILED";

    private final OrderEscrowService orderEscrowService;
    private final PaymentOrchestrator paymentOrchestrator;
    private final OrderLogService orderLog;

    public void processRefund(List<OrderItemCancel> cancelRecords, BigDecimal totalRefundAmount, Order order) {
        User buyer = order.getUser();

        List<OrderItemEscrow> escrowsToCancel = cancelRecords.stream()
                .map(OrderItemCancel::getOrderItem)
                .map(orderEscrowService::findEscrowByOrderItem)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        Result<Void> orchestratorResult = paymentOrchestrator.cancelEscrowsAndRefundBuyer(escrowsToCancel, buyer);
        if (orchestratorResult.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            orderLog.logEscrowCancelFailed(order.getOrderNumber(), orchestratorResult.getMessage());
            throw new RefundFailedException(orchestratorResult.getMessage());
        }

        orderLog.logRefundProcessed(totalRefundAmount, buyer.getEmail(), order.getOrderNumber());
    }

    static class RefundFailedException extends RuntimeException {
        private RefundFailedException(String details) {
            super(details);
        }
    }

    public static String getRefundFailedMessage() {
        return REFUND_FAILED_MESSAGE;
    }

    public static String getRefundFailedCode() {
        return REFUND_FAILED_CODE;
    }
}

