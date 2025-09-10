package com.serhat.secondhand.core.audit.api;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit/enums")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Audit Enums", description = "Audit log enumeration values")
@SecurityRequirement(name = "bearerAuth")
public class AuditEnumController {

    @GetMapping("/event-types")
    @Operation(summary = "Get audit event types", description = "Retrieve all available audit event types with display names")
    public ResponseEntity<List<Map<String, String>>> getEventTypes() {
        log.info("Fetching audit event types");
        
        List<Map<String, String>> eventTypes = Arrays.stream(AuditLog.AuditEventType.values())
                .map(eventType -> Map.of(
                        "value", eventType.name(),
                        "displayName", eventType.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(eventTypes);
    }

    @GetMapping("/event-statuses")
    @Operation(summary = "Get audit event statuses", description = "Retrieve all available audit event statuses with display names")
    public ResponseEntity<List<Map<String, String>>> getEventStatuses() {
        log.info("Fetching audit event statuses");
        
        List<Map<String, String>> eventStatuses = Arrays.stream(AuditLog.AuditEventStatus.values())
                .map(eventStatus -> Map.of(
                        "value", eventStatus.name(),
                        "displayName", eventStatus.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(eventStatuses);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all audit enums", description = "Retrieve all audit enumeration values")
    public ResponseEntity<Map<String, List<Map<String, String>>>> getAllEnums() {
        log.info("Fetching all audit enums");
        
        List<Map<String, String>> eventTypes = Arrays.stream(AuditLog.AuditEventType.values())
                .map(eventType -> Map.of(
                        "value", eventType.name(),
                        "displayName", eventType.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        List<Map<String, String>> eventStatuses = Arrays.stream(AuditLog.AuditEventStatus.values())
                .map(eventStatus -> Map.of(
                        "value", eventStatus.name(),
                        "displayName", eventStatus.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        Map<String, List<Map<String, String>>> allEnums = Map.of(
                "eventTypes", eventTypes,
                "eventStatuses", eventStatuses
        );
        
        return ResponseEntity.ok(allEnums);
    }
}
