package com.serhat.secondhand.complaint;

import com.serhat.secondhand.core.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/create")
    public ResponseEntity<?> createComplaint(@RequestBody @Valid ComplaintRequest complaintRequest) {
        Result<ComplaintDto> result = complaintService.createComplaint(complaintRequest);
        if (result.isError()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", result.getErrorCode(), "message", result.getMessage()));
        }
        return ResponseEntity.ok(result.getData());
    }

    @GetMapping("/myComplaints")
    public ResponseEntity<List<ComplaintDto>> getUserComplaints() {
        List<ComplaintDto> complaints = complaintService.getUserComplaints();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/aboutMe")
    public ResponseEntity<List<ComplaintDto>> getComplaintsAboutUser() {
        List<ComplaintDto> complaints = complaintService.getComplaintsAboutUser();
        return ResponseEntity.ok(complaints);
    }


}
