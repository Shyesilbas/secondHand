package com.serhat.secondhand.user.application.event;

/**
 * Published inside the transaction that bans a user (temporary or permanent). Listeners run after
 * commit, so a rolled-back sanction triggers nothing.
 */
public record UserBannedEvent(Long userId, boolean permanent) {
}
