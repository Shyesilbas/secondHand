package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderItemCancelRepository;
import com.serhat.secondhand.order.repository.OrderItemRefundRepository;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderEscrowService orderEscrowService;
    private final IUserService userService;
    private final OrderValidationService orderValidationService;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;

    @Lazy
    @Autowired
    private OrderQueryService self;

    public Page<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findByUserId(userId, finalPageable);
        return orders.map(order -> orderMapper.toDto(order, buildCancelledMap(order), buildRefundedMap(order)));
    }

    public Result<OrderDto> getOrderById(Long orderId, Long userId) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, userId);
        if (orderResult.isError()) return orderResult.propagateError();
        Order order = orderResult.getData();

        // Tamamlanmış siparişler cache'den döner (statüsü artık değişmez)
        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            return Result.success(self.getCachedCompletedOrder(orderId, order));
        }

        return Result.success(orderMapper.toDto(order, buildCancelledMap(order), buildRefundedMap(order)));
    }

    /**
     * Statüsü artık değişmeyecek siparişleri cache'ler.
     * COMPLETED, CANCELLED, REFUNDED → 2 saat TTL
     */
    @Cacheable(value = "completedOrder", key = "#orderId")
    public OrderDto getCachedCompletedOrder(Long orderId, Order order) {
        log.info("[CACHE MISS] completedOrder::{}", orderId);
        return orderMapper.toDto(order, buildCancelledMap(order), buildRefundedMap(order));
    }

    private static final java.util.Set<Order.OrderStatus> TERMINAL_STATUSES = java.util.EnumSet.of(
            Order.OrderStatus.COMPLETED,
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.REFUNDED
    );

    public Result<OrderDto> getSellerOrderById(Long orderId, Long sellerId) {
        return orderRepository.findByIdForSeller(orderId, sellerId)
                .map(order -> buildSellerOrderDto(order, sellerId))
                .map(Result::success)
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER));
    }

    private OrderDto buildSellerOrderDto(Order order, Long sellerId) {
        OrderDto orderDto = orderMapper.toDto(order, buildCancelledMap(order), buildRefundedMap(order));
        if (orderDto.getOrderItems() != null) {
            List<OrderItemDto> sellerOrderItems = orderDto.getOrderItems().stream()
                    .filter(item -> item.getListing() != null &&
                            item.getListing().getSellerId() != null &&
                            item.getListing().getSellerId().equals(sellerId))
                    .toList();
            orderDto.setOrderItems(sellerOrderItems);
        }
        orderDto.setEscrowAmount(null);
        return orderDto;
    }

    public Page<OrderDto> getSellerOrders(Long sellerId, Pageable pageable) {
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) return Page.empty();
        User seller = userResult.getData();

        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findOrdersBySellerId(sellerId, finalPageable);

        return orders.map(order -> {
            OrderDto orderDto = buildSellerOrderDto(order, sellerId);
            BigDecimal escrowAmount = orderEscrowService.getPendingEscrowAmountByOrder(order, seller);
            orderDto.setEscrowAmount(escrowAmount);
            return orderDto;
        });
    }

    /** Builds a map of orderItemId → cancelledQuantity for all items in the order. */
    private Map<Long, Integer> buildCancelledMap(Order order) {
        if (order.getOrderItems() == null) return Map.of();
        return order.getOrderItems().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(
                        OrderItem::getId,
                        item -> {
                            Integer v = orderItemCancelRepository.sumCancelledQuantityByOrderItem(item);
                            return v != null ? v : 0;
                        }
                ));
    }

    /** Builds a map of orderItemId → refundedQuantity for all items in the order. */
    private Map<Long, Integer> buildRefundedMap(Order order) {
        if (order.getOrderItems() == null) return Map.of();
        return order.getOrderItems().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(
                        OrderItem::getId,
                        item -> {
                            Integer v = orderItemRefundRepository.sumRefundedQuantityByOrderItem(item);
                            return v != null ? v : 0;
                        }
                ));
    }

    @Cacheable(value = "pendingOrders", key = "#userId")
    public Map<String, Object> getPendingCompletionStatus(Long userId) {
        boolean hasPending = orderRepository.existsByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED);
        long count = hasPending ? orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED) : 0;

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("hasPendingOrders", hasPending);
        result.put("pendingCount", count);
        return result;
    }



    private Pageable ensureSort(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            return PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }
        return pageable;
    }
}