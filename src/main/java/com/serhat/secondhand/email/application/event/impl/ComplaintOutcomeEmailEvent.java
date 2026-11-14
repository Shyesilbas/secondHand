package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.ComplaintOutcomeEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

/** Sent to the complainer once Aura closes the complaint; use {@link #resolved} or {@link #dismissed}. */
public class ComplaintOutcomeEmailEvent extends EmailEvent<ComplaintOutcomeEmailData> {

    private final String templatePath;

    private ComplaintOutcomeEmailEvent(User recipient, String subject, EmailType type, EmailPriority priority,
                                       String templatePath, ComplaintOutcomeEmailData data) {
        super(recipient, subject, type, priority, data);
        this.templatePath = templatePath;
    }

    public static ComplaintOutcomeEmailEvent resolved(User recipient, String subject, ComplaintOutcomeEmailData data) {
        return new ComplaintOutcomeEmailEvent(recipient, subject, EmailType.COMPLAINT_RESOLVED, EmailPriority.HIGH,
                "moderation/complaint-resolved.html", data);
    }

    public static ComplaintOutcomeEmailEvent dismissed(User recipient, String subject, ComplaintOutcomeEmailData data) {
        return new ComplaintOutcomeEmailEvent(recipient, subject, EmailType.COMPLAINT_DISMISSED, EmailPriority.NORMAL,
                "moderation/complaint-dismissed.html", data);
    }

    @Override
    public String getTemplatePath() {
        return templatePath;
    }
}
