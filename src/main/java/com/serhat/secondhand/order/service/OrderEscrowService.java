package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Pure escrow state management service.
 * No wallet operations - those are handled by PaymentOrchestrator.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OrderEscrowService {

    private final OrderItemEscrowRepository orderItemEscrowRepository;
    private final OrderLogService orderLog;

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
        orderLog.logEscrowCreated(orderItem.getId(), amount, seller.getEmail());
        return Result.success(saved);
    }

    public List<OrderItemEscrow> findPendingEscrowsByOrder(Order order) {
        return orderItemEscrowRepository.findByOrderAndStatus(order, OrderItemEscrow.EscrowStatus.PENDING);
    }

    public Optional<OrderItemEscrow> findEscrowByOrderItem(OrderItem orderItem) {
        return orderItemEscrowRepository.findByOrderItem(orderItem);
    }


    @Transactional(readOnly = true)
    public BigDecimal getPendingEscrowAmount(User seller) {
        return orderItemEscrowRepository.findBySellerWithDetails(seller).stream()
                .filter(escrow -> escrow.getStatus() == OrderItemEscrow.EscrowStatus.PENDING)
                .map(OrderItemEscrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public BigDecimal getPendingEscrowAmountByOrder(Order order, User seller) {
        return orderItemEscrowRepository.findByOrderWithDetails(order).stream()
                .filter(escrow -> escrow.getStatus() == OrderItemEscrow.EscrowStatus.PENDING)
                .filter(escrow -> escrow.getSeller().getId().equals(seller.getId()))
                .map(OrderItemEscrow::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
