package com.serhat.secondhand.showcase.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.dto.ShowcaseDto;
import com.serhat.secondhand.showcase.dto.ShowcasePaymentRequest;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IShowcaseService {
    Page<ShowcaseDto> getActiveShowcases(int page, int size);
    List<ShowcaseDto> getUserShowcases(Long userId);
    Result<Void> extendShowcase(Long userId, UUID showcaseId, ShowcasePaymentRequest request);
    Result<Void> cancelShowcase(Long userId, UUID showcaseId);
    void expireShowcases();
    ShowcasePricingDto getShowcasePricingConfig();
    Result<Showcase> createShowcase(Long userId, ShowcasePaymentRequest request);

}
