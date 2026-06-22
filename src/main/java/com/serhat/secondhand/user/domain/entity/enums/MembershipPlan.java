package com.serhat.secondhand.user.domain.entity.enums;

public enum MembershipPlan {
    FREE,
    PREMIUM;

    public int getDailyAuraLimit() {
        return this == PREMIUM ? 10 : 4;
    }

    public int getMonthlyAiListingQuota() {
        return this == PREMIUM ? 4 : 1;
    }

    public int getMaxShowcaseSlots() {
        return this == PREMIUM ? 3 : 1;
    }

    public int getEstimatedShippingDays() {
        return this == PREMIUM ? 1 : 3;
    }

    public String getOrderProcessingSpeed() {
        return this == PREMIUM ? "2x Daha Hızlı" : "Standart";
    }
}
