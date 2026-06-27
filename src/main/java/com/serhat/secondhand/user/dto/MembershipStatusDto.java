package com.serhat.secondhand.user.dto;

import com.serhat.secondhand.user.domain.entity
        .User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record MembershipStatusDto(
    String plan,
    boolean isPremium,
    LocalDateTime purchaseDate,
    LocalDateTime expirationDate,
    BigDecimal price,
    List<String> benefits,
    String status,
    int dailyAuraUsage,
    int dailyAuraLimit,
    int maxShowcaseSlots,
    int estimatedShippingDays,
    String orderProcessingSpeed,
    boolean autoRenew,
    int freeMaxShowcaseSlots,
    int premiumMaxShowcaseSlots,
    int freeDailyAuraLimit,
    int premiumDailyAuraLimit,
    int freeEstimatedShippingDays,
    int premiumEstimatedShippingDays,
    String freeOrderProcessingSpeed,
    String premiumOrderProcessingSpeed
) {
    public static MembershipStatusDto from(User user) {
        MembershipPlan effectivePlan = user.getEffectivePlan();
        
        String subscriptionStatus = "EXPIRED";
        if (user.isPremium()) {
            if (user.isAutoRenew()) {
                subscriptionStatus = "ACTIVE";
            } else {
                subscriptionStatus = "CANCELLED";
            }
        }

        return new MembershipStatusDto(
            effectivePlan.name(),
            user.isPremium(),
            user.getPurchaseDate(),
            user.getExpirationDate(),
            user.getPrice(),
            effectivePlan.getBenefits(),
            subscriptionStatus,
            user.getDailyAuraUsage(),
            effectivePlan.getDailyAuraLimit(),
            effectivePlan.getMaxShowcaseSlots(),
            effectivePlan.getEstimatedShippingDays(),
            effectivePlan.getOrderProcessingSpeed(),
            user.isAutoRenew(),
            MembershipPlan.FREE.getMaxShowcaseSlots(),
            MembershipPlan.PREMIUM.getMaxShowcaseSlots(),
            MembershipPlan.FREE.getDailyAuraLimit(),
            MembershipPlan.PREMIUM.getDailyAuraLimit(),
            MembershipPlan.FREE.getEstimatedShippingDays(),
            MembershipPlan.PREMIUM.getEstimatedShippingDays(),
            MembershipPlan.FREE.getOrderProcessingSpeed(),
            MembershipPlan.PREMIUM.getOrderProcessingSpeed()
        );
    }
}
