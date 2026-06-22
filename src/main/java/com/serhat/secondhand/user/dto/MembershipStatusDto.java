package com.serhat.secondhand.user.dto;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;

import java.time.LocalDateTime;

public record MembershipStatusDto(
    String plan,
    boolean isPremium,
    LocalDateTime planExpiry,
    int dailyAuraUsage,
    int dailyAuraLimit,
    int aiListingQuota,
    int maxShowcaseSlots,
    int estimatedShippingDays,
    String orderProcessingSpeed,
    boolean autoRenew
) {
    public static MembershipStatusDto from(User user) {
        MembershipPlan effectivePlan = user.getEffectivePlan();
        return new MembershipStatusDto(
            effectivePlan.name(),
            user.isPremium(),
            user.getPlanExpiry(),
            user.getDailyAuraUsage(),
            effectivePlan.getDailyAuraLimit(),
            user.getAiListingQuota(),
            effectivePlan.getMaxShowcaseSlots(),
            effectivePlan.getEstimatedShippingDays(),
            effectivePlan.getOrderProcessingSpeed(),
            user.isAutoRenew()
        );
    }
}
