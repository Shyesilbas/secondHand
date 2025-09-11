package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.payment.entity.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotNull(message = "Shipping address ID is required")
    private Long shippingAddressId;

    private Long billingAddressId; // Optional, if not provided, use shipping address

    private String notes;

    // Optional: defaults to CREDIT_CARD if not provided
    private PaymentType paymentType;
}
