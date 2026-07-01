package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.OrderConfirmationEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class SaleNotificationEmailEvent extends EmailEvent<OrderConfirmationEmailData> {
    public SaleNotificationEmailEvent(User recipient, String subject, OrderConfirmationEmailData data) {
        super(recipient, subject, EmailType.NOTIFICATION, EmailPriority.HIGH, data);
    }

    @Override
    public String getTemplatePath() {
        return "orders/sale-notification.html";
    }
}
