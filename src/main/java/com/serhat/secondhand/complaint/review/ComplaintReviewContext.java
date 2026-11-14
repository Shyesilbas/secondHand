package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.chat.application.ChatTranscriptService.TranscriptMessage;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Everything Aura sees about one complaint. Users appear only by id (no names or contact data go to
 * Gemini). User-written fields are untrusted evidence.
 */
public record ComplaintReviewContext(
        String complaintId,
        String reason,
        String description,
        Party complainer,
        Party complainedUser,
        ListingSnapshot listing,
        Long reportedMessageId,
        List<TranscriptMessage> transcript,
        List<String> evidenceImageUrls,
        BrigadeSignals brigadeSignals
) {
    public record Party(Long userId, LocalDate accountCreated, int warningCount,
                        long upheldComplaintsAgainst) {}

    /**
     * Complaints against the reported user in the brigade window (proposal section 5.3.4). Only counts
     * and texts reach Gemini, never other users' ids or IP addresses.
     *
     * @param complainersSharingIp other complainers whose last login IP equals this complainer's
     * @param relatedReports       reason and description of a few other recent complaints
     */
    public record BrigadeSignals(int windowHours, int otherComplaints, int distinctOtherComplainers,
                                 int newAccountComplainers, int complainersSharingIp,
                                 List<String> relatedReports) {
        public static BrigadeSignals none(int windowHours) {
            return new BrigadeSignals(windowHours, 0, 0, 0, 0, List.of());
        }
    }

    public record ListingSnapshot(String title, String description, BigDecimal price, String currency,
                                  String listingType, String status) {}
}
