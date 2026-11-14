package com.serhat.secondhand.complaint.application;

import com.serhat.secondhand.complaint.AppealRequest;
import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.ComplaintDto;
import com.serhat.secondhand.complaint.ComplaintMapper;
import com.serhat.secondhand.complaint.ComplaintRequest;
import com.serhat.secondhand.complaint.application.event.AppealSubmittedEvent;
import com.serhat.secondhand.complaint.application.event.ComplaintSubmittedEvent;
import com.serhat.secondhand.complaint.config.ComplaintModerationProperties;
import com.serhat.secondhand.complaint.queue.ComplaintRateLimiter;
import com.serhat.secondhand.complaint.repository.ComplaintRepository;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.complaint.validator.ComplaintValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService implements IComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintMapper complaintMapper;
    private final IUserService userService;
    private final ListingQueryService listingService;
    private final ComplaintValidator complaintValidator;
    private final ComplaintModerationProperties moderationProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final ComplaintRateLimiter complaintRateLimiter;


    @Transactional
    public Result<ComplaintDto> createComplaint(Long userId,ComplaintRequest complaintRequest) {
        log.info("Creating complaint from user {} about user {}", userId, complaintRequest.complainedUserId());

        Result<Void> validationResult = complaintValidator.validateRequest(userId,complaintRequest);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        Result<User> complainedUserResult = userService.findById(complaintRequest.complainedUserId());
        if (complainedUserResult.isError()) {
            return Result.error(complainedUserResult.getMessage(), complainedUserResult.getErrorCode());
        }

        User complainer = userService.findById(userId).getData();
        User complainedUser = complainedUserResult.getData();

        Result<Void> complaintValidationResult = complaintValidator.validateComplaint(complainer, complainedUser);
        if (complaintValidationResult.isError()) {
            return Result.error(complaintValidationResult.getMessage(), complaintValidationResult.getErrorCode());
        }

        Listing listing = null;
        if (complaintRequest.listingId() != null) {
            listing = listingService.findById(complaintRequest.listingId()).orElse(null);
            if (listing == null) {
                return Result.error(ComplaintErrorCodes.COMPLAINT_LISTING_NOT_FOUND);
            }
            Result<Void> listingResult = complaintValidator.validateListingTarget(listing, complainedUser);
            if (listingResult.isError()) {
                return Result.error(listingResult.getMessage(), listingResult.getErrorCode());
            }
        }

        Result<Void> chatResult = complaintValidator.validateChatEvidence(complaintRequest, complainer, complainedUser);
        if (chatResult.isError()) {
            return Result.error(chatResult.getMessage(), chatResult.getErrorCode());
        }

        Result<Void> quotaResult = complaintRateLimiter.consume(complainer.getId());
        if (quotaResult.isError()) {
            return Result.error(quotaResult.getMessage(), quotaResult.getErrorCode());
        }

        Complaint complaint = complaintMapper.fromCreateRequest(complaintRequest, complainer, complainedUser, listing,
                LocalDateTime.now(), moderationProperties.getCoolingOff());
        Complaint savedComplaint = complaintRepository.save(complaint);



        eventPublisher.publishEvent(new ComplaintSubmittedEvent(
                complainer,
                savedComplaint.getId(),
                targetLabel(savedComplaint),
                savedComplaint.getReason(),
                savedComplaint.getEligibleForReviewAt()));

        log.info("Complaint created with ID: {}", savedComplaint.getId());
        return Result.success(complaintMapper.mapComplaintToDto(savedComplaint));
    }



    /** Files the one allowed appeal against an Aura decision (proposal section 5.6). */
    @Transactional
    public Result<ComplaintDto> submitAppeal(Long userId, String complaintId, AppealRequest request) {
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId).orElse(null);
        if (complaint == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_NOT_FOUND);
        }
        LocalDateTime now = LocalDateTime.now();
        Result<Void> validation = complaintValidator.validateAppeal(complaint, userId, now);
        if (validation.isError()) {
            return Result.error(validation.getMessage(), validation.getErrorCode());
        }
        if (complaintRepository.markAppealPending(complaintId, request.reason().trim(), now) == 0) {
            return Result.error(ComplaintErrorCodes.APPEAL_ALREADY_SUBMITTED);
        }
        eventPublisher.publishEvent(new AppealSubmittedEvent(complaintId, now));
        log.info("Appeal filed for complaint {} by user {}", complaintId, userId);
        Complaint updated = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new IllegalStateException("Complaint " + complaintId + " disappeared after appeal"));
        return Result.success(complaintMapper.mapComplaintToDto(updated));
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getUserComplaints(User user) {
        log.info("Getting complaints for user: {}", user.getId());
        return complaintRepository.findByComplainerWithDetails(user).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsAboutUser(User user) {
        log.info("Getting complaints about user: {}", user.getId());
        return complaintRepository.findByComplainedUserWithDetails(user).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }


    private static String targetLabel(Complaint complaint) {
        if (complaint.getListing() != null) {
            return complaint.getListing().getTitle();
        }
        User target = complaint.getComplainedUser();
        return target.getName() + " " + target.getSurname();
    }
}
