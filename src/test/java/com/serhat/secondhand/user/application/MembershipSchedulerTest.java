package com.serhat.secondhand.user.application;

import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.MembershipPlan;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipSchedulerTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private MembershipService membershipService;
    @Mock
    private PlatformTransactionManager transactionManager;

    private MembershipScheduler scheduler;

    @BeforeEach
    void setUp() {
        lenient().when(transactionManager.getTransaction(any(TransactionDefinition.class)))
                .thenAnswer(inv -> new SimpleTransactionStatus());
        scheduler = new MembershipScheduler(userRepository, membershipService, transactionManager);
    }

    @Test
    void downgradeExpiredPremiumUsersIsolatesFailurePerUserTransaction() {
        User failingUser = expiredPremiumUser(1L, true);
        User healthyAutoRenewUser = expiredPremiumUser(2L, true);
        User manualUser = expiredPremiumUser(3L, false);

        when(userRepository.findExpiredPremiumUserIds(any(LocalDateTime.class)))
                .thenReturn(List.of(1L, 2L, 3L));
        when(userRepository.findById(1L)).thenReturn(Optional.of(failingUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(healthyAutoRenewUser));
        when(userRepository.findById(3L)).thenReturn(Optional.of(manualUser));

        when(membershipService.renewPremiumMembership(failingUser))
                .thenThrow(new RuntimeException("eWallet unavailable"));
        when(membershipService.renewPremiumMembership(healthyAutoRenewUser))
                .thenReturn(true);

        scheduler.downgradeExpiredPremiumUsers();

        verify(transactionManager, times(3)).getTransaction(any(TransactionDefinition.class));
        verify(transactionManager, times(1)).rollback(any(TransactionStatus.class));
        verify(transactionManager, times(2)).commit(any(TransactionStatus.class));
        verify(membershipService).renewPremiumMembership(healthyAutoRenewUser);
        assertThat(manualUser.getPlan()).isEqualTo(MembershipPlan.FREE);
        verify(userRepository).save(manualUser);
    }

    @Test
    void resetMonthlyAiQuotaUsesSingleBulkUpdateWithoutLoadingAllUsers() {
        when(userRepository.resetMonthlyAiListingQuotas(
                any(LocalDateTime.class),
                eq(MembershipPlan.PREMIUM.getMonthlyAiListingQuota()),
                eq(MembershipPlan.FREE.getMonthlyAiListingQuota())))
                .thenReturn(42);

        scheduler.resetMonthlyAiQuota();

        verify(userRepository).resetMonthlyAiListingQuotas(
                any(LocalDateTime.class),
                eq(MembershipPlan.PREMIUM.getMonthlyAiListingQuota()),
                eq(MembershipPlan.FREE.getMonthlyAiListingQuota()));
        verify(userRepository, never()).findAll();
        verify(userRepository, never()).saveAll(any());
    }

    private User expiredPremiumUser(Long id, boolean autoRenew) {
        return User.builder()
                .id(id)
                .plan(MembershipPlan.PREMIUM)
                .expirationDate(LocalDateTime.now().minusDays(1))
                .autoRenew(autoRenew)
                .build();
    }
}
