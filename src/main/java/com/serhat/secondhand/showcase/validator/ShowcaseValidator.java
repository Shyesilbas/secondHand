package com.serhat.secondhand.showcase.validator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.ShowcaseErrorCodes;
import com.serhat.secondhand.showcase.ShowcaseStatus;
import org.springframework.stereotype.Component;

@Component
public class ShowcaseValidator {

    public Result<Void> validateDaysCount(int days) {
        if (days <= 0 || days > 30) {
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

