package com.serhat.secondhand.core.audit.service;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import com.serhat.secondhand.core.audit.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logLogin(String userEmail, String ipAddress, String userAgent, boolean success, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .eventType(success ? AuditLog.AuditEventType.LOGIN_SUCCESS : AuditLog.AuditEventType.LOGIN_FAILURE)
                    .eventStatus(success ? AuditLog.AuditEventStatus.SUCCESS : AuditLog.AuditEventStatus.FAILURE)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(success ? "Login successful" : "Login failed")
                    .errorMessage(errorMessage)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for login: {} - {}", userEmail, success ? "SUCCESS" : "FAILURE");
        } catch (Exception e) {
            log.error("Failed to save audit log for login: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void logLogout(String userEmail, Long userId, String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .userId(userId)
                    .eventType(AuditLog.AuditEventType.LOGOUT)
                    .eventStatus(AuditLog.AuditEventStatus.SUCCESS)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details("User logged out successfully")
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for logout: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to save audit log for logout: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void logPasswordChange(String userEmail, Long userId, String ipAddress, String userAgent, boolean success, String errorMessage) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userEmail(userEmail)
                    .userId(userId)
                    .eventType(success ? AuditLog.AuditEventType.PASSWORD_CHANGE_SUCCESS : AuditLog.AuditEventType.PASSWORD_CHANGE_FAILURE)
                    .eventStatus(success ? AuditLog.AuditEventStatus.SUCCESS : AuditLog.AuditEventStatus.FAILURE)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .details(success ? "Password change successful" : "Password change failed")
                    .errorMessage(errorMessage)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved for password change: {} - {}", userEmail, success ? "SUCCESS" : "FAILURE");
        } catch (Exception e) {
            log.error("Failed to save audit log for password change: {}", e.getMessage());
        }
    }

    public String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    public String getClientUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 1000)) : "Unknown";
    }

    // Query methods for security analysis
    public Long countFailedLoginAttemptsByUser(String userEmail, LocalDateTime since) {
        return auditLogRepository.countFailedAttemptsByUserAndTypeSince(userEmail, AuditLog.AuditEventType.LOGIN_FAILURE, since);
    }

    public Long countFailedLoginAttemptsByIp(String ipAddress, LocalDateTime since) {
        return auditLogRepository.countFailedAttemptsByIpAndTypeSince(ipAddress, AuditLog.AuditEventType.LOGIN_FAILURE, since);
    }

    public List<AuditLog> getUserAuditLogs(String userEmail) {
        return auditLogRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    public List<AuditLog> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<AuditLog> getAuditLogsByEventType(AuditLog.AuditEventType eventType, Pageable pageable) {
        return auditLogRepository.findByEventTypeOrderByCreatedAtDesc(eventType, pageable);
    }

    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByDateRange(startDate, endDate, pageable);
    }
}
