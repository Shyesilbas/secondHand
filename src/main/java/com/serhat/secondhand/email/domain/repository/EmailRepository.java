package com.serhat.secondhand.email.domain.repository;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {

    List<Email> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndReadAtIsNull(User user);

    @Modifying
    @Query("update Email e set e.readAt = :now where e.user = :user and e.readAt is null")
    int markAllRead(@Param("user") User user, @Param("now") LocalDateTime now);

}