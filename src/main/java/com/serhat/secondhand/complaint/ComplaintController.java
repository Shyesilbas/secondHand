package com.serhat.secondhand.complaint;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping("/create")
    public Complaint createComplaint(@RequestBody @Valid ComplaintRequest complaintRequest) {
        return complaintService.createComplaint(complaintRequest);
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
