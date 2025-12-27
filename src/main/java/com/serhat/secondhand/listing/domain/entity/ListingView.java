package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listing_views", indexes = {
    @Index(name = "idx_listing_view_listing", columnList = "listing_id"),
    @Index(name = "idx_listing_view_user", columnList = "user_id"),
    @Index(name = "idx_listing_view_session", columnList = "session_id"),
    @Index(name = "idx_listing_view_date", columnList = "viewed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", length = 255)
    private String sessionId;

    @Column(name = "ip_hash", length = 64, nullable = false)
    private String ipHash;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    void onCreate() {
        if (viewedAt == null) {
            viewedAt = LocalDateTime.now();
        }
    }
}

