package com.serhat.secondhand.order.application.event;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.user.domain.entity.User;

public record OrderRefundedEvent(Order order, User buyer) {
}
