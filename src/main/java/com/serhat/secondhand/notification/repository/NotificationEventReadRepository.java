package com.serhat.secondhand.notification.repository;

import com.serhat.secondhand.notification.entity.NotificationEventRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationEventReadRepository extends JpaRepository<NotificationEventRead, UUID> {
    boolean existsByEventIdAndUserId(UUID eventId, Long userId);
    long countByUserId(Long userId);
}

