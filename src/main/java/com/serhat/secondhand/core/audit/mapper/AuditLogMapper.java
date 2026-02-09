package com.serhat.secondhand.core.audit.mapper;

import com.serhat.secondhand.core.audit.dto.AuditLogDto;
import com.serhat.secondhand.core.audit.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogDto toDto(AuditLog entity) {
        if (entity == null) {
            return null;
        }

        return AuditLogDto.builder()
                .id(entity.getId())
                .userEmail(entity.getUserEmail())
                .userId(entity.getUserId())
                .eventType(entity.getEventType())
                .eventStatus(entity.getEventStatus())
                .ipAddress(entity.getIpAddress())
                .userAgent(entity.getUserAgent())
                .details(entity.getDetails())
                .errorMessage(entity.getErrorMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
