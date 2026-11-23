package com.serhat.secondhand.escrow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.escrow.application.CommissionService;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxEvent;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxService;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.payment.application.PaymentStatsCacheEvictor;
import com.serhat.secondhand.payment.contract.PaymentTransactionKind;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.testsupport.PlatformFeeTestConfig;
import com.serhat.secondhand.user.application.SystemAccountService;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Seller commission: stored on hold, withheld from the payout on release, shipping fee given back on full cancel. */
class EscrowCommissionTest {

    private static final LocalDateTime EFFECTIVE = LocalDateTime.of(2026, 12, 1, 0, 0);

    private final EscrowRepository escrowRepository = mock(EscrowRepository.class);
    private final IEWalletService walletService = mock(IEWalletService.class);
    private final EscrowOutboxRepository outboxRepository = mock(EscrowOutboxRepository.class);
    private final SystemAccountService systemAccountService = mock(SystemAccountService.class);
    private final User system = User.builder().id(99L).build();
    private final EscrowService service = new EscrowService(escrowRepository, mock(PaymentRepository.class),
            walletService, mock(ApplicationEventPublisher.class),
            new EscrowOutboxService(outboxRepository, new ObjectMapper().findAndRegisterModules()),
            mock(PaymentStatsCacheEvictor.class),
            new CommissionService(PlatformFeeTestConfig.standard(EFFECTIVE)), systemAccountService);

    private final User buyer = User.builder().id(1L).build();
    private final User seller = User.builder().id(2L).build();

    private Order order(LocalDateTime createdAt) {
        Order order = new Order();
        order.setId(50L);
        order.setUser(buyer);
        order.setExternalId(UUID.randomUUID());
        order.setOrderNumber("ORD-COMM");
        order.setCreatedAt(createdAt);
        order.setTotalAmount(new BigDecimal("2000.00"));
        return order;
    }

    private OrderItem item(Order order) {
        Listing listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setSeller(seller);
        listing.setTitle("Console");
        OrderItem item = new OrderItem();
        item.setId(44L);
        item.setOrder(order);
        item.setListing(listing);
        item.setTotalPrice(new BigDecimal("2000.00"));
        order.setOrderItems(List.of(item));
        return item;
    }

    @Test
    void holdStoresTheCommissionOfTheBandTheSellerGrossFallsIn() {
        Order order = order(EFFECTIVE.plusHours(1));
        item(order);

        service.hold(order);

        ArgumentCaptor<Escrow> saved = ArgumentCaptor.forClass(Escrow.class);
        verify(escrowRepository).save(saved.capture());
        assertThat(saved.getValue().getCommissionRate()).isEqualByComparingTo("6");
        assertThat(saved.getValue().getCommissionAmount()).isEqualByComparingTo("120.00");
        assertThat(saved.getValue().sellerPayout()).isEqualByComparingTo("1880.00");
    }

    @Test
    void holdBeforeTheEffectiveDateTakesNoCommission() {
        Order order = order(EFFECTIVE.minusDays(1));
        item(order);

        service.hold(order);

        ArgumentCaptor<Escrow> saved = ArgumentCaptor.forClass(Escrow.class);
        verify(escrowRepository).save(saved.capture());
        assertThat(saved.getValue().getCommissionAmount()).isEqualByComparingTo("0");
        assertThat(saved.getValue().sellerPayout()).isEqualByComparingTo("2000.00");
    }

    @Test
    void releaseCreditsTheSellerTheNetPayoutAndCarriesTheCommissionInTheEvent() throws Exception {
        Order order = order(EFFECTIVE.plusHours(1));
        OrderItem item = item(order);
        Escrow escrow = Escrow.builder().id(9L).order(order).orderItem(item).seller(seller).buyer(buyer)
                .amount(new BigDecimal("2000.00")).commissionAmount(new BigDecimal("120.00"))
                .status(PaymentStatus.ESCROW).build();
        when(escrowRepository.findByOrderIdAndStatusForUpdate(50L, PaymentStatus.ESCROW)).thenReturn(List.of(escrow));

        service.release(order);

        ArgumentCaptor<EscrowOutboxEvent> event = ArgumentCaptor.forClass(EscrowOutboxEvent.class);
        verify(outboxRepository).save(event.capture());
        JsonNode payload = new ObjectMapper().readTree(event.getValue().getPayload());
        assertThat(payload.get("amount").decimalValue()).isEqualByComparingTo("1880.00");
        assertThat(payload.get("commissionAmount").decimalValue()).isEqualByComparingTo("120.00");
    }

    @Test
    void refundShippingFeeGivesTheFeeBackOnceAndTheSystemAccountGivesItUp() {
        Order order = order(EFFECTIVE.plusHours(1));
        item(order);
        order.setShippingFee(new BigDecimal("49.90"));
        when(systemAccountService.getSystemUser()).thenReturn(system);

        service.refundShippingFee(order);
        service.refundShippingFee(order);

        verify(walletService).creditToUser(eq(buyer), eq(new BigDecimal("49.90")), any(),
                eq(PaymentTransactionKind.REFUND), isNull());
        verify(walletService).creditWalletQuietly(system, new BigDecimal("-49.90"));
        assertThat(order.isShippingFeeRefunded()).isTrue();
    }

    @Test
    void refundShippingFeeDoesNothingWhenNoFeeWasCharged() {
        Order order = order(EFFECTIVE.plusHours(1));
        item(order);

        service.refundShippingFee(order);

        verify(walletService, never()).creditToUser(any(), any(), any(), any(), any());
    }

    @Test
    void freeShippingChargeIsSplitAcrossItemsBySellerGrossAndSumsToTheCharge() {
        Order order = order(EFFECTIVE.plusHours(1));
        order.setSellerShippingCharge(new BigDecimal("49.90"));
        OrderItem first = item(order);
        first.setTotalPrice(new BigDecimal("1500.00"));
        Listing second = new Listing();
        second.setId(UUID.randomUUID());
        second.setSeller(seller);
        second.setTitle("Cable");
        OrderItem secondItem = new OrderItem();
        secondItem.setId(45L);
        secondItem.setOrder(order);
        secondItem.setListing(second);
        secondItem.setTotalPrice(new BigDecimal("500.00"));
        order.setOrderItems(List.of(first, secondItem));

        service.hold(order);

        ArgumentCaptor<Escrow> saved = ArgumentCaptor.forClass(Escrow.class);
        verify(escrowRepository, org.mockito.Mockito.times(2)).save(saved.capture());
        BigDecimal firstShare = saved.getAllValues().get(0).getShippingDeduction();
        BigDecimal secondShare = saved.getAllValues().get(1).getShippingDeduction();
        assertThat(firstShare).isEqualByComparingTo("37.43");
        assertThat(firstShare.add(secondShare)).isEqualByComparingTo("49.90");
        assertThat(saved.getAllValues().get(0).sellerPayout()).isEqualByComparingTo("1372.57");
    }

    @Test
    void orderWithoutSellerShippingChargeDeductsNothing() {
        Order order = order(EFFECTIVE.plusHours(1));
        item(order);

        service.hold(order);

        ArgumentCaptor<Escrow> saved = ArgumentCaptor.forClass(Escrow.class);
        verify(escrowRepository).save(saved.capture());
        assertThat(saved.getValue().getShippingDeduction()).isEqualByComparingTo("0");
    }
}
