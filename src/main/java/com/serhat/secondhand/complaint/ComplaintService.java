package com.serhat.secondhand.complaint;

import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintMapper complaintMapper;
    private final UserService userService;
    private final ListingService listingService;


    @Transactional
    public ComplaintDto createComplaint(ComplaintRequest complaintRequest) {
        if (complaintRequest.complainerId() == null) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINER_ID_NULL);
        }
        if (complaintRequest.complainedUserId() == null) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINED_USER_ID_NULL);
        }

        User complainer = userService.findById(complaintRequest.complainerId());

        User complainedUser = userService.findById(complaintRequest.complainedUserId());

        Listing listing = null;
        if (complaintRequest.listingId() != null) {
            listing = listingService.findById(complaintRequest.listingId())
                    .orElse(null);
        }

        Complaint complaint = Complaint.builder()
                .complainer(complainer)
                .complainedUser(complainedUser)
                .listing(listing)
                .reason(complaintRequest.reason())
                .description(complaintRequest.description())
                .status(ComplaintStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .resolvedAt(null)
                .build();

         complaintRepository.save(complaint);

         return complaintMapper.mapComplaintToDto(complaint);
    }


    // Admin
    @Transactional
    public Complaint updateComplaintStatus(String complaintId, ComplaintStatus newStatus, String adminNotes, User admin) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new BusinessException(ComplaintErrorCodes.COMPLAINT_NOT_FOUND));

        complaint.setStatus(newStatus);
        complaint.setResolvedBy(admin);
        complaint.setAdminNotes(adminNotes);

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.DISMISSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);
        log.info("Complaint {} status updated to {} by admin {}", complaintId, newStatus, admin.getId());
        return updatedComplaint;
    }


    public List<ComplaintDto> getUserComplaints() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getAuthenticatedUser(authentication);

        return complaintRepository.findByComplainer(user).stream()
                .map(complaintMapper::mapComplaintToDto)
                .toList();
    }


    public List<ComplaintDto> getComplaintsAboutUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.getAuthenticatedUser(authentication);

        return complaintRepository.findByComplainedUser(user).stream().map(complaintMapper::mapComplaintToDto).toList();
    }


    public List<Complaint> getPendingComplaints() {
        return complaintRepository.findPendingComplaints();
    }


    public List<Complaint> getComplaintsByStatus(ComplaintStatus status) {
        return complaintRepository.findByStatus(status);
    }

    public Long getUserComplaintCount(User user) {
        return complaintRepository.countComplaintsByComplainer(user.getId());
    }

    public Long getComplaintsAboutUserCount(User user) {
        return complaintRepository.countComplaintsByComplainedUser(user.getId());
    }

    public boolean hasUserComplainedAbout(User complainer, User complainedUser) {
        List<Complaint> complaints = complaintRepository.findByComplainerAndComplainedUser(complainer, complainedUser);
        return !complaints.isEmpty();
    }

    private void validateComplaint(User complainer, User complainedUser) {
        if (complainer.getId().equals(complainedUser.getId())) {
            throw new BusinessException(ComplaintErrorCodes.CANNOT_COMPLAIN_ABOUT_SELF);
        }

        if (complaintRepository.existsByComplainerAndComplainedUser(complainer, complainedUser)) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINT_ALREADY_EXISTS);
        }
    }
}

