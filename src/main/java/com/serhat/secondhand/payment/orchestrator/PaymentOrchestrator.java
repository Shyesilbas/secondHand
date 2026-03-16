package com.serhat.secondhand.payment.orchestrator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.util.List;

/**
 * Orchestrates payment operations between buyers, sellers, escrows, and wallets.
 * Breaks circular dependencies by centralizing money movement coordination.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentOrchestrator {

    private final EscrowCreateExecutor escrowCreateExecutor;
    private final EscrowReleaseExecutor escrowReleaseExecutor;
    private final EscrowCancelAndBuyerRefundExecutor escrowCancelAndBuyerRefundExecutor;
    private final EscrowRefundExecutor escrowRefundExecutor;

    /**
     * Creates escrows for order items.
     * Note: Buyer payment debit happens during checkout, not here.
     */
    public Result<Void> createEscrowsForOrder(Order order) {
        return withRollbackOnError(escrowCreateExecutor.execute(order));
    }

    /**
     * Releases pending escrows to sellers and credits their wallets.
     * Used when order is completed/delivered.
     */
    public Result<Void> releaseEscrowsToSellers(List<OrderItemEscrow> escrows) {
        return withRollbackOnError(escrowReleaseExecutor.execute(escrows));
    }

    /**
     * Cancels escrows and refunds buyer.
     * Used when order is cancelled before delivery.
     */
    public Result<Void> cancelEscrowsAndRefundBuyer(List<OrderItemEscrow> escrows, User buyer) {
        return withRollbackOnError(escrowCancelAndBuyerRefundExecutor.execute(escrows, buyer));
    }

    /**
     * Refunds buyer from completed escrows and debits sellers.
     * Used when order is refunded after delivery.
     */
    public Result<Void> refundFromSellersAndEscrows(
            List<OrderItemEscrow> escrows, 
            User buyer) {
        return withRollbackOnError(escrowRefundExecutor.execute(escrows, buyer));
    }

    private Result<Void> withRollbackOnError(Result<Void> result) {
        if (result.isError()) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        }
        return result;
    }
}
