package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderShipRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.mapper.OrderMapper;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderShippingServiceImpl implements OrderShippingService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final OrderLogService orderLog;

    @Override
    @Transactional
    public Result<OrderDto> shipOrder(Long orderId, OrderShipRequest request, User seller) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    // Authorization: Check if seller owns at least one item in this order
                    boolean isSeller = order.getOrderItems().stream()
                            .anyMatch(item -> item.getSeller().getId().equals(seller.getId()));
                    
                    if (!isSeller) {
                        return Result.<OrderDto>error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
                    }

                    try {
                        if (order.getStatus() == com.serhat.secondhand.order.entity.enums.OrderStatus.CONFIRMED) {
                            order.markAsProcessing();
                        }
                        order.markAsShipped(request.getCarrier(), request.getTrackingNumber());
                        Order savedOrder = orderRepository.save(order);
                        
                        orderLog.logStatusChanged(order.getOrderNumber(), "PROCESSING", "SHIPPED");
                        log.info("Order {} marked as shipped by seller {}", order.getOrderNumber(), seller.getEmail());
                        
                        return Result.success(orderMapper.toDto(savedOrder));
                    } catch (IllegalStateException e) {
                        return Result.<OrderDto>error(e.getMessage(), "INVALID_ORDER_STATUS");
                    }
                })
                .orElseGet(() -> Result.error(OrderErrorCodes.ORDER_NOT_FOUND));
    }
}
