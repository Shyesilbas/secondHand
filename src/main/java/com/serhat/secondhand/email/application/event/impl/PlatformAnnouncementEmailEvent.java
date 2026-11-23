package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class PlatformAnnouncementEmailEvent extends EmailEvent<GenericEmailData> {
    public PlatformAnnouncementEmailEvent(User recipient, String subject, GenericEmailData data) {
        super(recipient, subject, EmailType.PLATFORM_ANNOUNCEMENT, EmailPriority.NORMAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "notifications/platform-announcement.html";
    }
}
