package com.serhat.secondhand.email.domain.repository;

import com.serhat.secondhand.email.domain.entity.Email;
import com.serhat.secondhand.email.domain.entity.enums.EmailStatus;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailRepository extends JpaRepository<Email, UUID> {

    List<Email> findByUserOrderByCreatedAtDesc(User user);

    List<Email> findByEmailTypeOrderByCreatedAtDesc(EmailType emailType);

    @Query("SELECT e FROM Email e WHERE e.createdAt BETWEEN :startDate AND :endDate ORDER BY e.createdAt DESC")
    List<Email> findEmailsBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Email> findByUserAndEmailTypeOrderByCreatedAtDesc(User user, EmailType emailType);


    List<Email> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
}