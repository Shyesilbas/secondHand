package com.serhat.secondhand.notification.repository;

import com.serhat.secondhand.notification.entity.NotificationEventRead;
import com.serhat.secondhand.notification.entity.NotificationEvent;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationEventReadRepository extends JpaRepository<NotificationEventRead, UUID> {
    boolean existsByEventIdAndUserId(UUID eventId, Long userId);
    long countByUserId(Long userId);

    @Query("SELECT COUNT(r) FROM NotificationEventRead r, NotificationEvent e WHERE r.eventId = e.id AND r.userId = :userId AND e.type <> :excluded")
    long countByUserIdForEventsWithTypeNot(@Param("userId") Long userId, @Param("excluded") NotificationType excluded);
}

