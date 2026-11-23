package com.serhat.secondhand.escrow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.cart.entity.Cart;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.escrow.application.CommissionService;
import com.serhat.secondhand.escrow.application.EscrowKafkaConsumer;
import com.serhat.secondhand.escrow.application.EscrowService;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.escrow.domain.repository.EscrowRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxEvent;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxRepository;
import com.serhat.secondhand.escrow.outbox.EscrowOutboxService;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.order.application.OrderCreationService;
import com.serhat.secondhand.order.application.OrderLogService;
import com.serhat.secondhand.order.dto.CheckoutRequest;
import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.repository.OrderRepository;
import com.serhat.secondhand.payment.application.PaymentStatsCacheEvictor;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.payment.repository.PaymentRepository;
import com.serhat.secondhand.pricing.dto.PricedCartItemDto;
import com.serhat.secondhand.pricing.dto.PricingResultDto;
import com.serhat.secondhand.user.application.AddressService;
import com.serhat.secondhand.user.application.SystemAccountService;
import com.serhat.secondhand.user.domain.entity.Address;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * One chain with the real classes and in-memory stand-ins for persistence and Kafka: order creation fixes the
 * shipping split, the escrow hold and release carry it, the outbox payload survives a JSON round trip, and the
 * consumer lands the money in the seller and system wallets.
 */
class FreeShippingSettlementFlowTest {

    private static final LocalDateTime COMMISSION_STARTED = LocalDateTime.of(2026, 11, 1, 0, 0);

    private final User buyer = User.builder().id(1L).email("buyer@x.com").build();
    private final User seller = User.builder().id(2L).email("seller@x.com").build();
    private final User system = User.builder().id(99L).email("system@secondhand.internal").build();

