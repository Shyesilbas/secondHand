package com.serhat.secondhand.escrow;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.idempotency.ProcessedKafkaEventRepository;
import com.serhat.secondhand.escrow.application.EscrowKafkaConsumer;
import com.serhat.secondhand.escrow.contract.EscrowReleasedKafkaEvent;
import com.serhat.secondhand.ewallet.application.IEWalletService;
import com.serhat.secondhand.payment.util.PaymentErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class EscrowKafkaConsumerTest {

    private final IEWalletService walletService = mock(IEWalletService.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final com.serhat.secondhand.user.application.SystemAccountService systemAccountService =
            mock(com.serhat.secondhand.user.application.SystemAccountService.class);
    private final ProcessedKafkaEventRepository processedEvents = mock(ProcessedKafkaEventRepository.class);
    private final EscrowKafkaConsumer consumer = new EscrowKafkaConsumer(walletService, userRepository,
            systemAccountService, processedEvents);

    private static EscrowReleasedKafkaEvent event(Long escrowId, Long sellerId, BigDecimal amount) {
        return new EscrowReleasedKafkaEvent(escrowId, 10L, "ORD-1", 20L, null, sellerId, "s@x.com",
                30L, "b@x.com", amount, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, "TRY", LocalDateTime.now());
    }

    @Test
    void missingSeller_failsSoTheEventIsRetriedAndDeadLettered() {
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(1);
        when(userRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> consumer.consumeEscrowReleased(event(1L, 5L, new BigDecimal("100.00"))))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(PaymentErrorCodes.ESCROW_RELEASE_SELLER_NOT_FOUND.getCode());
        verify(walletService, never()).creditWalletQuietly(any(), any());
    }

    @Test
    void eventWithMissingFields_failsBeforeDedupe() {
        assertThatThrownBy(() -> consumer.consumeEscrowReleased(event(1L, null, new BigDecimal("100.00"))))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> consumer.consumeEscrowReleased(event(1L, 5L, null)))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> consumer.consumeEscrowReleased(event(null, 5L, new BigDecimal("100.00"))))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(processedEvents, walletService);
    }

    @Test
    void existingSeller_isCreditedOnce() {
        User seller = new User();
        seller.setId(5L);
        when(processedEvents.insertIfNotExists("escrow:release:1", "escrow-released-consumers")).thenReturn(1);
        when(userRepository.findById(5L)).thenReturn(Optional.of(seller));

        consumer.consumeEscrowReleased(event(1L, 5L, new BigDecimal("100.00")));

        verify(walletService).creditWalletQuietly(seller, new BigDecimal("100.00"));
    }

    @Test
    void commissionAndCouponSubsidyAreSettledOnTheSystemAccountAsOneSignedMove() {
        User seller = new User();
        seller.setId(5L);
        User system = new User();
        system.setId(99L);
        when(systemAccountService.getSystemUser()).thenReturn(system);
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(1);
        when(userRepository.findById(5L)).thenReturn(Optional.of(seller));

        // commission 70.00 kept, coupon subsidy 20.00 funded: net +50.00 for the system account
        consumer.consumeEscrowReleased(new EscrowReleasedKafkaEvent(1L, 10L, "ORD-1", 20L, null, 5L, "s@x.com",
                30L, "b@x.com", new BigDecimal("930.00"), new BigDecimal("20.00"), new BigDecimal("70.00"), BigDecimal.ZERO,
                "TRY", LocalDateTime.now()));

        verify(walletService).creditWalletQuietly(seller, new BigDecimal("930.00"));
        verify(walletService).creditWalletQuietly(system, new BigDecimal("50.00"));
    }

    @Test
    void subsidyLargerThanCommissionDebitsTheSystemAccount() {
        User seller = new User();
        seller.setId(5L);
        User system = new User();
        system.setId(99L);
        when(systemAccountService.getSystemUser()).thenReturn(system);
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(1);
        when(userRepository.findById(5L)).thenReturn(Optional.of(seller));

        consumer.consumeEscrowReleased(new EscrowReleasedKafkaEvent(1L, 10L, "ORD-1", 20L, null, 5L, "s@x.com",
                30L, "b@x.com", new BigDecimal("100.00"), new BigDecimal("30.00"), BigDecimal.ZERO, BigDecimal.ZERO,
                "TRY", LocalDateTime.now()));

        verify(walletService).creditWalletQuietly(system, new BigDecimal("-30.00"));
    }

    @Test
    void duplicateEvent_isSkipped() {
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(0);

        consumer.consumeEscrowReleased(event(1L, 5L, new BigDecimal("100.00")));

        verifyNoInteractions(walletService, userRepository);
    }

    @Test
    void shippingDeductionIsCreditedToTheSystemAccountWithTheCommission() {
        User seller = new User();
        seller.setId(5L);
        User system = new User();
        system.setId(99L);
        when(systemAccountService.getSystemUser()).thenReturn(system);
        when(processedEvents.insertIfNotExists(anyString(), anyString())).thenReturn(1);
        when(userRepository.findById(5L)).thenReturn(Optional.of(seller));

        // payout already net of commission 70.00 and shipping 49.90; system keeps both
        consumer.consumeEscrowReleased(new EscrowReleasedKafkaEvent(1L, 10L, "ORD-1", 20L, null, 5L, "s@x.com",
                30L, "b@x.com", new BigDecimal("880.10"), BigDecimal.ZERO, new BigDecimal("70.00"),
                new BigDecimal("49.90"), "TRY", LocalDateTime.now()));

        verify(walletService).creditWalletQuietly(seller, new BigDecimal("880.10"));
        verify(walletService).creditWalletQuietly(system, new BigDecimal("119.90"));
    }
}
