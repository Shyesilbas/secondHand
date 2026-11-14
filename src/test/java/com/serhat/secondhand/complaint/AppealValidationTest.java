package com.serhat.secondhand.complaint;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.complaint.validator.ComplaintValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class AppealValidationTest {

    private static final LocalDateTime DECIDED = LocalDateTime.of(2026, 11, 10, 12, 0);

    private final ComplaintValidator validator = new ComplaintValidator(mock(ComplaintRepository.class),
            mock(ChatAuthorizationService.class), new ComplaintModerationProperties());

    private static Complaint decided(PenaltyAction penalty, AppealStatus appeal) {
        User complainer = new User();
        complainer.setId(1L);
        User reported = new User();
        reported.setId(2L);
        return Complaint.builder().id("c-1").complainer(complainer).complainedUser(reported)
                .status(ComplaintStatus.RESOLVED).penaltyAction(penalty).resolvedAt(DECIDED)
                .appealStatus(appeal).build();
    }

    private static String code(Result<Void> r) {
        return r.isError() ? r.getErrorCode() : null;
    }

    @Test
    void penalizedUserMayAppealWithinTheWindow() {
        assertThat(validator.validateAppeal(decided(PenaltyAction.WARNING, AppealStatus.NONE), 2L,
                DECIDED.plusDays(6)).isSuccess()).isTrue();
    }

    @Test
    void complainerCannotAppeal() {
        assertThat(code(validator.validateAppeal(decided(PenaltyAction.WARNING, AppealStatus.NONE), 1L, DECIDED)))
                .isEqualTo(ComplaintErrorCodes.APPEAL_NOT_ALLOWED.getCode());
    }

    @Test
    void permanentBanIsFinal() {
        assertThat(code(validator.validateAppeal(decided(PenaltyAction.PERM_BAN, AppealStatus.NONE), 2L, DECIDED)))
                .isEqualTo(ComplaintErrorCodes.APPEAL_NOT_APPEALABLE.getCode());
    }

    @Test
    void dismissedComplaintHasNothingToAppeal() {
        Complaint c = decided(PenaltyAction.NONE, AppealStatus.NONE);
        c.setStatus(ComplaintStatus.DISMISSED);
        assertThat(code(validator.validateAppeal(c, 2L, DECIDED)))
                .isEqualTo(ComplaintErrorCodes.APPEAL_NOT_APPEALABLE.getCode());
    }

    @Test
    void onlyOneAppeal() {
        assertThat(code(validator.validateAppeal(decided(PenaltyAction.TEMP_BAN_7_DAYS, AppealStatus.REJECTED), 2L, DECIDED)))
                .isEqualTo(ComplaintErrorCodes.APPEAL_ALREADY_SUBMITTED.getCode());
    }

    @Test
    void lateAppealIsRefused() {
        assertThat(code(validator.validateAppeal(decided(PenaltyAction.LISTING_SUSPENDED, AppealStatus.NONE), 2L,
                DECIDED.plusDays(7).plusMinutes(1))))
                .isEqualTo(ComplaintErrorCodes.APPEAL_WINDOW_CLOSED.getCode());
    }
}
