package com.serhat.secondhand.core.audit.dto;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {

    private Long id;
    private String userEmail;
    private Long userId;
    private AuditLog.AuditEventType eventType;
    private AuditLog.AuditEventStatus eventStatus;
    private String ipAddress;
    private String userAgent;
    private String details;
    private String errorMessage;
    private LocalDateTime createdAt;
}
