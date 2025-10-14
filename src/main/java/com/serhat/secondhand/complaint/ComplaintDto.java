package com.serhat.secondhand.complaint;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.UUID;

public record ComplaintDto(
        String complaintId,
        String complainerId,
        String complainedUserId,
        UUID listingId,
        String listingTitle,
        String reason,
        String description,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime updatedAt,
        @JsonFormat(pattern = "dd/MM/yyyy")
        LocalDateTime resolvedAt
) {
}
