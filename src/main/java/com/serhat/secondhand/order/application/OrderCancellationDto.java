package com.serhat.secondhand.order.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.order.dto.OrderDto;

public record OrderCancellationDto(Result<OrderDto> result) {
}

