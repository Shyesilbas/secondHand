package com.serhat.secondhand.email.application.event.impl;

import com.serhat.secondhand.email.application.event.EmailEvent;
import com.serhat.secondhand.email.application.event.model.ModerationSanctionEmailData;
import com.serhat.secondhand.email.domain.entity.enums.EmailPriority;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;

/** Sent to the penalized user; one factory per sanction ladder step. */
public class ModerationSanctionEmailEvent extends EmailEvent<ModerationSanctionEmailData> {

    private final String templatePath;

    private ModerationSanctionEmailEvent(User recipient, String subject, EmailType type,
                                         String templatePath, ModerationSanctionEmailData data) {
        super(recipient, subject, type, EmailPriority.HIGH, data);
        this.templatePath = templatePath;
    }

    public static ModerationSanctionEmailEvent warning(User recipient, String subject, ModerationSanctionEmailData data) {
        return new ModerationSanctionEmailEvent(recipient, subject, EmailType.MODERATION_WARNING,
                "moderation/user-warning.html", data);
    }

    public static ModerationSanctionEmailEvent listingSuspended(User recipient, String subject, ModerationSanctionEmailData data) {
        return new ModerationSanctionEmailEvent(recipient, subject, EmailType.MODERATION_LISTING_SUSPENDED,
                "moderation/listing-suspended.html", data);
    }

    public static ModerationSanctionEmailEvent tempBan(User recipient, String subject, ModerationSanctionEmailData data) {
        return new ModerationSanctionEmailEvent(recipient, subject, EmailType.MODERATION_TEMP_BAN,
                "moderation/temp-ban.html", data);
    }

    public static ModerationSanctionEmailEvent permBan(User recipient, String subject, ModerationSanctionEmailData data) {
        return new ModerationSanctionEmailEvent(recipient, subject, EmailType.MODERATION_PERM_BAN,
                "moderation/perm-ban.html", data);
    }

    @Override
    public String getTemplatePath() {
        return templatePath;
    }
}
