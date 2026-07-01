package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class WelcomeEmailEvent extends EmailEvent<GenericEmailData> {
    public WelcomeEmailEvent(User recipient, String subject, GenericEmailData data) {
        super(recipient, subject, EmailType.WELCOME, EmailPriority.NORMAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "notifications/welcome.html";
    }
}
