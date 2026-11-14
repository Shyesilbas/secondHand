package com.serhat.secondhand.complaint.validator;

import com.serhat.secondhand.chat.application.ChatAuthorizationService;
import com.serhat.secondhand.chat.entity.ChatRoom;
import com.serhat.secondhand.chat.entity.Message;
import com.serhat.secondhand.complaint.AppealStatus;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.ComplaintRequest;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.time.LocalDateTime;
import java.net.URISyntaxException;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ComplaintValidator {

    /** Statuses that still lock the complainer out of filing another complaint about the same user. */
    public static final Set<ComplaintStatus> ACTIVE_STATUSES =
            EnumSet.of(ComplaintStatus.PENDING, ComplaintStatus.INVESTIGATING);

    private final ComplaintRepository complaintRepository;
    private final ChatAuthorizationService chatAuthorizationService;
    private final ComplaintModerationProperties moderationProperties;

    /**
     * Proposal section 5.6: only the penalized user, only an appealable penalty, only once and only
     * within {@code app.moderation.review.appeal-window} of the decision.
     */
    public Result<Void> validateAppeal(Complaint complaint, Long userId, LocalDateTime now) {
        if (!complaint.getComplainedUser().getId().equals(userId)) {
            return Result.error(ComplaintErrorCodes.APPEAL_NOT_ALLOWED);
        }
        LocalDateTime deadline = complaint.appealDeadline(moderationProperties.getReview().getAppealWindow());
        if (deadline == null) {
            return Result.error(ComplaintErrorCodes.APPEAL_NOT_APPEALABLE);
        }
        if (complaint.getAppealStatus() != AppealStatus.NONE) {
            return Result.error(ComplaintErrorCodes.APPEAL_ALREADY_SUBMITTED);
        }
        if (now.isAfter(deadline)) {
            return Result.error(ComplaintErrorCodes.APPEAL_WINDOW_CLOSED);
        }
        return Result.success();
    }

    public Result<Void> validateRequest(Long userId, ComplaintRequest request) {
        if (userId == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINER_ID_NULL);
        }
        if (request.complainedUserId() == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINED_USER_ID_NULL);
        }
        if (request.reportedMessageId() != null && request.chatRoomId() == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_MESSAGE_REQUIRES_CHAT_ROOM);
        }
        return validateEvidenceImages(request.evidenceImageUrlsOrEmpty());
    }

    public Result<Void> validateComplaint(User complainer, User complainedUser) {
        if (complainer.getId().equals(complainedUser.getId())) {
            return Result.error(ComplaintErrorCodes.CANNOT_COMPLAIN_ABOUT_SELF);
        }
        if (complaintRepository.existsByComplainerAndComplainedUserAndStatusIn(
                complainer, complainedUser, ACTIVE_STATUSES)) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_ALREADY_EXISTS);
        }
        return Result.success();
    }

    public Result<Void> validateListingTarget(Listing listing, User complainedUser) {
        if (!listing.isOwnedBy(complainedUser.getId())) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_LISTING_NOT_OWNED_BY_USER);
        }
        return Result.success();
    }

    /**
     * A cited chat must be shared by both users, and a cited message must sit in that chat
     * and come from the reported user.
     */
    public Result<Void> validateChatEvidence(ComplaintRequest request, User complainer, User complainedUser) {
        if (request.chatRoomId() == null) {
            return Result.success();
        }
        Result<ChatRoom> roomResult =
                chatAuthorizationService.authorizeRoomAccess(request.chatRoomId(), complainer.getId());
        if (roomResult.isError()) {
            return Result.error(roomResult.getMessage(), roomResult.getErrorCode());
        }
        if (!roomResult.getData().getParticipantIds().contains(complainedUser.getId())) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_CHAT_NOT_SHARED);
        }
        if (request.reportedMessageId() == null) {
            return Result.success();
        }
        Result<Message> messageResult =
                chatAuthorizationService.findMessageInRoom(request.reportedMessageId(), request.chatRoomId());
        if (messageResult.isError()) {
            return Result.error(messageResult.getMessage(), messageResult.getErrorCode());
        }
        if (!complainedUser.getId().equals(messageResult.getData().getSender().getId())) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_MESSAGE_NOT_FROM_USER);
        }
        return Result.success();
    }

    private Result<Void> validateEvidenceImages(List<String> urls) {
        if (urls.size() > moderationProperties.getMaxEvidenceImages()) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_TOO_MANY_EVIDENCE_IMAGES);
        }
        for (String url : urls) {
            if (!isAllowedEvidenceUrl(url)) {
                return Result.error(ComplaintErrorCodes.COMPLAINT_INVALID_EVIDENCE_IMAGE_URL);
            }
        }
        return Result.success();
    }

    private boolean isAllowedEvidenceUrl(String url) {
        if (url == null || url.isBlank() || url.length() > 1024) {
            return false;
        }
        try {
            URI uri = new URI(url);
            return "https".equals(uri.getScheme())
                    && moderationProperties.getEvidenceImageHost().equalsIgnoreCase(uri.getHost());
        } catch (URISyntaxException e) {
            return false;
        }
    }
}
