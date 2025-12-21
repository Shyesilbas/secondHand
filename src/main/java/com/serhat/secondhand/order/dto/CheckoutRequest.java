package com.serhat.secondhand.order.dto;

import com.serhat.secondhand.payment.entity.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    @NotNull(message = "Shipping address ID is required")
    private Long shippingAddressId;

    private Long billingAddressId; 
    private String notes;

    private PaymentType paymentType;
    private String paymentVerificationCode;
    
    private boolean agreementsAccepted;
    private List<UUID> acceptedAgreementIds;

    private String couponCode;

    private UUID offerId;
}
