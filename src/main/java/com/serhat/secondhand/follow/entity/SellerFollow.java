package com.serhat.secondhand.follow.entity;

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

@Entity
@Table(name = "seller_follows",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_seller_follows_follower_followed", columnNames = {"follower_id", "followed_id"})
    },
    indexes = {
        @Index(name = "idx_seller_follows_followed_created", columnList = "followed_id, created_at"),
        @Index(name = "idx_seller_follows_follower_created", columnList = "follower_id, created_at")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@SQLDelete(sql = "UPDATE seller_follows SET deleted_at = now() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class SellerFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "followed_id", nullable = false)
    private User followed;

    @Column(name = "notify_on_new_listing", nullable = false)
    @Builder.Default
    private boolean notifyOnNewListing = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public SellerFollow(User follower, User followed) {
        this.follower = follower;
        this.followed = followed;
        this.notifyOnNewListing = true;
    }
}

