package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.auth.application.AccessRevocationService;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.listing.application.common.ListingModerationService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.application.event.UserBannedEvent;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SanctionExecutorTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 13, 12, 0);

    private final ListingModerationService listings = mock(ListingModerationService.class);
    private final AccessRevocationService revocation = mock(AccessRevocationService.class);
    private final UserRestrictionService restrictions = mock(UserRestrictionService.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final SanctionExecutor executor = new SanctionExecutor(listings, revocation,
            new ComplaintModerationProperties(), mock(PlatformTransactionManager.class), restrictions, events);

    @BeforeEach
    void startSynchronization() {
        TransactionSynchronizationManager.initSynchronization();
    }

    private static void commit() {
        for (TransactionSynchronization sync : TransactionSynchronizationManager.getSynchronizations()) {
            sync.afterCommit();
        }
    }

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    private static Complaint complaintAgainst(User user, Listing listing) {
        return Complaint.builder().id("c-1").complainedUser(user).listing(listing).build();
    }

    private static User user(int warnings) {
        User u = new User();
        u.setId(2L);
        u.setWarningCount(warnings);
        u.setAccountStatus(AccountStatus.ACTIVE);
        return u;
    }

    @Test
    void warningAddsOneToTheEffectiveCount() {
        User u = user(5);

        executor.apply(complaintAgainst(u, null), PenaltyAction.WARNING, 0, "HARASSMENT", NOW);

        assertThat(u.getWarningCount()).isEqualTo(1);
        assertThat(u.getLastPenalizedAt()).isEqualTo(NOW);
        verifyNoInteractions(listings, revocation);
    }

    @Test
    void listingSuspensionTakesDownOnlyThatListing() {
        Listing listing = mock(Listing.class);
        UUID id = UUID.randomUUID();
        when(listing.getId()).thenReturn(id);

        executor.apply(complaintAgainst(user(0), listing), PenaltyAction.LISTING_SUSPENDED, 0, "FALSE_ADVERTISING", NOW);

        verify(listings).suspend(id);
        verify(listings, never()).suspendAllActive(any());
    }

    @Test
    void listingSuspensionWithoutListingFailsFast() {
        assertThatThrownBy(() -> executor.apply(complaintAgainst(user(0), null),
                PenaltyAction.LISTING_SUSPENDED, 0, "FALSE_ADVERTISING", NOW))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void tempBanRestrictsForSevenDaysAndTakesDownAllListings() {
        User u = user(1);

        LocalDateTime until = executor.apply(complaintAgainst(u, null), PenaltyAction.TEMP_BAN_7_DAYS, 1, "HARASSMENT", NOW);

        assertThat(until).isEqualTo(NOW.plusDays(7));
        assertThat(u.getBannedUntil()).isEqualTo(NOW.plusDays(7));
        assertThat(u.isChatRestricted()).isTrue();
        assertThat(u.isListingRestricted()).isTrue();
        assertThat(u.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        verify(listings).suspendAllActive(2L);
        verifyNoInteractions(restrictions);
        commit();
        verify(restrictions).invalidate(2L);
    }

    @Test
    void warningDoesNotTouchTheRestrictionCache() {
        executor.apply(complaintAgainst(user(0), null), PenaltyAction.WARNING, 0, "HARASSMENT", NOW);
        commit();
        verifyNoInteractions(restrictions);
    }

    @Test
    void tempBanNeverShortensALongerRunningBan() {
        User u = user(0);
        u.setBannedUntil(NOW.plusDays(10));

        executor.apply(complaintAgainst(u, null), PenaltyAction.TEMP_BAN_7_DAYS, 0, "HARASSMENT", NOW);

        assertThat(u.getBannedUntil()).isEqualTo(NOW.plusDays(10));
    }

    @Test
    void permBanBlocksTheAccountAndRevokesSessionsOnlyAfterCommit() {
        User u = user(0);

        executor.apply(complaintAgainst(u, null), PenaltyAction.PERM_BAN, 0, "SCAM_FRAUD", NOW);

        assertThat(u.getAccountStatus()).isEqualTo(AccountStatus.BLOCKED);
        verify(listings).suspendAllActive(2L);
        verifyNoInteractions(revocation, restrictions);

        commit();
        verify(revocation).revokeAllAccess(u);
        verify(restrictions).invalidate(2L);
    }

    @Test
    void strikeDecayIsPersistedEvenWhenNoPenaltyApplies() {
        User u = user(3);

        executor.apply(complaintAgainst(u, null), PenaltyAction.NONE, 0, "NONE", NOW);

        assertThat(u.getWarningCount()).isZero();
        assertThat(u.getLastPenalizedAt()).isNull();
    }

    @Test
    void tempBanPublishesTemporaryBanEvent() {
        User u = user(0);

        executor.apply(complaintAgainst(u, null), PenaltyAction.TEMP_BAN_7_DAYS, 0, "SCAM", NOW);

        verify(events).publishEvent(new UserBannedEvent(2L, false));
    }

    @Test
    void permBanPublishesPermanentBanEvent() {
        User u = user(0);

        executor.apply(complaintAgainst(u, null), PenaltyAction.PERM_BAN, 0, "SCAM", NOW);

        verify(events).publishEvent(new UserBannedEvent(2L, true));
    }

    @Test
    void warningPublishesNoBanEvent() {
        User u = user(0);

        executor.apply(complaintAgainst(u, null), PenaltyAction.WARNING, 0, "SPAM", NOW);

        verifyNoInteractions(events);
    }

    @Test
    void badFaithComplainerIsBannedNotTheReportedUser() {
        User reported = user(0);
        User complainer = user(0);
        complainer.setId(1L);
        Complaint c = Complaint.builder().id("c-1").complainer(complainer).complainedUser(reported).build();

        LocalDateTime until = executor.applyToComplainer(c, PenaltyAction.TEMP_BAN_7_DAYS, 0, NOW);

        assertThat(until).isEqualTo(NOW.plusDays(7));
        assertThat(complainer.getBannedUntil()).isEqualTo(NOW.plusDays(7));
        assertThat(complainer.getRestrictionReason()).isEqualTo("MALICIOUS_REPORT");
        assertThat(reported.getBannedUntil()).isNull();
        verify(listings).suspendAllActive(1L);
        verify(events).publishEvent(new UserBannedEvent(1L, false));
    }

    @Test
    void badFaithComplainerCannotGetAWarning() {
        User complainer = user(0);
        Complaint c = Complaint.builder().id("c-1").complainer(complainer).complainedUser(user(0)).build();

        assertThatThrownBy(() -> executor.applyToComplainer(c, PenaltyAction.WARNING, 0, NOW))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(listings, events);
    }

    private static Complaint decided(User u, PenaltyAction penalty) {
        return Complaint.builder().id("c-1").complainedUser(u).penaltyAction(penalty).resolvedAt(NOW).build();
    }

    @Test
    void approvedWarningAppealTakesOneWarningBack() {
        User u = user(2);

        assertThat(executor.reverse(decided(u, PenaltyAction.WARNING), NOW.plusDays(1))).isTrue();

        assertThat(u.getWarningCount()).isEqualTo(1);
    }

    @Test
    void approvedTempBanAppealLiftsTheBanAndRestrictions() {
        User u = user(0);
        u.setBannedUntil(NOW.plusDays(7));
        u.setChatRestricted(true);
        u.setListingRestricted(true);
        u.setRestrictionReason("HARASSMENT");

        assertThat(executor.reverse(decided(u, PenaltyAction.TEMP_BAN_7_DAYS), NOW.plusDays(1))).isTrue();
        commit();

        assertThat(u.getBannedUntil()).isNull();
        assertThat(u.isChatRestricted()).isFalse();
        assertThat(u.isListingRestricted()).isFalse();
        assertThat(u.getRestrictionReason()).isNull();
        verify(restrictions).invalidate(2L);
        verify(listings, never()).suspendAllActive(any());
    }

    @Test
    void laterLongerBanIsNotLiftedByAnOlderAppeal() {
        User u = user(0);
        u.setBannedUntil(NOW.plusDays(12));
        u.setChatRestricted(true);

        assertThat(executor.reverse(decided(u, PenaltyAction.TEMP_BAN_7_DAYS), NOW.plusDays(1))).isFalse();

        assertThat(u.getBannedUntil()).isEqualTo(NOW.plusDays(12));
        assertThat(u.isChatRestricted()).isTrue();
    }

    @Test
    void permanentBanIsNeverReversed() {
        assertThatThrownBy(() -> executor.reverse(decided(user(0), PenaltyAction.PERM_BAN), NOW))
                .isInstanceOf(IllegalStateException.class);
    }
}
