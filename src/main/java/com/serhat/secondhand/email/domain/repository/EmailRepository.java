package com.serhat.secondhand.email.domain.repository;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {


    @Modifying
    @Query("update Email e set e.readAt = :now where e.user = :user and e.readAt is null")
    int markAllRead(@Param("user") User user, @Param("now") LocalDateTime now);

    long countByUserIdAndReadAtIsNull(Long userId);

    Page<Email> findByUserId(Long userId, Pageable pageable);

    @Modifying
    @Query("update Email e set e.deletedAt = :deletedAt where e.user.id = :userId and e.deletedAt is null")
    int softDeleteAllByUserId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("update Email e set e.deletedAt = :deletedAt where e.id = :emailId and e.user.id = :userId and e.deletedAt is null")
    int softDeleteByIdAndUserId(@Param("emailId") UUID emailId, @Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);

    @Query("SELECT e FROM Email e WHERE e.user.id = :userId AND e.emailType = :emailType ORDER BY e.createdAt DESC")
    Page<Email> findByUserIdAndEmailType(Long userId, Pageable pageable, EmailType emailType);

    Page<Email> findByUserIdAndEmailTypeIn(Long userId, Collection<EmailType> emailTypes, Pageable pageable);

    boolean existsByUser_IdAndEmailTypeAndSubject(Long userId, EmailType emailType, String subject);

    @Query("select e.user.id from Email e where e.user.id in :userIds and e.emailType = :emailType and e.subject = :subject")
    Set<Long> findUserIdsBySubjectAndEmailType(
            @Param("userIds") Collection<Long> userIds,
            @Param("emailType") EmailType emailType,
            @Param("subject") String subject
    );

    java.util.Optional<Email> findByIdAndRecipientEmail(UUID id, String recipientEmail);

    Page<Email> findByRecipientEmail(String email, Pageable pageable);

    @Query(value = "SELECT e FROM Email e WHERE e.status = :status AND e.retryCount < :maxRetries ORDER BY CASE e.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END ASC, e.createdAt ASC")
    java.util.List<Email> findTop50FailedEmails(@Param("status") EmailStatus status, @Param("maxRetries") int maxRetries);

    @Modifying
    @Query("DELETE FROM Email e WHERE e.createdAt < :cutoffDate")
    int deleteOldEmails(@Param("cutoffDate") LocalDateTime cutoffDate);
}