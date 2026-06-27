package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.payment.application.PaymentProcessor;
import com.serhat.secondhand.payment.application.PaymentRequestFactory;
import com.serhat.secondhand.payment.dto.PaymentDto;
import com.serhat.secondhand.payment.dto.PaymentRequest;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.dto.MembershipStatusDto;
import com.serhat.secondhand.user.dto.MembershipUpgradeRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class MembershipServiceTest {

    private UserRepository userRepository;
    private PaymentProcessor paymentProcessor;
    private PaymentRequestFactory paymentRequestFactory;
    private MembershipService membershipService;
    private MembershipScheduler membershipScheduler;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        paymentProcessor = mock(PaymentProcessor.class);
        paymentRequestFactory = mock(PaymentRequestFactory.class);
        membershipService = new MembershipService(userRepository, paymentProcessor, paymentRequestFactory);
        membershipScheduler = new MembershipScheduler(userRepository, membershipService);
    }

    @Test
    void testUpgradeToPremium_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setPlan(MembershipPlan.FREE);

        MembershipUpgradeRequest upgradeRequest = new MembershipUpgradeRequest(true, List.of(), "123456");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        
        PaymentRequest mockPaymentRequest = mock(PaymentRequest.class);
        when(paymentRequestFactory.buildMembershipPaymentRequest(eq(user), any(BigDecimal.class), any(), any(), eq(upgradeRequest)))
                .thenReturn(mockPaymentRequest);

        PaymentDto paymentDto = mock(PaymentDto.class);
        when(paymentProcessor.executeSinglePayment(eq(userId), eq(mockPaymentRequest)))
                .thenReturn(Result.success(paymentDto));

        MembershipStatusDto result = membershipService.upgradeToPremium(userId, upgradeRequest);

        assertNotNull(result);
        assertEquals("PREMIUM", result.plan());
        assertTrue(result.isPremium());
        assertTrue(result.autoRenew());
        assertNotNull(result.purchaseDate());
        assertNotNull(result.expirationDate());

        verify(userRepository).save(user);
    }

    @Test
    void testUpgradeToPremium_AlreadyPremium_ThrowsException() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setPlan(MembershipPlan.PREMIUM);
        user.setExpirationDate(LocalDateTime.now().plusDays(10)); // active

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MembershipUpgradeRequest upgradeRequest = new MembershipUpgradeRequest(true, List.of(), "123456");

        assertThrows(BusinessException.class, () -> membershipService.upgradeToPremium(userId, upgradeRequest));
    }

    @Test
    void testCancelSubscription_Success() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);
        user.setPlan(MembershipPlan.PREMIUM);
        user.setExpirationDate(LocalDateTime.now().plusDays(10));
        user.setAutoRenew(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        MembershipStatusDto result = membershipService.cancelSubscription(userId);

        assertNotNull(result);
        assertFalse(result.autoRenew());
        assertEquals("CANCELLED", result.status()); // isPremium is still true, autoRenew is false
        verify(userRepository).save(user);
    }

    @Test
    void testRenewPremiumMembership_Success() {
        User user = new User();
        user.setId(1L);
        user.setPlan(MembershipPlan.PREMIUM);
        user.setExpirationDate(LocalDateTime.now().minusHours(1)); // expired
        user.setAutoRenew(true);

        PaymentDto paymentDto = mock(PaymentDto.class);
        when(paymentProcessor.executeSinglePayment(eq(1L), any(PaymentRequest.class)))
                .thenReturn(Result.success(paymentDto));

        boolean renewed = membershipService.renewPremiumMembership(user);

        assertTrue(renewed);
        assertEquals(MembershipPlan.PREMIUM, user.getPlan());
        assertTrue(user.isAutoRenew());
        verify(userRepository).save(user);
    }

    @Test
    void testRenewPremiumMembership_InsufficientFunds_DowngradesToFree() {
        User user = new User();
        user.setId(1L);
        user.setPlan(MembershipPlan.PREMIUM);
        user.setExpirationDate(LocalDateTime.now().minusHours(1)); // expired
        user.setAutoRenew(true);

        when(paymentProcessor.executeSinglePayment(eq(1L), any(PaymentRequest.class)))
                .thenReturn(Result.error("Insufficient balance", "INSUFFICIENT_FUNDS"));

        boolean renewed = membershipService.renewPremiumMembership(user);

        assertFalse(renewed);
        assertEquals(MembershipPlan.FREE, user.getPlan());
        assertFalse(user.isAutoRenew());
        verify(userRepository).save(user);
    }

    @Test
    void testScheduler_ExpiredPremiumDowngrades() {
        User userAutoRenewFalse = new User();
        userAutoRenewFalse.setId(2L);
        userAutoRenewFalse.setPlan(MembershipPlan.PREMIUM);
        userAutoRenewFalse.setExpirationDate(LocalDateTime.now().minusHours(1));
        userAutoRenewFalse.setAutoRenew(false);

        when(userRepository.findExpiredPremiumUsers(any(LocalDateTime.class)))
                .thenReturn(List.of(userAutoRenewFalse));

        membershipScheduler.downgradeExpiredPremiumUsers();

        assertEquals(MembershipPlan.FREE, userAutoRenewFalse.getPlan());
        verify(userRepository).save(userAutoRenewFalse);
    }
}
