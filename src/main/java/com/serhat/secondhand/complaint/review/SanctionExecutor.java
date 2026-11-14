package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.auth.application.AccessRevocationService;
import com.serhat.secondhand.chat.application.ChatRoomUpdater;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.chat.repository.MessageRepository;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.listing.application.common.ListingModerationService;
import com.serhat.secondhand.user.application.UserRestrictionService;
import com.serhat.secondhand.user.application.event.UserBannedEvent;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;

/**
 * Applies one ladder step to the reported user inside the review transaction. Session revocation for
 * a permanent ban runs only after commit. A ban publishes {@link UserBannedEvent}; the order module
 * cancels the seller's unshipped orders after commit (proposal section 5.2).
 */
@Component
@Slf4j
public class SanctionExecutor {

    static final int RESTRICTION_REASON_MAX = 255;

    private final ListingModerationService listingModerationService;
    private final AccessRevocationService accessRevocationService;
    private final ComplaintModerationProperties properties;
    private final TransactionTemplate requiresNew;
    private final UserRestrictionService userRestrictionService;
    private final ApplicationEventPublisher eventPublisher;
    private final MessageRepository messageRepository;
    private final ChatRoomUpdater chatRoomUpdater;

    public SanctionExecutor(ListingModerationService listingModerationService,
                            AccessRevocationService accessRevocationService,
                            ComplaintModerationProperties properties,
                            PlatformTransactionManager transactionManager,
                            UserRestrictionService userRestrictionService,
                            ApplicationEventPublisher eventPublisher,
                            MessageRepository messageRepository,
                            ChatRoomUpdater chatRoomUpdater) {
        this.messageRepository = messageRepository;
        this.chatRoomUpdater = chatRoomUpdater;
        this.userRestrictionService = userRestrictionService;
        this.eventPublisher = eventPublisher;
        this.listingModerationService = listingModerationService;
        this.accessRevocationService = accessRevocationService;
        this.properties = properties;
        this.requiresNew = new TransactionTemplate(transactionManager);
        this.requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    /** Sanctions the reported user. Returns the end of the restriction for a temporary ban, otherwise null. */
    public LocalDateTime apply(Complaint complaint, PenaltyAction penalty, int effectiveWarnings, String reason,
                               LocalDateTime now) {
        LocalDateTime bannedUntil = applyTo(complaint.getComplainedUser(), complaint, penalty, effectiveWarnings, reason, now);
        if (penalty != PenaltyAction.NONE) {
            setMessageRemoved(complaint, true, now);
        }
        return bannedUntil;
    }

    /**
     * Soft-redacts (or restores) the reported chat message. The row and its text stay in the database so
     * an appeal can still be reviewed from the original wording.
     */
    private void setMessageRemoved(Complaint complaint, boolean removed, LocalDateTime now) {
        Long messageId = complaint.getReportedMessageId();
        if (messageId == null) {
            return;
        }
        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            log.warn("Reported message {} of complaint {} no longer exists", messageId, complaint.getId());
            return;
        }
        message.setRemovedByModeration(removed);
        message.setRemovedAt(removed ? now : null);
        messageRepository.save(message);
        chatRoomUpdater.updateLastMessage(message.getChatRoomId());
    }

    /**
     * Sanctions the complainer of a bad-faith report (proposal section 5.3); only bans are allowed.
     * Returns the end of the restriction for a temporary ban, otherwise null.
     */
    public LocalDateTime applyToComplainer(Complaint complaint, PenaltyAction penalty, int effectiveWarnings,
                                           LocalDateTime now) {
        if (penalty != PenaltyAction.TEMP_BAN_7_DAYS && penalty != PenaltyAction.PERM_BAN) {
            throw new IllegalArgumentException("A bad-faith complainer gets a ban, not " + penalty);
        }
        return applyTo(complaint.getComplainer(), complaint, penalty, effectiveWarnings,
                com.serhat.secondhand.complaint.ViolationCategory.MALICIOUS_REPORT.name(), now);
    }

