package com.serhat.secondhand.notification.repository;

import com.serhat.secondhand.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    @Query("SELECT DISTINCT n FROM Notification n " +
           "LEFT JOIN FETCH n.user " +
           "WHERE n.user.id = :userId " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    Long countByUserIdAndIsReadFalse(Long userId);
    
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    boolean existsByIdAndUserId(UUID id, Long userId);

    boolean existsByUser_IdAndTypeAndMetadataAndIsReadFalse(Long userId, com.serhat.secondhand.notification.entity.enums.NotificationType type, String metadata);
}

