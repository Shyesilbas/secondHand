package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.ewallet.service.EWalletService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderEscrowService {

    private final OrderItemEscrowRepository orderItemEscrowRepository;
    private final EWalletService eWalletService;

    public OrderItemEscrow createEscrowForOrderItem(OrderItem orderItem, User seller, BigDecimal amount) {
        if (orderItemEscrowRepository.findByOrderItem(orderItem).isPresent()) {
            throw new BusinessException("Escrow already exists for this order item", 
                org.springframework.http.HttpStatus.BAD_REQUEST, "ESCROW_ALREADY_EXISTS");
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
        return saved;
    }

    public void releaseEscrowToSeller(OrderItemEscrow escrow) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
            log.warn("Escrow {} already released", escrow.getId());
            return;
        }
        if (escrow.getStatus() != OrderItemEscrow.EscrowStatus.PENDING) {
            throw new BusinessException("Escrow is not in PENDING status", 
                org.springframework.http.HttpStatus.BAD_REQUEST, "ESCROW_INVALID_STATUS");
        }

        try {
            UUID listingId = escrow.getOrderItem().getListing().getId();
            eWalletService.creditToUser(escrow.getSeller(), escrow.getAmount(), listingId, PaymentTransactionType.ITEM_SALE);
            
            escrow.setStatus(OrderItemEscrow.EscrowStatus.COMPLETED);
            orderItemEscrowRepository.save(escrow);
            
            log.info("Released escrow {} amount {} to seller {}", 
                    escrow.getId(), escrow.getAmount(), escrow.getSeller().getEmail());
        } catch (Exception e) {
            log.error("Failed to release escrow {} to seller {}: {}", 
                    escrow.getId(), escrow.getSeller().getEmail(), e.getMessage());
            throw new BusinessException("Failed to release escrow: " + e.getMessage(), 
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "ESCROW_RELEASE_FAILED");
        }
    }

    public void refundEscrowToBuyer(OrderItemEscrow escrow, User buyer) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
            log.warn("Escrow {} already refunded", escrow.getId());
            return;
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
            throw new BusinessException("Cannot refund a cancelled escrow", 
                org.springframework.http.HttpStatus.BAD_REQUEST, "ESCROW_CANNOT_REFUND_CANCELLED");
        }

        try {
            UUID listingId = escrow.getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, escrow.getAmount(), listingId, PaymentTransactionType.REFUND);
            
            escrow.setStatus(OrderItemEscrow.EscrowStatus.REFUNDED);
            orderItemEscrowRepository.save(escrow);
            
            log.info("Refunded escrow {} amount {} to buyer {}", 
                    escrow.getId(), escrow.getAmount(), buyer.getEmail());
        } catch (Exception e) {
            log.error("Failed to refund escrow {} to buyer {}: {}", 
                    escrow.getId(), buyer.getEmail(), e.getMessage());
            throw new BusinessException("Failed to refund escrow: " + e.getMessage(), 
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "ESCROW_REFUND_FAILED");
        }
    }

    public void cancelEscrow(OrderItemEscrow escrow, User buyer) {
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.CANCELLED) {
            log.warn("Escrow {} already cancelled", escrow.getId());
            return;
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed escrow", 
                org.springframework.http.HttpStatus.BAD_REQUEST, "ESCROW_CANNOT_CANCEL_COMPLETED");
        }
        if (escrow.getStatus() == OrderItemEscrow.EscrowStatus.REFUNDED) {
            throw new BusinessException("Cannot cancel a refunded escrow", 
                org.springframework.http.HttpStatus.BAD_REQUEST, "ESCROW_CANNOT_CANCEL_REFUNDED");
        }

        try {
            UUID listingId = escrow.getOrderItem().getListing().getId();
            eWalletService.creditToUser(buyer, escrow.getAmount(), listingId, PaymentTransactionType.REFUND);
            
            escrow.setStatus(OrderItemEscrow.EscrowStatus.CANCELLED);
            orderItemEscrowRepository.save(escrow);
            
            log.info("Cancelled escrow {} amount {} refunded to buyer {}", 
                    escrow.getId(), escrow.getAmount(), buyer.getEmail());
        } catch (Exception e) {
            log.error("Failed to cancel escrow {}: {}", escrow.getId(), e.getMessage());
            throw new BusinessException("Failed to cancel escrow: " + e.getMessage(), 
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "ESCROW_CANCEL_FAILED");
        }
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

    public void createEscrowsForOrder(Order order) {
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

            try {
                createEscrowForOrderItem(orderItem, seller, amount);
            } catch (BusinessException e) {
                if ("ESCROW_ALREADY_EXISTS".equals(e.getErrorCode())) {
                    log.debug("Escrow already exists for order item {}, skipping", orderItem.getId());
                } else {
                    log.error("Failed to create escrow for order item {}: {}", orderItem.getId(), e.getMessage());
                    throw e;
                }
            }
        }

        log.info("Created escrows for order {} with {} order items", order.getOrderNumber(), order.getOrderItems().size());
    }

    public void releaseEscrowsForOrder(Order order) {
        List<OrderItemEscrow> pendingEscrows = findPendingEscrowsByOrder(order);
        
        for (OrderItemEscrow escrow : pendingEscrows) {
            try {
                releaseEscrowToSeller(escrow);
                log.info("Released escrow {} for order item {} to seller {}", 
                        escrow.getId(), escrow.getOrderItem().getId(), escrow.getSeller().getEmail());
            } catch (Exception e) {
                log.error("Failed to release escrow {} for order {}: {}", 
                        escrow.getId(), order.getOrderNumber(), e.getMessage());
            }
        }
        
        if (!pendingEscrows.isEmpty()) {
            log.info("Released {} escrow(s) for order {}", pendingEscrows.size(), order.getOrderNumber());
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

