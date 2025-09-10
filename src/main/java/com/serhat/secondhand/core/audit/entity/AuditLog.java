package com.serhat.secondhand.core.audit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = true)
    private String userEmail;

    @Column(name = "user_id", nullable = true)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AuditEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status", nullable = false)
    private AuditEventStatus eventStatus;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 1000)
    private String userAgent;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Getter
    public enum AuditEventType {
        LOGIN_SUCCESS("Successful Login"),
        LOGIN_FAILURE("Failed Login"),
        LOGOUT("Logout"),
        PASSWORD_CHANGE_SUCCESS("Successful Password Change"),
        PASSWORD_CHANGE_FAILURE("Failed Password Change");

        private final String displayName;

        AuditEventType(String displayName) {
            this.displayName = displayName;
        }

    }

    @Getter
    public enum AuditEventStatus {
        SUCCESS("Success"),
        FAILURE("Failure");

        private final String displayName;

        AuditEventStatus(String displayName) {
            this.displayName = displayName;
        }

    }
}
