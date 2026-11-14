package com.serhat.secondhand.complaint.application;

import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.PenaltyAction;
import com.serhat.secondhand.complaint.ViolationCategory;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.ComplaintOutcomeEmailEvent;
import com.serhat.secondhand.email.application.event.impl.ComplaintSubmittedEmailEvent;
import com.serhat.secondhand.email.application.event.impl.ModerationAppealOutcomeEmailEvent;
import com.serhat.secondhand.email.application.event.impl.ModerationSanctionEmailEvent;
import com.serhat.secondhand.email.application.event.model.ComplaintOutcomeEmailData;
import com.serhat.secondhand.email.application.event.model.ComplaintSubmittedEmailData;
import com.serhat.secondhand.email.application.event.model.ModerationAppealOutcomeEmailData;
import com.serhat.secondhand.email.application.event.model.ModerationSanctionEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;

/**
 * Builds and publishes the moderation emails listed in the Aura proposal (section 7.1).
 * Callers must invoke it after the owning transaction commits.
 */
@Component
@RequiredArgsConstructor
public class ComplaintEmailNotifier {

    static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private static final Map<ViolationCategory, String> VIOLATION_LABELS = new EnumMap<>(Map.of(
            ViolationCategory.HARASSMENT, "Taciz / hakaret",
            ViolationCategory.OFF_PLATFORM_TRADING, "Platform dışı işlem teklifi",
            ViolationCategory.SCAM_FRAUD, "Dolandırıcılık",
            ViolationCategory.INAPPROPRIATE_CONTENT, "Uygunsuz içerik",
            ViolationCategory.FALSE_ADVERTISING, "Yanıltıcı ilan",
            ViolationCategory.NONE, "İhlal yok",
            ViolationCategory.MALICIOUS_REPORT, "Kötü niyetli şikayet"
    ));

    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;

    public void sendSubmitted(User complainer, String complaintId, String targetLabel,
                              String reason, LocalDateTime eligibleForReviewAt) {
        ComplaintSubmittedEmailData data = ComplaintSubmittedEmailData.builder()
                .userName(complainer.getName())
                .complaintId(complaintId)
                .targetLabel(targetLabel)
                .reason(reason)
                .eligibleAt(format(eligibleForReviewAt))
                .build();
        emailEventPublisher.publish(new ComplaintSubmittedEmailEvent(
                complainer, emailConfig.getModeration().getComplaintSubmittedSubject(), data));
    }

    /** Only closed outcomes ({@code RESOLVED}, {@code DISMISSED}) produce an email. */
    public void sendOutcome(User complainer, String complaintId, ComplaintStatus status, String targetLabel,
                            String adminNotes, LocalDateTime resolvedAt) {
        ComplaintOutcomeEmailData data = ComplaintOutcomeEmailData.builder()
                .userName(complainer.getName())
                .complaintId(complaintId)
                .targetLabel(targetLabel)
                .adminNotes(adminNotes)
                .resolvedAt(format(resolvedAt))
                .build();
        EmailConfig.Moderation subjects = emailConfig.getModeration();
        ComplaintOutcomeEmailEvent event = switch (status) {
            case RESOLVED -> ComplaintOutcomeEmailEvent.resolved(complainer, subjects.getComplaintResolvedSubject(), data);
            case DISMISSED -> ComplaintOutcomeEmailEvent.dismissed(complainer, subjects.getComplaintDismissedSubject(), data);
            case PENDING, INVESTIGATING ->
                    throw new IllegalArgumentException("No outcome email for open complaint status " + status);
        };
        emailEventPublisher.publish(event);
    }

    /** {@link PenaltyAction#NONE} sends nothing; every other ladder step has its own template. */
    public void sendSanction(User penalizedUser, PenaltyAction action, SanctionDetails details) {
        if (action == PenaltyAction.NONE) {
            return;
        }
        ModerationSanctionEmailData data = ModerationSanctionEmailData.builder()
                .userName(penalizedUser.getName())
                .complaintId(details.complaintId())
                .violationLabel(details.violationCategory() == null ? null : VIOLATION_LABELS.get(details.violationCategory()))
                .adminNotes(details.adminNotes())
                .listingTitle(details.listingTitle())
                .bannedUntil(format(details.bannedUntil()))
                .warningCount(details.warningCount())
                .warningThreshold(details.warningThreshold())
                .appealDeadline(format(details.appealDeadline()))
                .build();
        EmailConfig.Moderation subjects = emailConfig.getModeration();
        ModerationSanctionEmailEvent event = switch (action) {
            case WARNING -> ModerationSanctionEmailEvent.warning(penalizedUser, subjects.getWarningSubject(), data);
            case LISTING_SUSPENDED ->
                    ModerationSanctionEmailEvent.listingSuspended(penalizedUser, subjects.getListingSuspendedSubject(), data);
            case TEMP_BAN_7_DAYS -> ModerationSanctionEmailEvent.tempBan(penalizedUser, subjects.getTempBanSubject(), data);
            case PERM_BAN -> ModerationSanctionEmailEvent.permBan(penalizedUser, subjects.getPermBanSubject(), data);
            case NONE -> throw new IllegalStateException("unreachable");
        };
        emailEventPublisher.publish(event);
    }

    /** Only decided appeals ({@code APPROVED}, {@code REJECTED}) produce an email. */
    public void sendAppealOutcome(User appellant, String complaintId, AppealStatus appealStatus,
                                  boolean penaltyReversed, String explanation) {
        boolean approved = switch (appealStatus) {
            case APPROVED -> true;
            case REJECTED -> false;
            case NONE, PENDING ->
                    throw new IllegalArgumentException("No appeal email for undecided appeal status " + appealStatus);
        };
        ModerationAppealOutcomeEmailData data = ModerationAppealOutcomeEmailData.builder()
                .userName(appellant.getName())
                .complaintId(complaintId)
                .approved(approved)
                .penaltyReversed(approved && penaltyReversed)
                .explanation(explanation)
                .build();
        emailEventPublisher.publish(new ModerationAppealOutcomeEmailEvent(
                appellant, emailConfig.getModeration().getAppealOutcomeSubject(), data));
    }

    private static String format(LocalDateTime value) {
        return value == null ? null : value.format(DATE_TIME);
    }

    public record SanctionDetails(
            String complaintId,
            ViolationCategory violationCategory,
            String adminNotes,
            String listingTitle,
            LocalDateTime bannedUntil,
            Integer warningCount,
            Integer warningThreshold,
            LocalDateTime appealDeadline
    ) {
    }
}
