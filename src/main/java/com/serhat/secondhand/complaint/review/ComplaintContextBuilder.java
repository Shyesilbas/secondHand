package com.serhat.secondhand.complaint.review;

import com.serhat.secondhand.chat.application.ChatTranscriptService;
import com.serhat.secondhand.chat.application.ChatTranscriptService.TranscriptMessage;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.Optional;

/** Collects the review context (proposal section 4.1). Must run inside a transaction. */
@Component
@RequiredArgsConstructor
public class ComplaintContextBuilder {

    private final ComplaintRepository complaintRepository;
    private final ChatTranscriptService chatTranscriptService;
    private final SanctionPolicy sanctionPolicy;
    private final ComplaintModerationProperties properties;

    static final int RELATED_REPORT_MAX = 300;

    public ComplaintReviewContext build(String complaintId, LocalDateTime now) {
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new IllegalStateException("Complaint " + complaintId + " disappeared during review"));
        return new ComplaintReviewContext(
                complaint.getId(),
                complaint.getReason(),
                complaint.getDescription(),
                party(complaint.getComplainer(), now),
                party(complaint.getComplainedUser(), now),
                listing(complaint.getListing()),
                complaint.getReportedMessageId(),
                transcript(complaint),
                complaint.getEvidenceImageUrls() == null ? List.of() : List.copyOf(complaint.getEvidenceImageUrls()),
                brigadeSignals(complaint, now));
    }

    ComplaintReviewContext.BrigadeSignals brigadeSignals(Complaint complaint, LocalDateTime now) {
        ComplaintModerationProperties.Review rules = properties.getReview();
        int windowHours = (int) rules.getBrigadeWindow().toHours();
        List<ComplaintRepository.RelatedComplaint> related = complaintRepository.findRecentAgainst(
                complaint.getComplainedUser().getId(), now.minus(rules.getBrigadeWindow()), complaint.getId(),
                PageRequest.of(0, rules.getRelatedReportScanLimit()));
        Long complainerId = complaint.getComplainer().getId();
        List<ComplaintRepository.RelatedComplaint> others = related.stream()
                .filter(r -> !complainerId.equals(r.getComplainerId()))
                .toList();
        if (others.isEmpty()) {
            return ComplaintReviewContext.BrigadeSignals.none(windowHours);
        }
        LocalDate newAccountCutoff = now.minus(rules.getNewAccountAge()).toLocalDate();
        String ip = complaint.getComplainer().getLastLoginIp();
        Set<Long> distinct = new HashSet<>();
        Set<Long> newAccounts = new HashSet<>();
        Set<Long> sharingIp = new HashSet<>();
        for (ComplaintRepository.RelatedComplaint r : others) {
            distinct.add(r.getComplainerId());
            if (r.getComplainerCreated() != null && r.getComplainerCreated().isAfter(newAccountCutoff)) {
                newAccounts.add(r.getComplainerId());
            }
            if (ip != null && !ip.isBlank() && ip.equals(r.getComplainerIp())) {
                sharingIp.add(r.getComplainerId());
            }
        }
        List<String> samples = others.stream()
                .limit(rules.getRelatedReportSamples())
                .map(r -> truncate(r.getReason() + ": " + (r.getDescription() == null ? "" : r.getDescription())))
                .toList();
        return new ComplaintReviewContext.BrigadeSignals(windowHours, others.size(), distinct.size(),
                newAccounts.size(), sharingIp.size(), samples);
    }

    private static String truncate(String value) {
        return value.length() <= RELATED_REPORT_MAX ? value : value.substring(0, RELATED_REPORT_MAX);
    }

    private ComplaintReviewContext.Party party(User user, LocalDateTime now) {
        return new ComplaintReviewContext.Party(
                user.getId(),
                user.getAccountCreationDate(),
                sanctionPolicy.effectiveWarnings(user, now),
                complaintRepository.countUpheldAgainst(user.getId()));
    }

    private static ComplaintReviewContext.ListingSnapshot listing(Listing listing) {
        if (listing == null) {
            return null;
        }
        return new ComplaintReviewContext.ListingSnapshot(
                listing.getTitle(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getCurrency() == null ? null : listing.getCurrency().name(),
                listing.getListingType() == null ? null : listing.getListingType().name(),
                listing.getStatus() == null ? null : listing.getStatus().name());
    }

    private List<TranscriptMessage> transcript(Complaint complaint) {
        if (complaint.getChatRoomId() == null) {
            return List.of();
        }
        List<TranscriptMessage> messages = new ArrayList<>(chatTranscriptService.latestMessages(
                complaint.getChatRoomId(), properties.getReview().getTranscriptSize()));
        Long reported = complaint.getReportedMessageId();
        if (reported != null && messages.stream().noneMatch(m -> m.id().equals(reported))) {
            // The reported message is older than the window: keep it, it is the primary evidence.
            Optional<TranscriptMessage> primary = chatTranscriptService.findMessage(complaint.getChatRoomId(), reported);
            primary.ifPresent(m -> messages.add(0, m));
        }
        return messages;
    }
}
