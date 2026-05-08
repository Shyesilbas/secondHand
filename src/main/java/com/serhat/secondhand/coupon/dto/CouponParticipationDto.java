package com.serhat.secondhand.coupon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponParticipationDto {
    private UUID redemptionId;
    private UUID couponId;
    private String couponCode;
    private String couponTitle;
    private String couponDescription;
    private LocalDateTime redeemedAt;
    /** Null if redemption had no linked order */
    private Long orderId;
    private String orderNumber;
}
