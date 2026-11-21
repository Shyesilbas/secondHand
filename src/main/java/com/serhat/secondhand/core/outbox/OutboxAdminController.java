package com.serhat.secondhand.core.outbox;

import com.serhat.secondhand.core.result.ResultResponses;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/outbox")
@RequiredArgsConstructor
@Tag(name = "Outbox Admin", description = "Operator actions on transactional outbox events")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class OutboxAdminController {

    private final OutboxAdminService outboxAdminService;

    @PostMapping("/{type}/{eventId}/requeue")
    @Operation(summary = "Requeue a FAILED outbox event",
            description = "Resets one FAILED event of the given outbox (payment, order, escrow) to PENDING with a fresh attempt counter")
    public ResponseEntity<Void> requeueFailed(@PathVariable OutboxType type, @PathVariable UUID eventId) {
        return ResultResponses.noContent(outboxAdminService.requeueFailed(type, eventId));
    }
}
