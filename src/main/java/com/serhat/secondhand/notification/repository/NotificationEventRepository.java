package com.serhat.secondhand.notification.repository;

import com.serhat.secondhand.notification.entity.NotificationEvent;
import com.serhat.secondhand.notification.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationEventRepository extends JpaRepository<NotificationEvent, UUID> {

    long countByTypeNot(NotificationType excludedType);

    @Query("SELECT e.id FROM NotificationEvent e WHERE e.id NOT IN (SELECT r.eventId FROM NotificationEventRead r WHERE r.userId = :userId)")
    List<UUID> findUnreadEventIdsForUser(@org.springframework.data.repository.query.Param("userId") Long userId);
}

