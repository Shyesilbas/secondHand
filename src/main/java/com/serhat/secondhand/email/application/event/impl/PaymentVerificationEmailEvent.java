package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class PaymentVerificationEmailEvent extends EmailEvent<GenericEmailData> {
    public PaymentVerificationEmailEvent(User recipient, String subject, GenericEmailData data) {
        super(recipient, subject, EmailType.PAYMENT_VERIFICATION, EmailPriority.CRITICAL, data);
    }

    @Override
    public String getTemplatePath() {
        return "payments/verification.html";
    }
}
