package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.enums.OrderStatus;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final EscrowService escrowService;
    private final IUserService userService;
    private final OrderValidationService orderValidationService;
    private final OrderItemCancelRepository orderItemCancelRepository;
    private final OrderItemRefundRepository orderItemRefundRepository;

    @Lazy
    @Autowired
    private OrderQueryService self;

    public Result<Page<OrderDto>> getUserOrders(Long userId, Pageable pageable) {
        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findByUserId(userId, finalPageable);
        
        List<Order> orderList = orders.getContent();
        if (orderList.isEmpty()) {
            return Result.success(orders.map(order -> orderMapper.toDto(order, Map.of(), Map.of())));
        }

        MetadataContext metadata = fetchBulkMetadata(orderList);

        return Result.success(orders.map(order -> orderMapper.toDto(order, metadata.cancelled(), metadata.refunded())));
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

    private static final Set<OrderStatus> TERMINAL_STATUSES = EnumSet.of(
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED
    );

    public Result<OrderDto> getSellerOrderById(Long orderId, Long sellerId) {
        return orderRepository.findByIdForSeller(orderId, sellerId)
                .map(order -> buildSellerOrderDto(order, sellerId, buildCancelledMap(order), buildRefundedMap(order)))
                .map(Result::success)
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER));
    }

    public Result<Page<OrderDto>> getSellerOrders(Long sellerId, Pageable pageable) {
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) return Result.error(userResult.getMessage(), userResult.getErrorCode());

        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findOrdersBySellerId(sellerId, finalPageable);
        
        List<Order> orderList = orders.getContent();
        if (orderList.isEmpty()) {
            return Result.success(orders.map(order -> orderMapper.toDto(order, Map.of(), Map.of())));
        }

        List<Long> orderIds = orderList.stream().map(Order::getId).toList();
        Map<Long, BigDecimal> escrowAmounts = escrowService.sumPendingAmountsByOrderIds(orderIds, sellerId);
        
        MetadataContext metadata = fetchBulkMetadata(orderList);

        return Result.success(orders.map(order -> {
            OrderDto orderDto = buildSellerOrderDto(order, sellerId, metadata.cancelled(), metadata.refunded());
            orderDto.setEscrowAmount(escrowAmounts.getOrDefault(order.getId(), BigDecimal.ZERO));
            return orderDto;
        }));
    }

    private record MetadataContext(Map<Long, Integer> cancelled, Map<Long, Integer> refunded) {}

    private MetadataContext fetchBulkMetadata(List<Order> orders) {
        Set<Long> itemIds = orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .map(OrderItem::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (itemIds.isEmpty()) {
            return new MetadataContext(Map.of(), Map.of());
        }

        Map<Long, Integer> cancelled = orderItemCancelRepository.findCancelledQuantitiesByOrderItemIds(itemIds).stream()
                .collect(Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));

        Map<Long, Integer> refunded = orderItemRefundRepository.findRefundedQuantitiesByOrderItemIds(itemIds).stream()
                .collect(Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));

        return new MetadataContext(cancelled, refunded);
    }

    private OrderDto buildSellerOrderDto(Order order, Long sellerId, Map<Long, Integer> cancelled, Map<Long, Integer> refunded) {
        OrderDto orderDto = orderMapper.toDto(order, cancelled, refunded);
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

    /** Builds a map of orderItemId → cancelledQuantity for all items in the order. */
    private Map<Long, Integer> buildCancelledMap(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return Map.of();
        
        List<Long> itemIds = order.getOrderItems().stream().map(OrderItem::getId).toList();
        return orderItemCancelRepository.findCancelledQuantitiesByOrderItemIds(new HashSet<>(itemIds)).stream()
                .collect(Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));
    }

    /** Builds a map of orderItemId → refundedQuantity for all items in the order. */
    private Map<Long, Integer> buildRefundedMap(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return Map.of();
        
        List<Long> itemIds = order.getOrderItems().stream().map(OrderItem::getId).toList();
        return orderItemRefundRepository.findRefundedQuantitiesByOrderItemIds(new HashSet<>(itemIds)).stream()
                .collect(Collectors.toMap(row -> (Long)row[0], row -> ((Long)row[1]).intValue()));
    }

    @Cacheable(value = "pendingOrders", key = "#userId")
    public Map<String, Object> getPendingCompletionStatus(Long userId) {
        long count = orderRepository.countByUserIdAndStatus(userId, OrderStatus.DELIVERED);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("hasPendingOrders", count > 0);
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