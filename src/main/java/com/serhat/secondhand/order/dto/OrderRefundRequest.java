package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.order.entity.enums.CancelRefundReason;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRefundRequest {

    private List<Long> orderItemIds;

    @NotNull(message = "Reason is required")
    private CancelRefundReason reason;

    private String reasonText;
}



