package com.serhat.secondhand.order.service;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;

public interface IOrderValidationService {
    
    Result<Order> validateOwnership(Long orderId, Long userId);
    
    Result<Order> validateOwnership(Long orderId, User user);
}
