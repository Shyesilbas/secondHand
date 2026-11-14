package com.serhat.secondhand.complaint.application.event;

import java.time.LocalDateTime;

/** Published inside the transaction that records an appeal; queued for Aura after commit. */
public record AppealSubmittedEvent(String complaintId, LocalDateTime submittedAt) {
}
