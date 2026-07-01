package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.MembershipUpgradeEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

public class MembershipUpgradeEmailEvent extends EmailEvent<MembershipUpgradeEmailData> {
    public MembershipUpgradeEmailEvent(User recipient, String subject, MembershipUpgradeEmailData data) {
        super(recipient, subject, EmailType.MEMBERSHIP_ACTIVATED, EmailPriority.HIGH, data);
    }

    @Override
    public String getTemplatePath() {
        return "system/membership.html";
    }
}
