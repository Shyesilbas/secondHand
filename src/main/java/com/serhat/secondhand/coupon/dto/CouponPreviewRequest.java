package com.serhat.secondhand.coupon.dto;

import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponPreviewRequest {
    @Size(max = 64)
    private String couponCode;
    private UUID offerId;
}


