package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderItemDto;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Page<OrderDto> getUserOrders(User user, Pageable pageable) {
        log.info("Getting orders for user: {}", user.getEmail());

        // If no sort is specified, default to createdAt DESC
        Pageable finalPageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            finalPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        Page<Order> orders = orderRepository.findByUser(user, finalPageable);

        return orders.map(orderMapper::toDto);
    }

    public Result<OrderDto> getOrderById(Long orderId, User user) {
        Result<Order> orderResult = findOrderByIdAndValidateOwnership(orderId, user);
        if (orderResult.isError()) {
            return Result.error(orderResult.getMessage(), orderResult.getErrorCode());
        }
        return Result.success(orderMapper.toDto(orderResult.getData()));
    }

    public Result<OrderDto> getOrderByOrderNumber(String orderNumber, User user) {
        Result<Order> orderResult = findOrderByNumberAndValidateOwnership(orderNumber, user);
        if (orderResult.isError()) {
            return Result.error(orderResult.getMessage(), orderResult.getErrorCode());
        }
        return Result.success(orderMapper.toDto(orderResult.getData()));
    }

    private Result<Order> findOrderByIdAndValidateOwnership(Long orderId, User user) {
        Order order = orderRepository.findById(orderId)
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        Result<Void> ownershipResult = validateOwnership(order, user);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }
        
        return Result.success(order);
    }

    private Result<Order> findOrderByNumberAndValidateOwnership(String orderNumber, User user) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }

        Result<Void> ownershipResult = validateOwnership(order, user);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }
        
        return Result.success(order);
    }

    private Result<Void> validateOwnership(Order order, User user) {
        if (!order.getUser().getId().equals(user.getId())) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        return Result.success();
    }

    public Page<OrderDto> getSellerOrders(User seller, Pageable pageable) {
        log.info("Getting orders for seller: {}", seller.getEmail());

        Pageable finalPageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            finalPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
            );
        }

        Page<Order> orders = orderRepository.findOrdersBySeller(seller, finalPageable);

        return orders.map(order -> {
            OrderDto orderDto = orderMapper.toDto(order);
            if (orderDto.getOrderItems() != null) {
                List<OrderItemDto> sellerOrderItems = orderDto.getOrderItems().stream()
                        .filter(item -> item.getListing() != null && 
                                item.getListing().getSellerId() != null &&
                                item.getListing().getSellerId().equals(seller.getId()))
                        .collect(Collectors.toList());
                orderDto.setOrderItems(sellerOrderItems);
            }
            java.math.BigDecimal escrowAmount = orderEscrowService.getPendingEscrowAmountByOrder(order, seller);
            orderDto.setEscrowAmount(escrowAmount);
            return orderDto;
        });
    }

    public Map<String, Object> getPendingCompletionStatus(User user) {
        boolean hasPending = orderRepository.existsByUserAndStatus(user, Order.OrderStatus.DELIVERED);
        long count = hasPending ? orderRepository.countByUserAndStatus(user, Order.OrderStatus.DELIVERED) : 0;
        
        log.debug("User {} has {} pending completion orders", user.getEmail(), count);
        
        return Map.of(
            "hasPendingOrders", hasPending,
            "pendingCount", count
        );
    }
}
