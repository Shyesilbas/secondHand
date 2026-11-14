package com.serhat.secondhand.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ComplaintRequest(
        Long complainedUserId,
        UUID listingId,
        Long chatRoomId,
        Long reportedMessageId,
        @NotBlank
        @Size(max = 255)
        String reason,
        @Size(max = 1000)
        String description,
        List<String> evidenceImageUrls
) {
    public List<String> evidenceImageUrlsOrEmpty() {
        return evidenceImageUrls == null ? List.of() : evidenceImageUrls;
    }
}
