package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.NewListingEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class NewListingEmailEvent extends EmailEvent<NewListingEmailData> {
    public NewListingEmailEvent(User recipient, String subject, NewListingEmailData data) {
        super(recipient, subject, EmailType.NEW_LISTING_NOTIFICATION, EmailPriority.NORMAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "notifications/new-listing.html";
    }
}
