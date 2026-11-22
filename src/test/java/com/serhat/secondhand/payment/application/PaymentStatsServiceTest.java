package com.serhat.secondhand.payment.application;

import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.payment.dto.PaymentStatisticsDto;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.mapper.PaymentMapper;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.payment.entity.PaymentDirection;
import com.serhat.secondhand.payment.entity.PaymentTransactionType;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

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

    @Test
    void cacheKey_normalizesFilterSoEvictedKeysMatchWhatWasCached() {
        assertThat(PaymentStatsService.cacheKey(7L, null)).isEqualTo("user:7:ALL");
        assertThat(PaymentStatsService.cacheKey(7L, "  ")).isEqualTo("user:7:ALL");
        assertThat(PaymentStatsService.cacheKey(7L, " ewallet ")).isEqualTo("user:7:EWALLET");
        assertThat(PaymentStatsService.isCacheable(null)).isTrue();
        assertThat(PaymentStatsService.isCacheable("ewallet")).isTrue();
        // Unknown filters are never cached, since nothing would evict them.
        assertThat(PaymentStatsService.isCacheable("anything")).isFalse();
    }

    @Test
    void statistics_queryUsesTheNormalizedProvider() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        PaymentStatsService service = new PaymentStatsService(paymentRepository, mock(EscrowRepository.class),
                mock(PaymentMapper.class), mock(PaymentContextResolver.class));
        when(paymentRepository.getPaymentStats(7L, "EWALLET")).thenReturn(List.of());

        service.getPaymentStatistics(7L, "ewallet");

        verify(paymentRepository).getPaymentStats(7L, "EWALLET");
    }

    @Test
    void myPayments_sellerSeesBuyerPaidPlusPlatformCouponShare_buyerSeesPaidAmount() {
        PaymentRepository paymentRepository = mock(PaymentRepository.class);
        EscrowRepository escrowRepository = mock(EscrowRepository.class);
        PaymentMapper mapper = mock(PaymentMapper.class);
        PaymentContextResolver resolver = mock(PaymentContextResolver.class);
        PaymentStatsService service = new PaymentStatsService(paymentRepository, escrowRepository, mapper, resolver);

        User buyer = User.builder().id(1L).build();
        User seller = User.builder().id(2L).build();
        Payment payment = Payment.builder().fromUser(buyer).toUser(seller).orderItemId(55L)
                .amount(new BigDecimal("95.00")).build();
        PaymentDto base = new PaymentDto(null, "b", "s", new BigDecimal("95.00"), "TRY", "EWALLET", null,
                PaymentTransactionType.ITEM_SALE, PaymentDirection.INCOMING, null, null, null, null,
                PaymentStatus.ESCROW, true, null);
        when(mapper.toDto(payment)).thenReturn(base);
        when(resolver.resolve(any(), any())).thenReturn(new PaymentContextResolver.InferredPaymentData(
                PaymentDirection.INCOMING, PaymentTransactionType.ITEM_SALE));
        OrderItem item = new OrderItem();
        item.setId(55L);
        Escrow escrow = Escrow.builder().orderItem(item).amount(new BigDecimal("95.00"))
                .platformSubsidy(new BigDecimal("5.00")).build();
        when(escrowRepository.findByOrderItemIdIn(List.of(55L))).thenReturn(List.of(escrow));
        when(paymentRepository.findByUserId(eq(2L), any())).thenReturn(new PageImpl<>(List.of(payment)));
        when(paymentRepository.findByUserId(eq(1L), any())).thenReturn(new PageImpl<>(List.of(payment)));

        PaymentDto sellerView = service.getMyPayments(2L, PageRequest.of(0, 10), null).getContent().get(0);
        PaymentDto buyerView = service.getMyPayments(1L, PageRequest.of(0, 10), null).getContent().get(0);

        assertThat(sellerView.amount()).isEqualByComparingTo("100.00");
        assertThat(buyerView.amount()).isEqualByComparingTo("95.00");
    }
}
