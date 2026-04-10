package com.serhat.secondhand.showcase.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.ShowcaseErrorCodes;
import com.serhat.secondhand.showcase.ShowcaseStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShowcaseValidator {

    private final ShowcaseConfig showcaseConfig;

    public Result<Void> validateDaysCount(int days) {
        int maxDays = showcaseConfig.getMaxDays() != null ? showcaseConfig.getMaxDays() : 30;
        if (days <= 0 || days > maxDays) {
            return Result.error(ShowcaseErrorCodes.INVALID_DAYS_COUNT);
        }
        return Result.success();
    }

    public Result<Void> validateIsActive(Showcase showcase) {
        if (showcase.getStatus() != ShowcaseStatus.ACTIVE) {
            return Result.error(ShowcaseErrorCodes.SHOWCASE_NOT_ACTIVE);
        }
        return Result.success();
    }
}

