package com.serhat.secondhand.showcase.validator;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.ShowcaseErrorCodes;
import com.serhat.secondhand.showcase.ShowcaseStatus;
import org.springframework.stereotype.Component;

@Component
public class ShowcaseValidator {

    public void validateDaysCount(int days) {
        if (days <= 0 || days > 30) {
            throw new BusinessException(ShowcaseErrorCodes.INVALID_DAYS_COUNT);
        }
    }

    public void validateIsActive(Showcase showcase) {
        if (showcase.getStatus() != ShowcaseStatus.ACTIVE) {
            throw new BusinessException(ShowcaseErrorCodes.SHOWCASE_NOT_ACTIVE);
        }
    }
}

