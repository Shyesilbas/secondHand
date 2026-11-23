package com.serhat.secondhand.escrow;

import com.serhat.secondhand.escrow.application.CommissionService;
import com.serhat.secondhand.escrow.application.CommissionService.Commission;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import com.serhat.secondhand.testsupport.PlatformFeeTestConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class CommissionServiceTest {

    private static final LocalDateTime EFFECTIVE = LocalDateTime.of(2026, 12, 1, 0, 0);
    private static final LocalDateTime AFTER = EFFECTIVE.plusDays(1);

    private final CommissionService service = new CommissionService(PlatformFeeTestConfig.standard(EFFECTIVE));

    @ParameterizedTest
    @CsvSource({
            "1.00, 7, 0.07",
            "999.99, 7, 70.00",
            "1000.00, 6, 60.00",
            "9999.99, 6, 600.00",
            "10000.00, 4, 400.00",
            "25000.00, 4, 1000.00"
    })
    void bandIsPickedFromSellerGrossAndAppliedToIt(String gross, String rate, String commission) {
        Commission result = service.quote(ListingType.ELECTRONICS, AFTER, new BigDecimal(gross));

        assertThat(result.ratePercent()).isEqualByComparingTo(rate);
        assertThat(result.amount()).isEqualByComparingTo(commission);
    }

    @Test
    void vehicleAndRealEstatePayCreationFeeInsteadOfCommission() {
        assertThat(service.quote(ListingType.VEHICLE, AFTER, new BigDecimal("500000")).amount()).isEqualByComparingTo("0");
        assertThat(service.quote(ListingType.REAL_ESTATE, AFTER, new BigDecimal("500000")).ratePercent()).isNull();
    }

    @Test
    void ordersBeforeTheEffectiveDatePayNothing() {
        Commission result = service.quote(ListingType.BOOKS, EFFECTIVE.minusSeconds(1), new BigDecimal("500.00"));

        assertThat(result.amount()).isEqualByComparingTo("0");
        assertThat(result.ratePercent()).isNull();
        assertThat(service.quote(ListingType.BOOKS, EFFECTIVE, new BigDecimal("500.00")).amount()).isEqualByComparingTo("35.00");
    }

    @Test
    void zeroGrossOrUnknownOrderDateYieldsNoCommission() {
        assertThat(service.quote(ListingType.CLOTHING, AFTER, BigDecimal.ZERO).amount()).isEqualByComparingTo("0");
        assertThat(service.quote(ListingType.CLOTHING, null, new BigDecimal("100")).amount()).isEqualByComparingTo("0");
    }

    @Test
    void amountRoundsHalfUpToTwoDecimals() {
        // 7% of 33.33 = 2.3331 -> 2.33; 7% of 33.50 = 2.345 -> 2.35
        assertThat(service.quote(ListingType.SPORTS, AFTER, new BigDecimal("33.33")).amount()).isEqualByComparingTo("2.33");
        assertThat(service.quote(ListingType.SPORTS, AFTER, new BigDecimal("33.50")).amount()).isEqualByComparingTo("2.35");
    }
}
