package com.serhat.secondhand.order.mapper;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OrderMapperRemainingQuantityTest {

    @Test
    void remainingQuantity_subtractsCancelledAndRefunded_neverNegative() {
        assertThat(OrderMapper.remainingQuantity(3, 0, 0)).isEqualTo(3);
        assertThat(OrderMapper.remainingQuantity(3, 1, 1)).isEqualTo(1);
        assertThat(OrderMapper.remainingQuantity(2, 2, 0)).isZero();
        assertThat(OrderMapper.remainingQuantity(1, 1, 1)).isZero();
        assertThat(OrderMapper.remainingQuantity(null, 0, 0)).isZero();
    }
}
