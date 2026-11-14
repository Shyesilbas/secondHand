package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.RestrictedAction;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository.RestrictionState;
import com.serhat.secondhand.user.util.RestrictionErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Moderation restrictions on the hot path (proposal section 8.1). PostgreSQL ({@code users}) is the source
 * of truth; {@link #KEY_PREFIX} caches each user's state: a restricted entry lives until the ban ends,
 * an unrestricted one for {@link #UNRESTRICTED_TTL}. Sanctions call {@link #invalidate} after commit.
 * A cache miss or a Redis outage reads PostgreSQL, so a lost key never lifts a ban.
 *
 * <p>A ban is active while the account is {@code BLOCKED} or {@code bannedUntil} is in the future;
 * leftover flags after a temporary ban ends have no effect, so nothing has to clear them.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserRestrictionService {

    public static final String KEY_PREFIX = "v4:user:restriction:";
    static final Duration UNRESTRICTED_TTL = Duration.ofMinutes(10);
    static final String UNRESTRICTED = "none";

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    /** Current restriction snapshot; {@code bannedUntil} is null for a permanent ban. */
    public record Restriction(boolean blocked, LocalDateTime bannedUntil, boolean chat, boolean listing) {
        static final Restriction NONE = new Restriction(false, null, false, false);

        boolean active(LocalDateTime now) {
            return blocked || (bannedUntil != null && bannedUntil.isAfter(now));
        }

        boolean blocks(RestrictedAction action, LocalDateTime now) {
            if (!active(now)) {
                return false;
            }
            return switch (action) {
                case SEND_MESSAGE -> blocked || chat;
                case CREATE_LISTING -> blocked || listing;
                case MAKE_OFFER, CHECKOUT -> true;
            };
        }
    }

    public Result<Void> check(Long userId, RestrictedAction action) {
        Restriction restriction = current(userId);
        if (restriction.blocks(action, LocalDateTime.now())) {
            log.info("Restricted user {} blocked from {}", userId, action);
            return Result.error(errorFor(action));
        }
        return Result.success();
    }

    public com.serhat.secondhand.user.dto.RestrictionStatusDto status(Long userId) {
        Restriction r = current(userId);
        LocalDateTime now = LocalDateTime.now();
        boolean active = r.active(now);
        return new com.serhat.secondhand.user.dto.RestrictionStatusDto(
                active,
                r.blocked(),
                active && !r.blocked() ? r.bannedUntil() : null,
                !r.blocks(RestrictedAction.SEND_MESSAGE, now),
                !r.blocks(RestrictedAction.CREATE_LISTING, now),
                !r.blocks(RestrictedAction.MAKE_OFFER, now),
                !r.blocks(RestrictedAction.CHECKOUT, now));
    }

    /** Throwing variant for services that signal errors with exceptions. */
    public void require(Long userId, RestrictedAction action) {
        Result<Void> result = check(userId, action);
        if (result.isError()) {
            throw new BusinessException(errorFor(action));
        }
    }

    /** Drops the cached state; call after a sanction or reversal commits. */
    public void invalidate(Long userId) {
        try {
            redisTemplate.delete(KEY_PREFIX + userId);
        } catch (DataAccessException e) {
            // Worst case the old unrestricted entry stays for UNRESTRICTED_TTL.
            log.error("Failed to invalidate restriction cache for user {}", userId, e);
        }
    }

    Restriction current(Long userId) {
        String key = KEY_PREFIX + userId;
        try {
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                return decode(cached);
            }
        } catch (DataAccessException e) {
            log.warn("Restriction cache unavailable for user {}, reading PostgreSQL", userId);
            return load(userId);
        } catch (IllegalArgumentException e) {
            log.warn("Unreadable restriction cache entry for user {}, reading PostgreSQL", userId);
        }
        Restriction restriction = load(userId);
        store(key, restriction);
        return restriction;
    }

    private Restriction load(Long userId) {
        return userRepository.findRestrictionStateById(userId)
                .map(UserRestrictionService::fromState)
                .orElse(Restriction.NONE);
    }

    private static Restriction fromState(RestrictionState s) {
        return new Restriction(s.getAccountStatus() == AccountStatus.BLOCKED, s.getBannedUntil(),
                s.isChatRestricted(), s.isListingRestricted());
    }

    private void store(String key, Restriction restriction) {
        LocalDateTime now = LocalDateTime.now();
        Duration ttl;
        String value;
        if (!restriction.active(now)) {
            ttl = UNRESTRICTED_TTL;
            value = UNRESTRICTED;
        } else {
            ttl = restriction.blocked() ? UNRESTRICTED_TTL : Duration.between(now, restriction.bannedUntil());
            value = encode(restriction);
        }
        try {
            redisTemplate.opsForValue().set(key, value, ttl);
        } catch (DataAccessException e) {
            log.warn("Failed to cache restriction state under {}", key);
        }
    }

    static String encode(Restriction r) {
        long until = r.bannedUntil() == null ? 0 : r.bannedUntil().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
        return (r.blocked() ? "1" : "0") + "|" + until + "|" + (r.chat() ? "1" : "0") + "|" + (r.listing() ? "1" : "0");
    }

    static Restriction decode(String value) {
        if (UNRESTRICTED.equals(value)) {
            return Restriction.NONE;
        }
        String[] parts = value.split("\\|");
        if (parts.length != 4) {
            throw new IllegalArgumentException("bad restriction entry");
        }
        long until = Long.parseLong(parts[1]);
        LocalDateTime bannedUntil = until == 0 ? null
                : LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(until), ZoneId.systemDefault());
        return new Restriction("1".equals(parts[0]), bannedUntil, "1".equals(parts[2]), "1".equals(parts[3]));
    }

    private static RestrictionErrorCodes errorFor(RestrictedAction action) {
        return switch (action) {
            case SEND_MESSAGE -> RestrictionErrorCodes.ACCOUNT_RESTRICTED_CHAT;
            case CREATE_LISTING -> RestrictionErrorCodes.ACCOUNT_RESTRICTED_LISTING;
            case MAKE_OFFER -> RestrictionErrorCodes.ACCOUNT_RESTRICTED_OFFER;
            case CHECKOUT -> RestrictionErrorCodes.ACCOUNT_RESTRICTED_CHECKOUT;
        };
    }
}
