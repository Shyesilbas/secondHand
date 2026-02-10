package com.serhat.secondhand.complaint;

import com.serhat.secondhand.core.result.ResultResponses;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody @Valid ComplaintRequest complaintRequest,
                                             @AuthenticationPrincipal User currentUser) {
        return ResultResponses.okOrError(complaintService.createComplaint(currentUser.getId(),complaintRequest), HttpStatus.BAD_REQUEST);
    }
}
