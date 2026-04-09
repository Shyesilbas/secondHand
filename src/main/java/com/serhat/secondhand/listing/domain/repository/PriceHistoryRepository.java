package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    
    List<PriceHistory> findByListingIdOrderByChangeDateDesc(UUID listingId);
    
    @Query("SELECT ph FROM PriceHistory ph WHERE ph.listing.id = :listingId ORDER BY ph.changeDate DESC LIMIT 1")
    PriceHistory findFirstByListingIdOrderByChangeDateDesc(@Param("listingId") UUID listingId);

    @Query("SELECT ph FROM PriceHistory ph WHERE ph.changeDate >= :since")
    List<PriceHistory> findAllChangedSince(@Param("since") LocalDateTime since);

    boolean existsByListingId(UUID listingId);
}
