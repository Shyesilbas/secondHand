package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.GenericEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class PaymentSuccessEmailEvent extends EmailEvent<GenericEmailData> {
    public PaymentSuccessEmailEvent(User recipient, String subject, GenericEmailData data) {
        super(recipient, subject, EmailType.PAYMENT_RECEIPT, EmailPriority.HIGH, data);
    }

    @Override
    public String getTemplatePath() {
        return "payments/receipt.html";
    }
}
