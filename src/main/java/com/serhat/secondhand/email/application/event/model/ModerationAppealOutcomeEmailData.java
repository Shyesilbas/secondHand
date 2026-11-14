package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationAppealOutcomeEmailData {
    private String userName;
    private String complaintId;
    private boolean approved;
    private boolean penaltyReversed;
    private String explanation;
}
