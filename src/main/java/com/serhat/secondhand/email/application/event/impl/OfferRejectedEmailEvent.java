package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.OfferEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class OfferRejectedEmailEvent extends EmailEvent<OfferEmailData> {
    public OfferRejectedEmailEvent(User recipient, String subject, OfferEmailData data) {
        super(recipient, subject, EmailType.OFFER_REJECTED, EmailPriority.NORMAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "offers/rejected.html";
    }
}
