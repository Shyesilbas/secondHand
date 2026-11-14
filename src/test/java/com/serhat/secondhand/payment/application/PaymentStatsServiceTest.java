package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.payment.dto.PaymentStatisticsDto;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PaymentStatsServiceTest {

    @Test
    void statistics_areTypedAndDerivedFromLedgerAndEscrow() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        EscrowRepository escrowRepository = mock(EscrowRepository.class);
        PaymentStatsService service = new PaymentStatsService(paymentRepository, escrowRepository,
                mock(PaymentMapper.class), mock(PaymentContextResolver.class));
        List<Object[]> rows = List.<Object[]>of(new Object[] { 4L, 3L, new BigDecimal("50"), new BigDecimal("30"), null });
        when(paymentRepository.getPaymentStats(7L, null)).thenReturn(rows);
        when(escrowRepository.sumAmountBySellerIdAndStatus(7L, PaymentStatus.ESCROW)).thenReturn(new BigDecimal("12"));

        PaymentStatisticsDto stats = service.getPaymentStatistics(7L, null);

        assertThat(stats.totalPayments()).isEqualTo(4);
        assertThat(stats.successfulPayments()).isEqualTo(3);
        assertThat(stats.failedPayments()).isEqualTo(1);
        assertThat(stats.successRate()).isEqualTo(75.0);
        assertThat(stats.totalAmount()).isEqualByComparingTo("80");
        assertThat(stats.escrowAmount()).isEqualByComparingTo("12");
    }
}
