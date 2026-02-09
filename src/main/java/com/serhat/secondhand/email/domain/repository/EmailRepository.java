package com.serhat.secondhand.email.domain.repository;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {


    @Modifying
    @Query("update Email e set e.readAt = :now where e.user = :user and e.readAt is null")
    int markAllRead(@Param("user") User user, @Param("now") LocalDateTime now);

    long countByUserIdAndReadAtIsNull(Long userId);

    Page<Email> findByUserId(Long userId, Pageable pageable);

    @Modifying
    @Query("delete from Email e where e.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    @Query("SELECT e FROM Email e WHERE e.user.id = :userId AND e.emailType = :emailType ORDER BY e.createdAt DESC")
    Page<Email> findByUserIdAndEmailType(Long userId, Pageable pageable, EmailType emailType);
}