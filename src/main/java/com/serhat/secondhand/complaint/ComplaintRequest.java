package com.serhat.secondhand.complaint;


import java.util.UUID;

public record ComplaintRequest(
        Long complainerId,
        Long complainedUserId,
        UUID listingId,
        String reason,
        String description
) {
}
