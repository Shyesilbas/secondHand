package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;
import com.serhat.secondhand.order.dto.OrderShipRequest;
import com.serhat.secondhand.user.domain.entity.User;

public interface OrderShippingService {
    /**
     * Marks an order as shipped by a seller.
     */
    Result<OrderDto> shipOrder(Long orderId, OrderShipRequest request, User seller);
}
