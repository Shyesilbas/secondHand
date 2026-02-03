package com.serhat.secondhand.forum.entity;

import com.serhat.secondhand.forum.entity.enums.ForumCategory;
import com.serhat.secondhand.forum.entity.enums.ForumAuthorVisibility;
import com.serhat.secondhand.forum.entity.enums.ForumThreadStatus;
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
@Table(name = "forum_thread")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 32)
    private ForumCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ForumThreadStatus status;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_visibility", nullable = false, length = 32)
    private ForumAuthorVisibility authorVisibility;

    @Column(name = "author_display_name", nullable = false, length = 120)
    private String authorDisplayName;

    @Column(name = "total_likes", nullable = false)
    private long totalLikes;

    @Column(name = "total_dislikes", nullable = false)
    private long totalDislikes;

    @Column(name = "keywords", nullable = false, columnDefinition = "text")
    private String keywordsJson;

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
        if (status == null) {
            status = ForumThreadStatus.OPEN;
        }
        if (authorVisibility == null) {
            authorVisibility = ForumAuthorVisibility.ANONYMOUS;
        }
        if (authorDisplayName == null || authorDisplayName.isBlank()) {
            authorDisplayName = "Anonymous";
        }
        if (keywordsJson == null || keywordsJson.isBlank()) {
            keywordsJson = "[]";
        }
    }
}

