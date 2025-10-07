package com.serhat.secondhand.showcase;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShowcaseRepository extends JpaRepository<Showcase, UUID> {
    
    List<Showcase> findByStatusAndEndDateAfter(ShowcaseStatus status, LocalDateTime endDate);
    
    List<Showcase> findByUserIdAndStatus(Long userId, ShowcaseStatus status);
    
    @Query("SELECT s FROM Showcase s LEFT JOIN FETCH s.listing l LEFT JOIN FETCH l.seller WHERE s.status = :status AND s.endDate > :currentTime ORDER BY s.createdAt DESC")
    List<Showcase> findActiveShowcases(@Param("status") ShowcaseStatus status, @Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT s FROM Showcase s WHERE s.listing.id = :listingId AND s.status = :status")
    List<Showcase> findByListingIdAndStatus(@Param("listingId") UUID listingId, @Param("status") ShowcaseStatus status);
}
