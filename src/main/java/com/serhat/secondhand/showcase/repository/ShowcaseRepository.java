package com.serhat.secondhand.showcase.repository;

import com.serhat.secondhand.showcase.Showcase;
import com.serhat.secondhand.showcase.ShowcaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShowcaseRepository extends JpaRepository<Showcase, UUID> {
    
    /** Süresi dolmuş aktif vitrinler: endDate <= an */
    List<Showcase> findByStatusAndEndDateLessThanEqual(ShowcaseStatus status, LocalDateTime now);
    
    List<Showcase> findByUserIdAndStatus(Long userId, ShowcaseStatus status);
    
    @Query("SELECT s FROM Showcase s WHERE s.status = :status AND s.endDate > :currentTime ORDER BY s.createdAt DESC")
    List<Showcase> findActiveShowcases(@Param("status") ShowcaseStatus status, @Param("currentTime") LocalDateTime currentTime);

    @Query(
            value = "SELECT s FROM Showcase s WHERE s.status = :status AND s.endDate > :currentTime ORDER BY s.createdAt DESC",
            countQuery = "SELECT COUNT(s) FROM Showcase s WHERE s.status = :status AND s.endDate > :currentTime"
    )
    Page<Showcase> findActiveShowcasesPage(
            @Param("status") ShowcaseStatus status,
            @Param("currentTime") LocalDateTime currentTime,
            Pageable pageable
    );
    
    @Query("SELECT s FROM Showcase s WHERE s.listing.id = :listingId AND s.status = :status")
    List<Showcase> findByListingIdAndStatus(@Param("listingId") UUID listingId, @Param("status") ShowcaseStatus status);

    @Query("SELECT s FROM Showcase s LEFT JOIN FETCH s.listing l LEFT JOIN FETCH l.seller WHERE s.user.id = :userId AND s.status = :status ORDER BY s.createdAt DESC")
    List<Showcase> findByUserIdAndStatusWithListing(@Param("userId") Long userId, @Param("status") ShowcaseStatus status);
}
