package com.serhat.secondhand.payment.orchestrator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.ewallet.service.IEWalletService;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Orchestrates payment operations between buyers, sellers, escrows, and wallets.
 * Breaks circular dependencies by centralizing money movement coordination.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentOrchestrator {

    private final IEWalletService eWalletService;
    private final OrderItemEscrowRepository orderItemEscrowRepository;

    /**
     * Creates escrows for order items.
     * Note: Buyer payment debit happens during checkout, not here.
     */
    public Result<Void> createEscrowsForOrder(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            log.warn("Order {} has no order items, skipping escrow creation", order.getOrderNumber());
            return Result.success();
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            if (orderItem.getListing() == null) {
                log.warn("Order item {} has no listing, escrow creation aborted", orderItem.getId());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Order item has no listing: " + orderItem.getId(), "ESCROW_CREATE_INVALID_ITEM");
            }

            User seller = orderItem.getListing().getSeller();
            if (seller == null) {
                log.warn("Listing {} has no seller, escrow creation aborted for order item {}", 
                        orderItem.getListing().getId(), orderItem.getId());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Listing has no seller: " + orderItem.getListing().getId(), "ESCROW_CREATE_INVALID_SELLER");
            }

            BigDecimal amount = orderItem.getTotalPrice();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Order item {} has invalid amount {}, escrow creation aborted", 
                        orderItem.getId(), amount);
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Order item has invalid amount: " + orderItem.getId(), "ESCROW_CREATE_INVALID_AMOUNT");
            }

            if (orderItemEscrowRepository.findByOrderItem(orderItem).isPresent()) {
                log.debug("Escrow already exists for order item {}, skipping", orderItem.getId());
                continue;
            }

            OrderItemEscrow escrow = OrderItemEscrow.builder()
                    .orderItem(orderItem)
                    .order(orderItem.getOrder())
                    .seller(seller)
                    .amount(amount)
                    .status(OrderItemEscrow.EscrowStatus.PENDING)
                    .build();

            orderItemEscrowRepository.save(escrow);
            log.info("Created escrow for order item {} with amount {} for seller {}", 
                    orderItem.getId(), amount, seller.getEmail());
        }

        log.info("Created escrows for order {} with {} order items", 
                order.getOrderNumber(), order.getOrderItems().size());
        return Result.success();
    }

    /**
     * Releases pending escrows to sellers and credits their wallets.
     * Used when order is completed/delivered.
     */
    public Result<Void> releaseEscrowsToSellers(List<OrderItemEscrow> escrows) {
        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        int successCount = 0;

        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                log.debug("Escrow {} already released, skipping", escrow.getId());
                successCount++;
                continue;
            }

            if (escrow.getStatus() != OrderItemEscrow.EscrowStatus.PENDING) {
                log.warn("Escrow {} is not in PENDING status ({}), skipping", 
                        escrow.getId(), escrow.getStatus());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Escrow is not releasable: " + escrow.getId(), "ESCROW_RELEASE_INVALID_STATUS");
            }

            try {
                UUID listingId = escrow.getOrderItem().getListing().getId();
                eWalletService.creditToUser(
                        escrow.getSeller(), 
                        escrow.getAmount(), 
                        listingId, 
                        PaymentTransactionType.ITEM_SALE
                );

                escrow.setStatus(OrderItemEscrow.EscrowStatus.COMPLETED);
                orderItemEscrowRepository.save(escrow);

                log.info("Released escrow {} amount {} to seller {}", 
                        escrow.getId(), escrow.getAmount(), escrow.getSeller().getEmail());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to release escrow {} to seller {}: {}", 
                        escrow.getId(), escrow.getSeller().getEmail(), e.getMessage(), e);
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Failed to release escrow " + escrow.getId(), "ESCROW_RELEASE_FAILED");
            }
        }

        log.info("Escrow release completed: {} successful", successCount);

        return Result.success();
    }

    /**
     * Cancels escrows and refunds buyer.
     * Used when order is cancelled before delivery.
     */
    public Result<Void> cancelEscrowsAndRefundBuyer(List<OrderItemEscrow> escrows, User buyer) {
        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        BigDecimal totalRefundAmount = BigDecimal.ZERO;

        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
                log.debug("Escrow {} already cancelled, skipping", escrow.getId());
                continue;
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                log.warn("Cannot cancel completed escrow {}", escrow.getId());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Escrow cannot be cancelled: " + escrow.getId(), "ESCROW_CANCEL_INVALID_STATUS");
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
                log.warn("Cannot cancel refunded escrow {}", escrow.getId());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Escrow cannot be cancelled: " + escrow.getId(), "ESCROW_CANCEL_INVALID_STATUS");
            }

            totalRefundAmount = totalRefundAmount.add(escrow.getAmount());

            escrow.setStatus(OrderItemEscrow.EscrowStatus.CANCELLED);
            orderItemEscrowRepository.save(escrow);

            log.info("Cancelled escrow {} amount {} for buyer {}", 
                    escrow.getId(), escrow.getAmount(), buyer.getEmail());
        }

        if (totalRefundAmount.compareTo(BigDecimal.ZERO) > 0) {
            UUID firstListingId = escrows.isEmpty() ? null : escrows.get(0).getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, totalRefundAmount, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded total {} to buyer {} from cancelled escrows", 
                    totalRefundAmount, buyer.getEmail());
        }

        return Result.success();
    }

    /**
     * Refunds buyer from completed escrows and debits sellers.
     * Used when order is refunded after delivery.
     */
    public Result<Void> refundFromSellersAndEscrows(
            List<OrderItemEscrow> escrows, 
            User buyer) {

        if (escrows == null || escrows.isEmpty()) {
            return Result.success();
        }

        BigDecimal totalRefundFromEscrow = BigDecimal.ZERO;
        BigDecimal totalRefundFromSeller = BigDecimal.ZERO;

        for (OrderItemEscrow escrow : escrows) {
            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
                log.debug("Escrow {} already refunded, skipping", escrow.getId());
                continue;
            }

            if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
                log.warn("Cannot refund cancelled escrow {}", escrow.getId());
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Escrow is not refundable: " + escrow.getId(), "ESCROW_REFUND_INVALID_STATUS");
            }

            try {
                if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
                    UUID listingId = escrow.getOrderItem().getListing().getId();
                    eWalletService.debitFromUser(
                            escrow.getSeller(), 
                            escrow.getAmount(), 
                            listingId, 
                            PaymentTransactionType.REFUND
                    );
                    totalRefundFromSeller = totalRefundFromSeller.add(escrow.getAmount());
                    log.info("Debited {} from seller's eWallet: {} for refunded order item {}", 
                            escrow.getAmount(), escrow.getSeller().getEmail(), escrow.getOrderItem().getId());
                } else {
                    totalRefundFromEscrow = totalRefundFromEscrow.add(escrow.getAmount());
                }

                escrow.setStatus(OrderItemEscrow.EscrowStatus.REFUNDED);
                orderItemEscrowRepository.save(escrow);

                log.info("Marked escrow {} as refunded for order item {}", 
                        escrow.getId(), escrow.getOrderItem().getId());

            } catch (Exception e) {
                log.error("Failed to process refund for escrow {}: {}", 
                        escrow.getId(), e.getMessage(), e);
                TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
                return Result.error("Failed to process refund for escrow " + escrow.getId(), "ESCROW_REFUND_FAILED");
            }
        }

        BigDecimal totalRefund = totalRefundFromEscrow.add(totalRefundFromSeller);
        if (totalRefund.compareTo(BigDecimal.ZERO) > 0) {
            UUID firstListingId = escrows.isEmpty() ? null : escrows.get(0).getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, totalRefund, firstListingId, PaymentTransactionType.REFUND);
            log.info("Refunded total {} to buyer {} (escrow: {}, seller: {})", 
                    totalRefund, buyer.getEmail(), totalRefundFromEscrow, totalRefundFromSeller);
        }

        return Result.success();
    }
}
