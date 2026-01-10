package com.serhat.secondhand.favoritelist.entity;

import com.serhat.secondhand.listing.domain.entity.Listing;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_list_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"favorite_list_id", "listing_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"favoriteList", "listing"})
@EntityListeners(AuditingEntityListener.class)
public class FavoriteListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "favorite_list_id", nullable = false)
    private FavoriteList favoriteList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "note", length = 200)
    private String note;

    @CreatedDate
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}

