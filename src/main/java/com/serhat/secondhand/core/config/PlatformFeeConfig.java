package com.serhat.secondhand.core.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Platform fees: system account, seller commission bands and the flat cargo fee. */
@Configuration
@ConfigurationProperties(prefix = "app.platform")
@Getter
@Setter
public class PlatformFeeConfig {

    /** E-mail of the seeded system user (V62); the system account is resolved by it. */
    private String systemAccountEmail;

    private Commission commission;
    private Shipping shipping;

    @Getter
    @Setter
    public static class Commission {
        /** Orders created before this moment pay no commission. */
        private LocalDateTime effectiveFrom;
        /** Ascending by {@code minAmount}; the last band whose minimum is reached applies. */
        private List<Band> bands;
    }

    @Getter
    @Setter
    public static class Band {
        private BigDecimal minAmount;
        /** Percent, e.g. 7 for 7%. */
        private BigDecimal ratePercent;
    }

    @Getter
    @Setter
    public static class Shipping {
        private BigDecimal fee;
        /** Seller order goods total (after coupon) from which cargo shipping is free for the buyer; zero or less disables it. */
        private BigDecimal freeThreshold;
    }
}
