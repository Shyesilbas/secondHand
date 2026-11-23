package com.serhat.secondhand.testsupport;

import com.serhat.secondhand.core.config.PlatformFeeConfig;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** The production fee schedule (7 / 6 / 4 percent bands, 49.90 cargo fee) with a chosen commission start date. */
public final class PlatformFeeTestConfig {

    private PlatformFeeTestConfig() {
    }

    public static PlatformFeeConfig standard(LocalDateTime commissionEffectiveFrom) {
        PlatformFeeConfig config = new PlatformFeeConfig();
        config.setSystemAccountEmail("system@secondhand.internal");
        PlatformFeeConfig.Commission commission = new PlatformFeeConfig.Commission();
        commission.setEffectiveFrom(commissionEffectiveFrom);
        commission.setBands(List.of(band("0", "7"), band("1000", "6"), band("10000", "4")));
        config.setCommission(commission);
        PlatformFeeConfig.Shipping shipping = new PlatformFeeConfig.Shipping();
        shipping.setFee(new BigDecimal("49.90"));
        shipping.setFreeThreshold(new BigDecimal("1000"));
        config.setShipping(shipping);
        return config;
    }

    private static PlatformFeeConfig.Band band(String min, String rate) {
        PlatformFeeConfig.Band band = new PlatformFeeConfig.Band();
        band.setMinAmount(new BigDecimal(min));
        band.setRatePercent(new BigDecimal(rate));
        return band;
    }
}
