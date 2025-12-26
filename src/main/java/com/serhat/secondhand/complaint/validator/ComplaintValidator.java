package com.serhat.secondhand.complaint.validator;

import com.serhat.secondhand.complaint.ComplaintRepository;
import com.serhat.secondhand.complaint.ComplaintRequest;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ComplaintValidator {

    private final ComplaintRepository complaintRepository;

    public void validateRequest(ComplaintRequest request) {
        if (request.complainerId() == null) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINER_ID_NULL);
        }
        if (request.complainedUserId() == null) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINED_USER_ID_NULL);
        }
    }

    public void validateComplaint(User complainer, User complainedUser) {
        if (complainer.getId().equals(complainedUser.getId())) {
            throw new BusinessException(ComplaintErrorCodes.CANNOT_COMPLAIN_ABOUT_SELF);
        }

        if (complaintRepository.existsByComplainerAndComplainedUser(complainer, complainedUser)) {
            throw new BusinessException(ComplaintErrorCodes.COMPLAINT_ALREADY_EXISTS);
        }
    }
}

