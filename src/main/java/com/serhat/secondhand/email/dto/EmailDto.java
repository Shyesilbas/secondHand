package com.serhat.secondhand.email.dto;

import com.serhat.secondhand.email.domain.entity.enums.EmailType;

import java.time.LocalDateTime;
import java.util.UUID;

public record EmailDto(
        UUID id,
        String recipientEmail,
        String senderEmail,
        String subject,
        String content,
        EmailType emailType,
        LocalDateTime sentAt
) {
}
