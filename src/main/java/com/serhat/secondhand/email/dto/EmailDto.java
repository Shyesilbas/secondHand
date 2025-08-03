package com.serhat.secondhand.email.dto;

import com.serhat.secondhand.email.domain.entity.enums.EmailType;

import java.time.LocalDateTime;

public record EmailDto(
        String recipientEmail,
        String senderEmail,
        String subject,
        String content,
        EmailType emailType,
        LocalDateTime sentAt
) {
}
