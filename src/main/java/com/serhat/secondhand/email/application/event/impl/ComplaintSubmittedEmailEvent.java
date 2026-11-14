package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.ComplaintSubmittedEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class ComplaintSubmittedEmailEvent extends EmailEvent<ComplaintSubmittedEmailData> {
    public ComplaintSubmittedEmailEvent(User recipient, String subject, ComplaintSubmittedEmailData data) {
        super(recipient, subject, EmailType.COMPLAINT_SUBMITTED, EmailPriority.LOW, data);
    }

    @Override
    public String getTemplatePath() {
        return "moderation/complaint-submitted.html";
    }
}
