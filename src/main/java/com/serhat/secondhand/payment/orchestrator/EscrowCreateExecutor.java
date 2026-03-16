package com.serhat.secondhand.payment.orchestrator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.order.repository.OrderItemEscrowRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class EscrowCreateExecutor {

    private final OrderItemEscrowRepository orderItemEscrowRepository;

    public Result<Void> execute(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            log.warn("Order {} has no order items, skipping escrow creation", order.getOrderNumber());
            return Result.success();
        }

        for (OrderItem orderItem : order.getOrderItems()) {
            if (orderItem.getListing() == null) {
                log.warn("Order item {} has no listing, escrow creation aborted", orderItem.getId());
                return Result.error("Order item has no listing: " + orderItem.getId(), "ESCROW_CREATE_INVALID_ITEM");
            }

            User seller = orderItem.getListing().getSeller();
            if (seller == null) {
                log.warn("Listing {} has no seller, escrow creation aborted for order item {}",
                        orderItem.getListing().getId(), orderItem.getId());
                return Result.error("Listing has no seller: " + orderItem.getListing().getId(), "ESCROW_CREATE_INVALID_SELLER");
            }

            BigDecimal amount = orderItem.getTotalPrice();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                log.warn("Order item {} has invalid amount {}, escrow creation aborted",
                        orderItem.getId(), amount);
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
}
