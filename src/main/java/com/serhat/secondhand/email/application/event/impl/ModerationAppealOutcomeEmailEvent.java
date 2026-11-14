package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.ModerationAppealOutcomeEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class ModerationAppealOutcomeEmailEvent extends EmailEvent<ModerationAppealOutcomeEmailData> {
    public ModerationAppealOutcomeEmailEvent(User recipient, String subject, ModerationAppealOutcomeEmailData data) {
        super(recipient, subject, EmailType.MODERATION_APPEAL_OUTCOME, EmailPriority.HIGH, data);
    }

    @Override
    public String getTemplatePath() {
        return "moderation/appeal-outcome.html";
    }
}
