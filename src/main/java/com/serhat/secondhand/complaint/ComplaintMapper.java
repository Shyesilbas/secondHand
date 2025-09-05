package com.serhat.secondhand.complaint;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ComplaintMapper {


    public ComplaintDto mapComplaintToDto(Complaint complaint) {
        return new ComplaintDto(
                complaint.getId(),
                complaint.getComplainer().getEmail(),
                complaint.getComplainedUser().getEmail(),
                complaint.getListing() != null ? complaint.getListing().getId() : null,
                complaint.getReason(),
                complaint.getDescription(),
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getResolvedAt()
        );
    }
}
