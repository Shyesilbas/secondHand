package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.notification.service.NotificationService;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Pure escrow state management service.
 * No wallet operations - those are handled by PaymentOrchestrator.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderEscrowService {

    private final OrderItemEscrowRepository orderItemEscrowRepository;
    private final NotificationService notificationService;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    public Result<OrderItemEscrow> createEscrowForOrderItem(OrderItem orderItem, User seller, BigDecimal amount) {
        if (orderItemEscrowRepository.findByOrderItem(orderItem).isPresent()) {
            return Result.error("Escrow already exists for this order item", "ESCROW_ALREADY_EXISTS");
        }

        OrderItemEscrow escrow = OrderItemEscrow.builder()
                .orderItem(orderItem)
                .order(orderItem.getOrder())
                .seller(seller)
                .amount(amount)
                .status(OrderItemEscrow.EscrowStatus.PENDING)
                .build();

        OrderItemEscrow saved = orderItemEscrowRepository.save(escrow);
        log.info("Created escrow for order item {} with amount {} for seller {}", 
                orderItem.getId(), amount, seller.getEmail());
        return Result.success(saved);
    }

    /**
     * Marks escrow as released (COMPLETED status).
     * Note: Actual wallet credit is done by PaymentOrchestrator.
     */
    public Result<Void> releaseEscrowToSeller(OrderItemEscrow escrow) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
            log.warn("Escrow {} already released", escrow.getId());
            return Result.success();
        }
        if (escrow.getStatus() != OrderItemEscrow.EscrowStatus.PENDING) {
            return Result.error("Escrow is not in PENDING status", "ESCROW_INVALID_STATUS");
        }

        escrow.setStatus(OrderItemEscrow.EscrowStatus.COMPLETED);
        orderItemEscrowRepository.save(escrow);
        
        log.info("Marked escrow {} as released (amount: {}, seller: {})", 
                escrow.getId(), escrow.getAmount(), escrow.getSeller().getEmail());
        
        UUID listingId = escrow.getOrderItem().getListing() != null ? escrow.getOrderItem().getListing().getId() : null;
        String listingTitle = escrow.getOrderItem().getListing() != null ? escrow.getOrderItem().getListing().getTitle() : null;
        
        Result<?> notificationResult = notificationService.createAndSend(
                notificationTemplateCatalog.listingSold(
                        escrow.getSeller().getId(),
                        listingId,
                        escrow.getOrder().getId(),
                        escrow.getOrder().getOrderNumber(),
                        listingTitle
                )
        );
        if (notificationResult.isError()) {
            log.error("Failed to create notification: {}", notificationResult.getMessage());
        }
        
        return Result.success();
    }

    /**
     * Marks escrow as refunded.
     * Note: Actual wallet operations are done by PaymentOrchestrator.
     */
    public Result<Void> refundEscrowToBuyer(OrderItemEscrow escrow, User buyer) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
            log.warn("Escrow {} already refunded", escrow.getId());
            return Result.success();
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
            return Result.error("Cannot refund a cancelled escrow", "ESCROW_CANNOT_REFUND_CANCELLED");
        }

        escrow.setStatus(OrderItemEscrow.EscrowStatus.REFUNDED);
        orderItemEscrowRepository.save(escrow);
        
        log.info("Marked escrow {} as refunded (amount: {}, buyer: {})", 
                escrow.getId(), escrow.getAmount(), buyer.getEmail());
        
        return Result.success();
    }

    /**
     * Marks escrow as cancelled.
     * Note: Actual wallet refund is done by PaymentOrchestrator.
     */
    public Result<Void> cancelEscrow(OrderItemEscrow escrow, User buyer) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
            log.warn("Escrow {} already cancelled", escrow.getId());
            return Result.success();
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
            return Result.error("Cannot cancel a completed escrow", "ESCROW_CANNOT_CANCEL_COMPLETED");
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
            return Result.error("Cannot cancel a refunded escrow", "ESCROW_CANNOT_CANCEL_REFUNDED");
        }

        escrow.setStatus(OrderItemEscrow.EscrowStatus.CANCELLED);
        orderItemEscrowRepository.save(escrow);
        
        log.info("Marked escrow {} as cancelled (amount: {}, buyer: {})", 
                escrow.getId(), escrow.getAmount(), buyer.getEmail());
        
        return Result.success();
    }

    public List<OrderItemEscrow> findPendingEscrowsByOrder(Order order) {
        return orderItemEscrowRepository.findByOrderAndStatus(order, OrderItemEscrow.EscrowStatus.PENDING);
    }

    public List<OrderItemEscrow> findEscrowsByOrder(Order order) {
        return orderItemEscrowRepository.findByOrder(order);
    }

    public Optional<OrderItemEscrow> findEscrowByOrderItem(OrderItem orderItem) {
        return orderItemEscrowRepository.findByOrderItem(orderItem);
    }

    /**
     * Deprecated: Use PaymentOrchestrator.createEscrowsForOrder() instead.
     * This method is kept for backward compatibility but delegates to PaymentOrchestrator.
     */
    @Deprecated
    public void createEscrowsForOrder(Order order) {
        log.warn("OrderEscrowService.createEscrowsForOrder() is deprecated. Use PaymentOrchestrator instead.");
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            log.warn("Order {} has no order items, skipping escrow creation", order.getOrderNumber());
            return;
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            if (orderItem.getListing() == null) {
                log.warn("Order item {} has no listing, skipping escrow creation", orderItem.getId());
                continue;
            }

            User seller = orderItem.getListing().getSeller();
            if (seller == null) {
                log.warn("Listing {} has no seller, skipping escrow creation for order item {}", 
                        orderItem.getListing().getId(), orderItem.getId());
                continue;
            }

            BigDecimal amount = orderItem.getTotalPrice();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Order item {} has invalid amount {}, skipping escrow creation", 
                        orderItem.getId(), amount);
                continue;
            }

            Result<OrderItemEscrow> escrowResult = createEscrowForOrderItem(orderItem, seller, amount);
            if (escrowResult.isError()) {
                if ("ESCROW_ALREADY_EXISTS".equals(escrowResult.getErrorCode())) {
                    log.debug("Escrow already exists for order item {}, skipping", orderItem.getId());
                } else {
                    log.error("Failed to create escrow for order item {}: {}", orderItem.getId(), escrowResult.getMessage());
                }
            }
        }

        log.info("Created escrows for order {} with {} order items", order.getOrderNumber(), order.getOrderItems().size());
    }

    /**
     * Deprecated: Use PaymentOrchestrator.releaseEscrowsToSellers() instead.
     */
    @Deprecated
    public void releaseEscrowsForOrder(Order order) {
        log.warn("OrderEscrowService.releaseEscrowsForOrder() is deprecated. Use PaymentOrchestrator instead.");
        List<OrderItemEscrow> pendingEscrows = findPendingEscrowsByOrder(order);
        
        for (OrderItemEscrow escrow : pendingEscrows) {
            try {
                releaseEscrowToSeller(escrow);
                log.info("Marked escrow {} as released for order item {}", 
                        escrow.getId(), escrow.getOrderItem().getId());
            } catch (Exception e) {
                log.error("Failed to release escrow {} for order {}: {}", 
                        escrow.getId(), order.getOrderNumber(), e.getMessage());
            }
        }
        
        if (!pendingEscrows.isEmpty()) {
            log.info("Marked {} escrow(s) as released for order {}", pendingEscrows.size(), order.getOrderNumber());
        }
    }

    public BigDecimal getPendingEscrowAmount(User seller) {
        List<OrderItemEscrow> pendingEscrows = orderItemEscrowRepository.findBySeller(seller).stream()
                .filter(escrow -> escrow.getStatus() == OrderItemEscrow.EscrowStatus.PENDING)
                .collect(Collectors.toList());
        
        return pendingEscrows.stream()
                .map(OrderItemEscrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getPendingEscrowAmountByOrder(Order order, User seller) {
        List<OrderItemEscrow> allEscrows = orderItemEscrowRepository.findByOrder(order);
        List<OrderItemEscrow> pendingEscrows = allEscrows.stream()
                .filter(escrow -> escrow.getStatus() == OrderItemEscrow.EscrowStatus.PENDING)
                .filter(escrow -> {
                    User escrowSeller = escrow.getSeller();
                    return escrowSeller != null && escrowSeller.getId().equals(seller.getId());
                })
                .collect(Collectors.toList());
        
        return pendingEscrows.stream()
                .map(OrderItemEscrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

