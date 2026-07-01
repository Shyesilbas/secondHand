package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.OrderConfirmationEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class OrderConfirmationEmailEvent extends EmailEvent<OrderConfirmationEmailData> {
    public OrderConfirmationEmailEvent(User recipient, String subject, OrderConfirmationEmailData data) {
        super(recipient, subject, EmailType.ORDER_CONFIRMATION, EmailPriority.HIGH, data);
    }

    @Override
    public String getTemplatePath() {
        return "orders/confirmation.html";
    }
}
