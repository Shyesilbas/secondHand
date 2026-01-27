package com.serhat.secondhand.showcase;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;

import java.util.List;
import java.util.UUID;

public interface IShowcaseService {
    List<ShowcaseDto> getActiveShowcases();
    List<ShowcaseDto> getUserShowcases(Long userId);
    Result<Void> extendShowcase(UUID showcaseId, int additionalDays);
    Result<Void> cancelShowcase(UUID showcaseId);
    void expireShowcases();
    ShowcasePricingDto getShowcasePricingConfig();
    Result<Showcase> createShowcase(Long userId, ShowcasePaymentRequest request);

}