    private LocalDateTime applyTo(User user, Complaint complaint, PenaltyAction penalty, int effectiveWarnings,
                                  String reason, LocalDateTime now) {
        // Lazy strike decay (proposal section 8.3): persist the reset before counting this penalty.
        user.setWarningCount(effectiveWarnings);
        switch (penalty) {
            case NONE -> {
                return null;
            }
            case WARNING -> user.setWarningCount(effectiveWarnings + 1);
            case LISTING_SUSPENDED -> {
                if (complaint.getListing() == null) {
                    throw new IllegalStateException("LISTING_SUSPENDED needs a listing on complaint " + complaint.getId());
                }
                listingModerationService.suspend(complaint.getListing().getId());
            }
            case TEMP_BAN_7_DAYS -> {
                LocalDateTime until = now.plus(properties.getReview().getTempBanDuration());
                if (user.getBannedUntil() == null || user.getBannedUntil().isBefore(until)) {
                    user.setBannedUntil(until);
                }
                user.setChatRestricted(true);
                user.setListingRestricted(true);
                user.setRestrictionReason(truncate(reason));
                listingModerationService.suspendAllActive(user.getId());
            }
            case PERM_BAN -> {
                user.setAccountStatus(AccountStatus.BLOCKED);
                user.setChatRestricted(true);
                user.setListingRestricted(true);
                user.setRestrictionReason(truncate(reason));
                listingModerationService.suspendAllActive(user.getId());
                revokeAccessAfterCommit(user);
            }
        }
        user.setLastPenalizedAt(now);
        if (penalty == PenaltyAction.TEMP_BAN_7_DAYS || penalty == PenaltyAction.PERM_BAN) {
            invalidateRestrictionAfterCommit(user.getId());
            eventPublisher.publishEvent(new UserBannedEvent(user.getId(), penalty == PenaltyAction.PERM_BAN));
        }
        log.warn("Moderation penalty {} applied to user {} for complaint {}", penalty, user.getId(), complaint.getId());
        return penalty == PenaltyAction.TEMP_BAN_7_DAYS ? user.getBannedUntil() : null;
    }

    /**
     * Undoes the penalty of an approved appeal (proposal section 5.6). A warning is taken back; a
     * temporary ban is lifted unless a later ban extends past it. Listings taken down stay INACTIVE and
     * are republished by the seller (section 5.5). Returns false when nothing could be lifted.
     */
    public boolean reverse(Complaint complaint, LocalDateTime now) {
        User user = complaint.getComplainedUser();
        PenaltyAction penalty = complaint.getPenaltyAction();
        if (penalty == null || !penalty.isAppealable()) {
            throw new IllegalStateException("Penalty " + penalty + " of complaint " + complaint.getId() + " cannot be reversed");
        }
        boolean reversed = switch (penalty) {
            case WARNING -> {
                int count = user.getWarningCount() == null ? 0 : user.getWarningCount();
                user.setWarningCount(Math.max(0, count - 1));
                yield true;
            }
            case LISTING_SUSPENDED -> true;
            case TEMP_BAN_7_DAYS -> liftTempBan(user, complaint);
            default -> throw new IllegalStateException("unreachable");
        };
        setMessageRemoved(complaint, false, now);
        log.warn("Moderation penalty {} of complaint {} reversed on appeal for user {} (lifted={})",
                penalty, complaint.getId(), user.getId(), reversed);
        return reversed;
    }

    private boolean liftTempBan(User user, Complaint complaint) {
        if (user.getAccountStatus() == AccountStatus.BLOCKED) {
            log.warn("User {} is permanently banned; the appealed temporary ban of complaint {} is not lifted",
                    user.getId(), complaint.getId());
            return false;
        }
        LocalDateTime thisBanEnd = complaint.getResolvedAt().plus(properties.getReview().getTempBanDuration());
        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(thisBanEnd)) {
            log.warn("A later ban of user {} runs past the appealed one of complaint {}; it is kept",
                    user.getId(), complaint.getId());
            return false;
        }
        user.setBannedUntil(null);
        user.setChatRestricted(false);
        user.setListingRestricted(false);
        user.setRestrictionReason(null);
        invalidateRestrictionAfterCommit(user.getId());
        return true;
    }

    private void invalidateRestrictionAfterCommit(Long userId) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                userRestrictionService.invalidate(userId);
            }
        });
    }

    private void revokeAccessAfterCommit(User user) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    // afterCommit still sees the finished transaction; the token update needs its own.
                    requiresNew.executeWithoutResult(status -> accessRevocationService.revokeAllAccess(user));
                } catch (Exception e) {
                    log.error("Failed to revoke sessions of permanently banned user {}", user.getId(), e);
                }
            }
        });
    }

    private static String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= RESTRICTION_REASON_MAX ? value : value.substring(0, RESTRICTION_REASON_MAX);
    }
}
