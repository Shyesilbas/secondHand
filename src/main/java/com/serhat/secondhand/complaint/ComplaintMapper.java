package com.serhat.secondhand.complaint;

import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@lombok.RequiredArgsConstructor
public class ComplaintMapper {

    private final ComplaintModerationProperties moderationProperties;

    public ComplaintDto mapComplaintToDto(Complaint complaint) {
        return new ComplaintDto(
                complaint.getId(),
                complaint.getComplainer().getName() + " " + complaint.getComplainer().getSurname(),
                complaint.getComplainedUser().getName() + " " + complaint.getComplainedUser().getSurname(),
                complaint.getListing() != null ? complaint.getListing().getId() : null,
                complaint.getListing() != null ? complaint.getListing().getTitle() : null,
                complaint.getReason(),
                complaint.getDescription(),
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getResolvedAt(),
                complaint.getStatus(),
                complaint.getAdminNotes(),
                complaint.getEligibleForReviewAt(),
                complaint.getChatRoomId(),
                complaint.getReportedMessageId(),
                complaint.getEvidenceImageUrls() == null ? List.of() : List.copyOf(complaint.getEvidenceImageUrls()),
                complaint.getViolationCategory(),
                complaint.getPenaltyAction(),
                complaint.getAiConfidenceScore(),
                complaint.getAiReviewedAt(),
                complaint.getAppealStatus(),
                complaint.getAppealReason(),
                complaint.getAppealSubmittedAt(),
                complaint.getAppealReviewedAt(),
                complaint.getAppealDecisionNotes(),
                complaint.appealDeadline(moderationProperties.getReview().getAppealWindow()),
                complaint.isBadFaithReport(),
                complaint.getComplainerPenaltyAction()
        );
    }

    public Complaint fromCreateRequest(ComplaintRequest request, User complainer, User complainedUser,
                                       Listing listing, LocalDateTime now, Duration coolingOff) {
        return Complaint.builder()
                .complainer(complainer)
                .complainedUser(complainedUser)
                .listing(listing)
                .chatRoomId(request.chatRoomId())
                .reportedMessageId(request.reportedMessageId())
                .evidenceImageUrls(new ArrayList<>(request.evidenceImageUrlsOrEmpty()))
                .reason(request.reason())
                .description(request.description())
                .status(ComplaintStatus.PENDING)
                .appealStatus(AppealStatus.NONE)
                .eligibleForReviewAt(now.plus(coolingOff))
                .createdAt(now)
                .updatedAt(null)
                .resolvedAt(null)
                .build();
    }
}
