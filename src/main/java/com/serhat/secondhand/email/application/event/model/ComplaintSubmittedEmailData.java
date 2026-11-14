package com.serhat.secondhand.email.application.event.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintSubmittedEmailData {
    private String userName;
    private String complaintId;
    private String targetLabel;
    private String reason;
    private String eligibleAt;
}
