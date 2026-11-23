package com.serhat.secondhand.core.application;

import com.serhat.secondhand.core.config.PlatformFeeConfig;
import com.serhat.secondhand.core.config.ShowcaseConfig;
import com.serhat.secondhand.core.dto.FeeScheduleDto;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeScheduleService {

    private final PlatformFeeConfig platformFeeConfig;
    private final ShowcaseConfig showcaseConfig;
    private final ListingFeePaymentService listingFeePaymentService;

    public FeeScheduleDto getFeeSchedule() {
        var listing = listingFeePaymentService.getListingFeeConfig();
        var commission = platformFeeConfig.getCommission();
        List<PlatformFeeConfig.Band> sorted = commission.getBands().stream()
                .sorted(Comparator.comparing(PlatformFeeConfig.Band::getMinAmount))
                .toList();
        List<FeeScheduleDto.Band> bands = new java.util.ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            BigDecimal max = i + 1 < sorted.size() ? sorted.get(i + 1).getMinAmount() : null;
            bands.add(new FeeScheduleDto.Band(sorted.get(i).getMinAmount(), max, sorted.get(i).getRatePercent()));
        }
        return new FeeScheduleDto(
                new FeeScheduleDto.ListingFee(listing.getCreationFee(), listing.getTaxPercentage(),
                        listing.getTotalCreationFee(), listing.getFeeBearingTypes()),
                new FeeScheduleDto.Commission(commission.getEffectiveFrom(), bands),
                platformFeeConfig.getShipping().getFee(),
                freeShippingThreshold(),
                new FeeScheduleDto.Showcase(showcaseConfig.getDaily().getCost(), showcaseConfig.getFee().getTax()));
    }

    private BigDecimal freeShippingThreshold() {
        BigDecimal threshold = platformFeeConfig.getShipping().getFreeThreshold();
        return threshold != null && threshold.signum() > 0 ? threshold : null;
    }
}
