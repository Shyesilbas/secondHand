package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class VerificationCodeEmailEvent extends EmailEvent<GenericEmailData> {
    public VerificationCodeEmailEvent(User recipient, String subject, GenericEmailData data) {
        super(recipient, subject, EmailType.VERIFICATION_CODE, EmailPriority.CRITICAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "notifications/verification-code.html";
    }
}
