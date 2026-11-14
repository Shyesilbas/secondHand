package com.serhat.secondhand.complaint;

import com.serhat.secondhand.complaint.application.ComplaintEmailNotifier;
import com.serhat.secondhand.complaint.application.ComplaintEmailNotifier.SanctionDetails;
import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.model.ModerationAppealOutcomeEmailData;
import com.serhat.secondhand.email.application.event.model.ModerationSanctionEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ComplaintEmailNotifierTest {

    private final EmailEventPublisher publisher = mock(EmailEventPublisher.class);
    private final ComplaintEmailNotifier notifier = new ComplaintEmailNotifier(publisher, new EmailConfig());

    private static User user() {
        User u = new User();
        u.setId(5L);
        u.setName("Ayse");
        u.setEmail("ayse@example.com");
        return u;
    }

    @SuppressWarnings("unchecked")
    private EmailEvent<Object> published() {
        ArgumentCaptor<EmailEvent<Object>> captor = ArgumentCaptor.forClass(EmailEvent.class);
        verify(publisher).publish(captor.capture());
        return captor.getValue();
    }

    private static SanctionDetails details() {
        return new SanctionDetails("c-1", ViolationCategory.HARASSMENT, "note", "Bisiklet",
                LocalDateTime.of(2026, 11, 20, 18, 30), 2, 3, LocalDateTime.of(2026, 11, 20, 18, 30));
    }

    @Test
    void submittedEmailUsesItsTemplateAndFormatsReviewTime() {
        notifier.sendSubmitted(user(), "c-1", "N S", "SPAM", LocalDateTime.of(2026, 11, 13, 14, 5));

        EmailEvent<Object> event = published();
        assertThat(event.getType()).isEqualTo(EmailType.COMPLAINT_SUBMITTED);
        assertThat(event.getTemplatePath()).isEqualTo("moderation/complaint-submitted.html");
        assertThat(event.getData()).hasFieldOrPropertyWithValue("eligibleAt", "13.11.2026 14:05");
    }

    @ParameterizedTest
    @CsvSource({
            "RESOLVED, COMPLAINT_RESOLVED, moderation/complaint-resolved.html",
            "DISMISSED, COMPLAINT_DISMISSED, moderation/complaint-dismissed.html"
    })
    void outcomeEmailFollowsStatus(ComplaintStatus status, EmailType type, String template) {
        notifier.sendOutcome(user(), "c-1", status, "N S", "notes", LocalDateTime.now());

        EmailEvent<Object> event = published();
        assertThat(event.getType()).isEqualTo(type);
        assertThat(event.getTemplatePath()).isEqualTo(template);
    }

    @Test
    void openStatusHasNoOutcomeEmail() {
        assertThatThrownBy(() -> notifier.sendOutcome(user(), "c-1", ComplaintStatus.PENDING, "N S", null, null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(publisher);
    }

    @ParameterizedTest
    @CsvSource({
            "WARNING, MODERATION_WARNING, moderation/user-warning.html",
            "LISTING_SUSPENDED, MODERATION_LISTING_SUSPENDED, moderation/listing-suspended.html",
            "TEMP_BAN_7_DAYS, MODERATION_TEMP_BAN, moderation/temp-ban.html",
            "PERM_BAN, MODERATION_PERM_BAN, moderation/perm-ban.html"
    })
    void eachSanctionStepHasItsOwnEmail(PenaltyAction action, EmailType type, String template) {
        notifier.sendSanction(user(), action, details());

        EmailEvent<Object> event = published();
        assertThat(event.getType()).isEqualTo(type);
        assertThat(event.getTemplatePath()).isEqualTo(template);
        ModerationSanctionEmailData data = (ModerationSanctionEmailData) event.getData();
        assertThat(data.getViolationLabel()).isEqualTo("Taciz / hakaret");
        assertThat(data.getBannedUntil()).isEqualTo("20.11.2026 18:30");
    }

    @Test
    void noPenaltySendsNoSanctionEmail() {
        notifier.sendSanction(user(), PenaltyAction.NONE, details());
        verify(publisher, never()).publish(any());
    }

    @Test
    void rejectedAppealNeverClaimsPenaltyReversed() {
        notifier.sendAppealOutcome(user(), "c-1", AppealStatus.REJECTED, true, "explanation");

        ModerationAppealOutcomeEmailData data = (ModerationAppealOutcomeEmailData) published().getData();
        assertThat(data.isApproved()).isFalse();
        assertThat(data.isPenaltyReversed()).isFalse();
    }

    @Test
    void pendingAppealHasNoEmail() {
        assertThatThrownBy(() -> notifier.sendAppealOutcome(user(), "c-1", AppealStatus.PENDING, false, null))
                .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(publisher);
    }
}
