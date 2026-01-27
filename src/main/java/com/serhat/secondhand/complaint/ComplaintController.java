package com.serhat.secondhand.complaint;

import com.serhat.secondhand.core.result.ResultResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody @Valid ComplaintRequest complaintRequest) {
        return ResultResponses.okOrError(complaintService.createComplaint(complaintRequest), HttpStatus.BAD_REQUEST);
    }
}
