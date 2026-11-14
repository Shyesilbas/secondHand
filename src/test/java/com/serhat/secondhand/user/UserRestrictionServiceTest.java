package com.serhat.secondhand.user;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.RestrictedAction;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository.RestrictionState;
import com.serhat.secondhand.user.util.RestrictionErrorCodes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserRestrictionServiceTest {

    private static final long USER = 9L;
    private static final String KEY = "v4:user:restriction:9";

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    @SuppressWarnings("unchecked")
    private final ValueOperations<String, String> values = mock(ValueOperations.class);
    private final UserRepository users = mock(UserRepository.class);
    private final UserRestrictionService service = new UserRestrictionService(redis, users);

    UserRestrictionServiceTest() {
        when(redis.opsForValue()).thenReturn(values);
    }

    private void dbState(AccountStatus status, LocalDateTime until, boolean chat, boolean listing) {
        RestrictionState state = mock(RestrictionState.class);
        when(state.getAccountStatus()).thenReturn(status);
        when(state.getBannedUntil()).thenReturn(until);
        when(state.isChatRestricted()).thenReturn(chat);
        when(state.isListingRestricted()).thenReturn(listing);
        when(users.findRestrictionStateById(USER)).thenReturn(Optional.of(state));
    }

    private void tempBanned() {
        dbState(AccountStatus.ACTIVE, LocalDateTime.now().plusDays(3), true, true);
    }

    @ParameterizedTest
    @EnumSource(RestrictedAction.class)
    void temporaryBanBlocksEveryRestrictedAction(RestrictedAction action) {
        tempBanned();
        assertThat(service.check(USER, action).isError()).isTrue();
    }

    @Test
    void errorCodeNamesTheBlockedAction() {
        tempBanned();
        assertThat(service.check(USER, RestrictedAction.CHECKOUT).getErrorCode())
                .isEqualTo(RestrictionErrorCodes.ACCOUNT_RESTRICTED_CHECKOUT.getCode());
        assertThatThrownBy(() -> service.require(USER, RestrictedAction.SEND_MESSAGE))
                .isInstanceOf(BusinessException.class);
    }

    @ParameterizedTest
    @EnumSource(RestrictedAction.class)
    void expiredBanWithLeftoverFlagsBlocksNothing(RestrictedAction action) {
        dbState(AccountStatus.ACTIVE, LocalDateTime.now().minusMinutes(1), true, true);
        assertThat(service.check(USER, action).isSuccess()).isTrue();
    }

    @Test
    void blockedAccountIsRestrictedWithoutAnEndDate() {
        dbState(AccountStatus.BLOCKED, null, false, false);
        assertThat(service.check(USER, RestrictedAction.SEND_MESSAGE).isError()).isTrue();
    }

    @Test
    void cleanUserIsCachedAsUnrestrictedForTenMinutes() {
        dbState(AccountStatus.ACTIVE, null, false, false);

        assertThat(service.check(USER, RestrictedAction.MAKE_OFFER).isSuccess()).isTrue();
        verify(values).set(KEY, "none", Duration.ofMinutes(10));
    }

    @Test
    void banIsCachedUntilItEnds() {
        tempBanned();

        service.check(USER, RestrictedAction.MAKE_OFFER);

        verify(values).set(eq(KEY), startsWith("0|"), argThat((Duration ttl) ->
                ttl.compareTo(Duration.ofDays(2)) > 0 && ttl.compareTo(Duration.ofDays(3)) <= 0));
    }

    @Test
    void cachedBanIsUsedWithoutTouchingPostgres() {
        long until = java.time.ZonedDateTime.now().plusDays(1).toInstant().toEpochMilli();
        when(values.get(KEY)).thenReturn("0|" + until + "|1|1");

        assertThat(service.check(USER, RestrictedAction.SEND_MESSAGE).isError()).isTrue();
        verifyNoInteractions(users);
    }

    @Test
    void redisOutageFallsBackToPostgresInsteadOfLettingTheUserThrough() {
        when(values.get(KEY)).thenThrow(new RedisConnectionFailureException("down"));
        tempBanned();

        assertThat(service.check(USER, RestrictedAction.CREATE_LISTING).isError()).isTrue();
    }

    @Test
    void corruptCacheEntryIsIgnoredAndReloaded() {
        when(values.get(KEY)).thenReturn("garbage");
        tempBanned();

        assertThat(service.check(USER, RestrictedAction.CREATE_LISTING).isError()).isTrue();
    }

    @Test
    void invalidateDeletesTheEntry() {
        service.invalidate(USER);
        verify(redis).delete(KEY);
    }

    @Test
    void statusDescribesATemporaryBan() {
        LocalDateTime until = LocalDateTime.now().plusDays(3);
        dbState(AccountStatus.ACTIVE, until, true, false);

        var status = service.status(USER);

        assertThat(status.restricted()).isTrue();
        assertThat(status.permanent()).isFalse();
        assertThat(status.bannedUntil()).isEqualTo(until);
        assertThat(status.canSendMessages()).isFalse();
        assertThat(status.canCreateListings()).isTrue();
        assertThat(status.canCheckout()).isFalse();
    }

    @Test
    void statusOfAnExpiredBanIsUnrestricted() {
        dbState(AccountStatus.ACTIVE, LocalDateTime.now().minusDays(1), true, true);

        var status = service.status(USER);

        assertThat(status.restricted()).isFalse();
        assertThat(status.bannedUntil()).isNull();
        assertThat(status.canSendMessages()).isTrue();
    }
}
