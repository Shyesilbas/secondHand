package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final UserService userService;

    public Page<OrderDto> getUserOrders(Long userId, Pageable pageable) {
        log.info("Getting orders for userId: {}", userId);

        Pageable finalPageable = ensureSort(pageable);

        Page<Order> orders = orderRepository.findByUserId(userId, finalPageable);

        return orders.map(orderMapper::toDto);
    }

    public Result<OrderDto> getOrderById(Long orderId, Long userId) {
        Result<Order> orderResult = findOrderByIdAndValidateOwnership(orderId, userId);
        if (orderResult.isError()) {
            return Result.error(orderResult.getErrorCode(), orderResult.getMessage());
        }
        return Result.success(orderMapper.toDto(orderResult.getData()));
    }


    public Page<OrderDto> getSellerOrders(Long sellerId, Pageable pageable) {
        log.info("Getting orders for sellerId: {}", sellerId);

        var userResult = userService.findById(sellerId);
        if (userResult.isError()) return Page.empty();
        User seller = userResult.getData();

        Pageable finalPageable = ensureSort(pageable);
        Page<Order> orders = orderRepository.findOrdersBySellerId(sellerId, finalPageable);

        return orders.map(order -> {
            OrderDto orderDto = orderMapper.toDto(order);
            if (orderDto.getOrderItems() != null) {
                List<OrderItemDto> sellerOrderItems = orderDto.getOrderItems().stream()
                        .filter(item -> item.getListing() != null &&
                                item.getListing().getSellerId() != null &&
                                item.getListing().getSellerId().equals(sellerId))
                        .collect(Collectors.toList());
                orderDto.setOrderItems(sellerOrderItems);
            }
            BigDecimal escrowAmount = orderEscrowService.getPendingEscrowAmountByOrder(order, seller);
            orderDto.setEscrowAmount(escrowAmount);
            return orderDto;
        });
    }

    public Map<String, Object> getPendingCompletionStatus(Long userId) {
        boolean hasPending = orderRepository.existsByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED);
        long count = hasPending ? orderRepository.countByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED) : 0;

        return Map.of(
                "hasPendingOrders", hasPending,
                "pendingCount", count
        );
    }


    private Result<Order> findOrderByIdAndValidateOwnership(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND.toString(), "Order Not Found.");
        }
        return validateOwnership(order, userId);
    }


    private Result<Order> validateOwnership(Order order, Long userId) {
        if (!order.getUser().getId().equals(userId)) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER.toString(), "You dont have any orders with this id.");
        }
        return Result.success(order);
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