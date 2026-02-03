package com.serhat.secondhand.forum.entity;

import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thread_id", nullable = false)
    private Long threadId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_visibility", nullable = false, length = 32)
    private ForumAuthorVisibility authorVisibility;

    @Column(name = "author_display_name", nullable = false, length = 120)
    private String authorDisplayName;

    @Column(name = "parent_comment_id")
    private Long parentCommentId;

    @Column(name = "content", nullable = false, length = 4000)
    private String content;

    @Column(name = "total_likes", nullable = false)
    private long totalLikes;

    @Column(name = "total_dislikes", nullable = false)
    private long totalDislikes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    protected void onCreate() {
        if (authorVisibility == null) {
            authorVisibility = ForumAuthorVisibility.ANONYMOUS;
        }
        if (authorDisplayName == null || authorDisplayName.isBlank()) {
            authorDisplayName = "Anonymous";
        }
        if (content != null) {
            content = content.trim();
        }
    }
}

