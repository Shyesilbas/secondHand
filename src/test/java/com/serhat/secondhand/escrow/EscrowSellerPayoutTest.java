package com.serhat.secondhand.escrow;

import com.serhat.secondhand.escrow.domain.entity.Escrow;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class EscrowSellerPayoutTest {

    @Test
    void payoutIsBuyerPaidPlusCouponShareMinusCommission() {
        Escrow escrow = Escrow.builder()
                .amount(new BigDecimal("95.00"))
                .platformSubsidy(new BigDecimal("5.00"))
                .commissionAmount(new BigDecimal("7.00"))
                .build();

        assertThat(escrow.sellerGross()).isEqualByComparingTo("100.00");
        assertThat(escrow.sellerPayout()).isEqualByComparingTo("93.00");
    }

    @Test
    void escrowWithoutCommissionPaysTheFullGross() {
        Escrow escrow = Escrow.builder().amount(new BigDecimal("40.00")).build();

        assertThat(escrow.sellerPayout()).isEqualByComparingTo("40.00");
    }

    @Test
    void payoutAlsoSubtractsTheShippingDeduction() {
        Escrow escrow = Escrow.builder()
                .amount(new BigDecimal("1200.00"))
                .commissionAmount(new BigDecimal("72.00"))
                .shippingDeduction(new BigDecimal("49.90"))
                .build();

        assertThat(escrow.sellerPayout()).isEqualByComparingTo("1078.10");
    }
}