    private final Map<Long, BigDecimal> wallets = new HashMap<>();
    private final List<Escrow> savedEscrows = new ArrayList<>();
    private final List<EscrowOutboxEvent> outbox = new ArrayList<>();

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final AddressService addressService = mock(AddressService.class);
    private final EscrowRepository escrowRepository = mock(EscrowRepository.class);
    private final EscrowOutboxRepository outboxRepository = mock(EscrowOutboxRepository.class);
    private final IEWalletService walletService = mock(IEWalletService.class);
    private final SystemAccountService systemAccountService = mock(SystemAccountService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final ProcessedKafkaEventRepository processedEvents = mock(ProcessedKafkaEventRepository.class);
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    private final OrderCreationService orderCreation = new OrderCreationService(orderRepository,
            com.serhat.secondhand.testsupport.PlatformFeeTestConfig.standard(COMMISSION_STARTED),
            addressService, mock(OrderLogService.class));
    private final EscrowService escrowService = new EscrowService(escrowRepository, mock(PaymentRepository.class),
            walletService, mock(ApplicationEventPublisher.class),
            new EscrowOutboxService(outboxRepository, objectMapper),
            mock(PaymentStatsCacheEvictor.class),
            new CommissionService(com.serhat.secondhand.testsupport.PlatformFeeTestConfig.standard(COMMISSION_STARTED)),
            systemAccountService);
    private final EscrowKafkaConsumer consumer = new EscrowKafkaConsumer(walletService, userRepository,
            systemAccountService, processedEvents);

    FreeShippingSettlementFlowTest() {
        Address address = mock(Address.class);
        when(address.getUser()).thenReturn(buyer);
        when(addressService.getAddressById(10L)).thenReturn(Optional.of(address));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(systemAccountService.getSystemUser()).thenReturn(system);
        when(userRepository.findById(seller.getId())).thenReturn(Optional.of(seller));
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(1);
        when(escrowRepository.findByOrderItemIdIn(any())).thenReturn(List.of());
        doAnswer(i -> {
            Escrow escrow = i.getArgument(0);
            escrow.setId(82L);
            savedEscrows.add(escrow);
            return escrow;
        }).when(escrowRepository).save(any(Escrow.class));
        when(escrowRepository.findByOrderIdAndStatusForUpdate(any(), any())).thenAnswer(i ->
                savedEscrows.stream().filter(e -> e.getStatus() == PaymentStatus.ESCROW).toList());
        doAnswer(i -> {
            outbox.add(i.getArgument(0));
            return i.getArgument(0);
        }).when(outboxRepository).save(any(EscrowOutboxEvent.class));
        doAnswer(i -> {
            User user = i.getArgument(0);
            wallets.merge(user.getId(), i.getArgument(1), BigDecimal::add);
            return null;
        }).when(walletService).creditWalletQuietly(any(User.class), any(BigDecimal.class));
    }

    /** Creates the seller's order from a one-item cart, as checkout does, and gives it the ids the database would. */
    private Order createOrder(String price) {
        Listing listing = Listing.builder().id(UUID.randomUUID()).seller(seller).price(new BigDecimal(price)).build();
        Cart cart = Cart.builder().listing(listing).quantity(1).build();
        PricingResultDto pricing = PricingResultDto.builder()
                .items(List.of(PricedCartItemDto.builder()
                        .listingId(listing.getId())
                        .sellerId(seller.getId())
                        .quantity(1)
                        .originalUnitPrice(new BigDecimal(price))
                        .lineSubtotal(new BigDecimal(price))
                        .couponDiscount(BigDecimal.ZERO)
                        .netLineTotal(new BigDecimal(price))
                        .build()))
                .build();

        Order order = orderCreation.createOrders(buyer, List.of(cart),
                CheckoutRequest.builder().shippingAddressId(10L).build(), pricing).getData().get(0);
        order.setId(56L);
        order.setCreatedAt(COMMISSION_STARTED.plusDays(1));
        long itemId = 100L;
        for (OrderItem item : order.getOrderItems()) {
            item.setId(itemId++);
        }
        return order;
    }

    /** Hold, release, push the outbox payload through JSON like the worker and Kafka do, and consume it. */
    private void settle(Order order) throws Exception {
        escrowService.hold(order);
        escrowService.release(order);

        ArgumentCaptor<EscrowOutboxEvent> published = ArgumentCaptor.forClass(EscrowOutboxEvent.class);
        verify(outboxRepository).save(published.capture());
        EscrowReleasedKafkaEvent event = objectMapper.readValue(published.getValue().getPayload(), EscrowReleasedKafkaEvent.class);
        consumer.consumeEscrowReleased(event);
    }

    @Test
    void orderAtTheThreshold_buyerPaysNoShipping_sellerPayoutAndSystemAccountSplitTheFeeAndCommission() throws Exception {
        Order order = createOrder("1450");

        assertThat(order.getShippingFee()).isEqualByComparingTo("0");
        assertThat(order.getSellerShippingCharge()).isEqualByComparingTo("49.90");

        settle(order);

        Escrow escrow = savedEscrows.get(0);
        assertThat(escrow.getAmount()).isEqualByComparingTo("1450.00");
        assertThat(escrow.getCommissionAmount()).isEqualByComparingTo("87.00");
        assertThat(escrow.getShippingDeduction()).isEqualByComparingTo("49.90");
        assertThat(wallets.get(seller.getId())).isEqualByComparingTo("1313.10");
        assertThat(wallets.get(system.getId())).isEqualByComparingTo("136.90");
        // nothing is lost or created on the way: payout plus the platform share equals the buyer-paid goods
        assertThat(wallets.get(seller.getId()).add(wallets.get(system.getId()))).isEqualByComparingTo(order.getTotalAmount());
    }

    @Test
    void orderBelowTheThreshold_buyerPaysTheShippingSeparately_systemAccountGetsOnlyTheCommission() throws Exception {
        Order order = createOrder("559");

        assertThat(order.getShippingFee()).isEqualByComparingTo("49.90");
        assertThat(order.getSellerShippingCharge()).isEqualByComparingTo("0");

        settle(order);

        assertThat(savedEscrows.get(0).getShippingDeduction()).isEqualByComparingTo("0");
        assertThat(wallets.get(seller.getId())).isEqualByComparingTo("519.87");
        assertThat(wallets.get(system.getId())).isEqualByComparingTo("39.13");
    }

    @Test
    void redeliveredReleaseEventCreditsNothingTwice() throws Exception {
        Order order = createOrder("1450");
        settle(order);
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(0);

        ArgumentCaptor<EscrowOutboxEvent> published = ArgumentCaptor.forClass(EscrowOutboxEvent.class);
        verify(outboxRepository).save(published.capture());
        consumer.consumeEscrowReleased(
                objectMapper.readValue(published.getValue().getPayload(), EscrowReleasedKafkaEvent.class));

        assertThat(wallets.get(seller.getId())).isEqualByComparingTo("1313.10");
        assertThat(wallets.get(system.getId())).isEqualByComparingTo("136.90");
    }
}
