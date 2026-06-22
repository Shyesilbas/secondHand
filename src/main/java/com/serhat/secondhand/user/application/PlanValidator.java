package com.serhat.secondhand.user.application;

import org.springframework.http.HttpStatus;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class PlanValidator {

    private static final String PREMIUM_REQUIRED = "PREMIUM_PLAN_REQUIRED";
    private static final String AURA_LIMIT_EXCEEDED = "AURA_DAILY_LIMIT_EXCEEDED";
    private static final String AI_QUOTA_EXHAUSTED = "AI_LISTING_QUOTA_EXHAUSTED";
    private static final String SHOWCASE_LIMIT_EXCEEDED = "SHOWCASE_SLOT_LIMIT_EXCEEDED";

    public void checkAuraLimit(User user) {
        resetDailyUsageIfNeeded(user);
        int limit = user.getEffectivePlan().getDailyAuraLimit();
        if (user.getDailyAuraUsage() >= limit) {
            throw new BusinessException("Günlük Aura AI kullanım limitinize ulaştınız.", HttpStatus.FORBIDDEN, "AURA_LIMIT_EXCEEDED");
        }
    }

    public void checkAiListingQuota(User user) {
        if (user.getAiListingQuota() <= 0) {
            throw new BusinessException("Aylık AI ilan oluşturma limitinizi doldurdunuz.", HttpStatus.FORBIDDEN, "AI_QUOTA_EXHAUSTED");
        }
    }

    public void checkShowcaseSlot(User user, int currentSlotCount) {
        int maxSlots = user.getEffectivePlan().getMaxShowcaseSlots();
        if (currentSlotCount >= maxSlots) {
            throw new BusinessException("Mevcut planınız (" + user.getEffectivePlan() + ") bu kadar vitrin ilanına izin vermiyor.", HttpStatus.FORBIDDEN, "SHOWCASE_SLOT_LIMIT_EXCEEDED");
        }
    }

    private void resetDailyUsageIfNeeded(User user) {
        LocalDate today = LocalDate.now();
        if (user.getDailyAuraResetDate() == null || !user.getDailyAuraResetDate().equals(today)) {
            user.setDailyAuraUsage(0);
            user.setDailyAuraResetDate(today);
        }
    }
}
