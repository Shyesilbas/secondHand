package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.enums.CancelRefundReason;

import java.util.List;

public interface OrderCompensationRequest {

    List<Long> getOrderItemIds();

    CancelRefundReason getReason();

    String getReasonText();
}
