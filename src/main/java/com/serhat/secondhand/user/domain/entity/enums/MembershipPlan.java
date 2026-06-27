package com.serhat.secondhand.user.domain.entity.enums;

import java.util.List;

public enum MembershipPlan {
    FREE,
    PREMIUM;

    public int getDailyAuraLimit() {
        return this == PREMIUM ? 8 : 2;
    }

    public int getMonthlyAiListingQuota() {
        return 0;
    }

    public int getMaxShowcaseSlots() {
        return this == PREMIUM ? 4 : 1;
    }

    public int getEstimatedShippingDays() {
        return this == PREMIUM ? 1 : 3;
    }

    public String getOrderProcessingSpeed() {
        return this == PREMIUM ? "%50 Daha Hızlı" : "Standart";
    }

    public List<String> getBenefits() {
        if (this == PREMIUM) {
            return List.of(
                "Öne Çıkarılan İlan Görünürlüğü (Premium)",
                "Günlük 8 Aura AI mesajı",
                "4 Showcase Slotu",
                "Hızlı Kargo (%50 daha hızlı)",
                "Düşük komisyon oranları"
            );
        } else {
            return List.of(
                "Standart İlan Görünürlüğü",
                "Günlük 2 Aura AI mesajı",
                "1 Showcase Slotu",
                "Standart Kargo (3 iş günü)"
            );
        }
    }
}

