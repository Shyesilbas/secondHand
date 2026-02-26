package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.order.util.OrderErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderValidationService implements IOrderValidationService {
    
    private final OrderRepository orderRepository;
    
    @Override
    public Result<Order> validateOwnership(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElse(null);
        
        if (order == null) {
            return Result.error(OrderErrorCodes.ORDER_NOT_FOUND);
        }
        
        if (!order.getUser().getId().equals(userId)) {
            return Result.error(OrderErrorCodes.ORDER_NOT_BELONG_TO_USER);
        }
        
        return Result.success(order);
    }
    
    @Override
    public Result<Order> validateOwnership(Long orderId, User user) {
        return validateOwnership(orderId, user.getId());
    }
}
