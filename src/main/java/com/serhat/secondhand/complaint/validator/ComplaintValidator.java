package com.serhat.secondhand.complaint.validator;

import com.serhat.secondhand.complaint.ComplaintRepository;
import com.serhat.secondhand.complaint.ComplaintRequest;
import com.serhat.secondhand.complaint.util.ComplaintErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ComplaintValidator {

    private final ComplaintRepository complaintRepository;

    public Result<Void> validateRequest(Long userId,ComplaintRequest request) {
        if (userId == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINER_ID_NULL);
        }
        if (request.complainedUserId() == null) {
            return Result.error(ComplaintErrorCodes.COMPLAINED_USER_ID_NULL);
        }
        return Result.success();
    }

    public Result<Void> validateComplaint(User complainer, User complainedUser) {
        if (complainer.getId().equals(complainedUser.getId())) {
            return Result.error(ComplaintErrorCodes.CANNOT_COMPLAIN_ABOUT_SELF);
        }

        if (complaintRepository.existsByComplainerAndComplainedUser(complainer, complainedUser)) {
            return Result.error(ComplaintErrorCodes.COMPLAINT_ALREADY_EXISTS);
        }
        return Result.success();
    }
}

