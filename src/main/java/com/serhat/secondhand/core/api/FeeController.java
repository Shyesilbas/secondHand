package com.serhat.secondhand.core.api;

import com.serhat.secondhand.core.security.PublicEndpoint;
import com.serhat.secondhand.core.application.FeeScheduleService;
import com.serhat.secondhand.core.dto.FeeScheduleDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fees")
@RequiredArgsConstructor
@Tag(name = "Fees", description = "Public commission and fee schedule")
@PublicEndpoint
public class FeeController {

    private final FeeScheduleService feeScheduleService;

    @GetMapping
    @Operation(summary = "Fee schedule", description = "Listing creation fee, seller commission bands, cargo fee and showcase price")
    public ResponseEntity<FeeScheduleDto> getFeeSchedule() {
        return ResponseEntity.ok(feeScheduleService.getFeeSchedule());
    }
}
