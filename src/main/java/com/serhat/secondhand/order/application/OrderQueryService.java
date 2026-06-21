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
    private final OrderQueryService self;

    public OrderQueryService(OrderRepository orderRepository,
                             OrderMapper orderMapper,
                             EscrowService escrowService,
                             IUserService userService,
                             OrderValidationService orderValidationService,
                             OrderItemCancelRepository orderItemCancelRepository,
                             OrderItemRefundRepository orderItemRefundRepository,
                             @Lazy OrderQueryService self) {
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.escrowService = escrowService;
        this.userService = userService;
        this.orderValidationService = orderValidationService;
        this.orderItemCancelRepository = orderItemCancelRepository;
        this.orderItemRefundRepository = orderItemRefundRepository;
        this.self = self;
    }

    public Result<Page<OrderDto>> getUserOrders(Long userId, Pageable pageable) {
        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findByUserId(userId, finalPageable);
        
        List<Order> orderList = orders.getContent();
        if (orderList.isEmpty()) {
            return Result.success(orders.map(order -> orderMapper.toDto(order, Map.of(), Map.of())));
        }

        MetadataContext metadata = fetchBulkMetadata(orderList);

        return Result.success(orders.map(order -> orderMapper.toDto(order, 
                metadata.cancelled(), metadata.refunded(),
                metadata.cancelReasons(), metadata.cancelReasonTexts(),
                metadata.refundReasons(), metadata.refundReasonTexts())));
    }

    public Result<OrderDto> getOrderById(Long orderId, Long userId) {
        Result<Order> orderResult = orderValidationService.validateOwnership(orderId, userId);
        if (orderResult.isError()) return orderResult.propagateError();
        Order order = orderResult.getData();

        // Tamamlanmış siparişler cache'den döner (statüsü artık değişmez)
        if (TERMINAL_STATUSES.contains(order.getStatus())) {
            return Result.success(self.getCachedCompletedOrder(orderId, order));
        }

        MetadataContext metadata = fetchMetadata(order);

        return Result.success(orderMapper.toDto(order, 
                metadata.cancelled(), metadata.refunded(),
                metadata.cancelReasons(), metadata.cancelReasonTexts(),
                metadata.refundReasons(), metadata.refundReasonTexts()));
    }

    /**
     * Statüsü artık değişmeyecek siparişleri cache'ler.
     * COMPLETED, CANCELLED, REFUNDED → 2 saat TTL
     */
    @Cacheable(value = "completedOrder", key = "#orderId")
    public OrderDto getCachedCompletedOrder(Long orderId, Order order) {
        log.info("[CACHE MISS] completedOrder::{}", orderId);
        MetadataContext metadata = fetchMetadata(order);
        return orderMapper.toDto(order, 
                metadata.cancelled(), metadata.refunded(),
                metadata.cancelReasons(), metadata.cancelReasonTexts(),
                metadata.refundReasons(), metadata.refundReasonTexts());
    }

    private static final Set<OrderStatus> TERMINAL_STATUSES = EnumSet.of(
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
            OrderStatus.REFUNDED
    );

    public Result<OrderDto> getSellerOrderById(Long orderId, Long sellerId) {
        return orderRepository.findByIdForSeller(orderId, sellerId)
                .map(order -> {
                    MetadataContext metadata = fetchMetadata(order);
                    return buildSellerOrderDto(order, sellerId, metadata);
                })
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
            OrderDto orderDto = buildSellerOrderDto(order, sellerId, metadata);
            orderDto.setEscrowAmount(escrowAmounts.getOrDefault(order.getId(), BigDecimal.ZERO));
            return orderDto;
        }));
    }

    private record MetadataContext(
            Map<Long, Integer> cancelled, 
            Map<Long, Integer> refunded,
            Map<Long, String> cancelReasons,
            Map<Long, String> cancelReasonTexts,
            Map<Long, String> refundReasons,
            Map<Long, String> refundReasonTexts) {}

    private MetadataContext fetchMetadata(Order order) {
        return fetchBulkMetadata(List.of(order));
    }

    private MetadataContext fetchBulkMetadata(List<Order> orders) {
        Set<Long> itemIds = orders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .map(OrderItem::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (itemIds.isEmpty()) {
            return new MetadataContext(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of());
        }

        var cancels = orderItemCancelRepository.findAllByOrderItemIdIn(itemIds);
        var refunds = orderItemRefundRepository.findAllByOrderItemIdIn(itemIds);

        Map<Long, Integer> cancelled = cancels.stream()
                .collect(Collectors.groupingBy(c -> c.getOrderItem().getId(), 
                        Collectors.summingInt(com.serhat.secondhand.order.entity.OrderItemCancel::getCancelledQuantity)));

        Map<Long, Integer> refunded = refunds.stream()
                .collect(Collectors.groupingBy(r -> r.getOrderItem().getId(), 
                        Collectors.summingInt(com.serhat.secondhand.order.entity.OrderItemRefund::getRefundedQuantity)));

        // Get latest reasons
        Map<Long, String> cancelReasons = cancels.stream()
                .collect(Collectors.toMap(c -> c.getOrderItem().getId(), c -> c.getReason().name(), (a, b) -> b));

        Map<Long, String> cancelReasonTexts = cancels.stream()
                .filter(c -> c.getReasonText() != null)
                .collect(Collectors.toMap(c -> c.getOrderItem().getId(), com.serhat.secondhand.order.entity.OrderItemCancel::getReasonText, (a, b) -> b));

        Map<Long, String> refundReasons = refunds.stream()
                .collect(Collectors.toMap(r -> r.getOrderItem().getId(), r -> r.getReason().name(), (a, b) -> b));

        Map<Long, String> refundReasonTexts = refunds.stream()
                .filter(r -> r.getReasonText() != null)
                .collect(Collectors.toMap(r -> r.getOrderItem().getId(), com.serhat.secondhand.order.entity.OrderItemRefund::getReasonText, (a, b) -> b));

        return new MetadataContext(cancelled, refunded, cancelReasons, cancelReasonTexts, refundReasons, refundReasonTexts);
    }

    private OrderDto buildSellerOrderDto(Order order, Long sellerId, MetadataContext metadata) {
        OrderDto orderDto = orderMapper.toDto(order, 
                metadata.cancelled(), metadata.refunded(),
                metadata.cancelReasons(), metadata.cancelReasonTexts(),
                metadata.refundReasons(), metadata.refundReasonTexts());
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