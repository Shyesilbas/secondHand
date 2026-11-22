package com.serhat.secondhand.escrow;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** A platform coupon is funded by the platform: the buyer pays and is refunded the net price, the seller is paid the full price. */
class EscrowPlatformCouponSubsidyTest {

    private static final BigDecimal NET = new BigDecimal("7125.00");
    private static final BigDecimal COUPON = new BigDecimal("375.00");
    private static final BigDecimal FULL = new BigDecimal("7500.00");

    private final EscrowRepository escrowRepository = mock(EscrowRepository.class);
    private final IEWalletService walletService = mock(IEWalletService.class);
    private final EscrowOutboxRepository outboxRepository = mock(EscrowOutboxRepository.class);
    private final EscrowService service = new EscrowService(escrowRepository, mock(PaymentRepository.class),
            walletService, mock(ApplicationEventPublisher.class),
            new EscrowOutboxService(outboxRepository, new ObjectMapper().findAndRegisterModules()),
            mock(PaymentStatsCacheEvictor.class));

    private final User buyer = User.builder().id(1L).build();
    private final User seller = User.builder().id(2L).build();

    private Order order() {
        Order order = new Order();
        order.setId(50L);
        order.setUser(buyer);
        order.setExternalId(UUID.randomUUID());
        order.setOrderNumber("ORD-COUPON");
        order.setTotalAmount(NET);
        return order;
    }

    private OrderItem item(Order order) {
        Listing listing = new Listing();
        listing.setId(UUID.randomUUID());
        listing.setSeller(seller);
        listing.setTitle("Jersey");
        OrderItem item = new OrderItem();
        item.setId(44L);
        item.setOrder(order);
        item.setListing(listing);
        item.setTotalPrice(NET);
        item.setCouponDiscount(COUPON);
        order.setOrderItems(List.of(item));
        return item;
    }

    private Escrow heldEscrow(Order order, OrderItem item) {
        return Escrow.builder().id(9L).order(order).orderItem(item).seller(seller).buyer(buyer)
                .amount(NET).platformSubsidy(COUPON).status(PaymentStatus.ESCROW).build();
    }

    @Test
    void holdKeepsBuyerPaidAmountAndRecordsTheCouponShareAsSubsidy() {
        Order order = order();
        item(order);

        service.hold(order);

        ArgumentCaptor<Escrow> saved = ArgumentCaptor.forClass(Escrow.class);
        verify(escrowRepository).save(saved.capture());
        assertThat(saved.getValue().getAmount()).isEqualByComparingTo(NET);
        assertThat(saved.getValue().getPlatformSubsidy()).isEqualByComparingTo(COUPON);
    }

    @Test
    void releasePaysTheSellerTheFullPriceNotTheCouponReducedOne() throws Exception {
        Order order = order();
        Escrow escrow = heldEscrow(order, item(order));
        when(escrowRepository.findByOrderIdAndStatusForUpdate(50L, PaymentStatus.ESCROW)).thenReturn(List.of(escrow));

        service.release(order);

        ArgumentCaptor<EscrowOutboxEvent> event = ArgumentCaptor.forClass(EscrowOutboxEvent.class);
        verify(outboxRepository).save(event.capture());
        BigDecimal credited = new ObjectMapper().readTree(event.getValue().getPayload()).get("amount").decimalValue();
        assertThat(credited).isEqualByComparingTo(FULL);
    }

    @Test
    void cancelRefundsTheBuyerOnlyWhatTheBuyerPaid() {
        Order order = order();
        OrderItem item = item(order);
        when(escrowRepository.findByOrderItemIdInForUpdate(anyList())).thenReturn(List.of(heldEscrow(order, item)));

        service.cancel(order, List.of(item));

        verify(walletService).creditToUser(eq(buyer), eq(NET), any(), eq(PaymentTransactionKind.REFUND), isNull());
    }

    @Test
    void sellerEarningsPerOrderIncludeTheSubsidy() {
        Order order = order();
        Escrow escrow = heldEscrow(order, item(order));
        when(escrowRepository.findByOrderIdInAndSellerIdAndStatusIn(anyList(), eq(2L), any())).thenReturn(List.of(escrow));

        Map<Long, BigDecimal> earnings = service.sumSellerAmountsByOrderIds(List.of(50L), 2L);

        assertThat(earnings.get(50L)).isEqualByComparingTo(FULL);
    }
}
