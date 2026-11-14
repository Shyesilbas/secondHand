package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationSanctionEmailData {
    private String userName;
    private String complaintId;
    private String violationLabel;
    private String adminNotes;
    private String listingTitle;
    private String bannedUntil;
    private Integer warningCount;
    private Integer warningThreshold;
    private String appealDeadline;
}
