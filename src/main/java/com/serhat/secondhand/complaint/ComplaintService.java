package com.serhat.secondhand.complaint;

import com.serhat.secondhand.complaint.validator.ComplaintValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintMapper complaintMapper;
    private final UserService userService;
    private final ListingService listingService;
    private final ComplaintValidator complaintValidator;


    @Transactional
    public Result<ComplaintDto> createComplaint(ComplaintRequest complaintRequest) {
        log.info("Creating complaint from user {} about user {}", complaintRequest.complainerId(), complaintRequest.complainedUserId());

        Result<Void> validationResult = complaintValidator.validateRequest(complaintRequest);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        Result<User> complainerResult = userService.findById(complaintRequest.complainerId());
        if (complainerResult.isError()) {
            return Result.error(complainerResult.getMessage(), complainerResult.getErrorCode());
        }
        
        Result<User> complainedUserResult = userService.findById(complaintRequest.complainedUserId());
        if (complainedUserResult.isError()) {
            return Result.error(complainedUserResult.getMessage(), complainedUserResult.getErrorCode());
        }

        User complainer = complainerResult.getData();
        User complainedUser = complainedUserResult.getData();

        Result<Void> complaintValidationResult = complaintValidator.validateComplaint(complainer, complainedUser);
        if (complaintValidationResult.isError()) {
            return Result.error(complaintValidationResult.getMessage(), complaintValidationResult.getErrorCode());
        }

        Listing listing = null;
        if (complaintRequest.listingId() != null) {
            listing = listingService.findById(complaintRequest.listingId()).orElse(null);
        }

        Complaint complaint = complaintMapper.fromCreateRequest(complaintRequest, complainer, complainedUser, listing);
        Complaint savedComplaint = complaintRepository.save(complaint);

        log.info("Complaint created with ID: {}", savedComplaint.getId());
        return Result.success(complaintMapper.mapComplaintToDto(savedComplaint));
    }



    @Transactional(readOnly = true)
    public List<ComplaintDto> getUserComplaints(User user) {
        log.info("Getting complaints for user: {}", user.getId());
        return complaintRepository.findByComplainer(user).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsAboutUser(User user) {
        log.info("Getting complaints about user: {}", user.getId());
        return complaintRepository.findByComplainedUser(user).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ComplaintDto> getPendingComplaints() {
        log.info("Getting pending complaints");
        return complaintRepository.findPendingComplaints().stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getComplaintsByStatus(ComplaintStatus status) {
        log.info("Getting complaints by status: {}", status);
        return complaintRepository.findByStatus(status).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Long getUserComplaintCount(User user) {
        return complaintRepository.countComplaintsByComplainer(user.getId());
    }

    @Transactional(readOnly = true)
    public Long getComplaintsAboutUserCount(User user) {
        return complaintRepository.countComplaintsByComplainedUser(user.getId());
    }

    @Transactional(readOnly = true)
    public boolean hasUserComplainedAbout(User complainer, User complainedUser) {
        return complaintRepository.existsByComplainerAndComplainedUser(complainer, complainedUser);
    }
}

