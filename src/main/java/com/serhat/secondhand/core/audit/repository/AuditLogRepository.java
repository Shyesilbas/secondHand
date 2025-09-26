package com.serhat.secondhand.core.audit.repository;

import com.serhat.secondhand.core.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<AuditLog> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);

    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<AuditLog> findByEventTypeOrderByCreatedAtDesc(AuditLog.AuditEventType eventType, Pageable pageable);

    Page<AuditLog> findByEventStatusOrderByCreatedAtDesc(AuditLog.AuditEventStatus eventStatus, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate, 
                                   Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.ipAddress = :ipAddress ORDER BY a.createdAt DESC")
    List<AuditLog> findByIpAddress(@Param("ipAddress") String ipAddress);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.userEmail = :userEmail AND a.eventType = :eventType AND a.createdAt >= :since")
    Long countFailedAttemptsByUserAndTypeSince(@Param("userEmail") String userEmail, 
                                               @Param("eventType") AuditLog.AuditEventType eventType, 
                                               @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.ipAddress = :ipAddress AND a.eventType = :eventType AND a.createdAt >= :since")
    Long countFailedAttemptsByIpAndTypeSince(@Param("ipAddress") String ipAddress, 
                                             @Param("eventType") AuditLog.AuditEventType eventType, 
                                             @Param("since") LocalDateTime since);
}
