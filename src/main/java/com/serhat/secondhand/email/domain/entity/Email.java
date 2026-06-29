package com.serhat.secondhand.email.domain.entity;

import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "emails", indexes = {
    @jakarta.persistence.Index(name = "idx_emails_user_deleted", columnList = "user_id, deleted_at")
})
@EntityListeners(AuditingEntityListener.class)
@SQLDelete(sql = "UPDATE emails SET deleted_at = now() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_type", nullable = false)
    private EmailType emailType;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}