package com.serhat.secondhand.complaint;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ComplaintMapper {

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
                complaint.getResolvedAt()
        );
    }

    public Complaint fromCreateRequest(ComplaintRequest request, User complainer, User complainedUser, Listing listing) {
        return Complaint.builder()
                .complainer(complainer)
                .complainedUser(complainedUser)
                .listing(listing)
                .reason(request.reason())
                .description(request.description())
                .status(ComplaintStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(null)
                .resolvedAt(null)
                .build();
    }
}
