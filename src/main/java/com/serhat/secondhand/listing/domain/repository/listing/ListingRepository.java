package com.serhat.secondhand.listing.domain.repository.listing;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Listing l WHERE l.id = :id")
    Optional<Listing> findByIdWithLock(@Param("id") UUID id);

    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findByListingType(ListingType listingType);

    List<Listing> findByListingTypeAndStatus(ListingType listingType, ListingStatus status);

    List<Listing> findByListingTypeOrderByCreatedAtDesc(ListingType listingType);


    List<Listing> findBySellerId(Long sellerId);

    Page<Listing> findBySellerId(Long sellerId, Pageable pageable);

    List<Listing> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Listing> findBySellerIdAndStatus(Long sellerId, ListingStatus status);

    Page<Listing> findBySellerIdAndListingType(Long sellerId, ListingType listingType, Pageable pageable);


    Page<Listing> findByTitleContainingIgnoreCaseOrListingNoContainingIgnoreCaseAndStatus(
            String title, String listingNo, ListingStatus status, Pageable pageable
    );

    Optional<Listing> findByListingNo(String listingNo);


    @Query("SELECT COUNT(l) FROM Listing l")
    long getTotalListingCount();

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.status = :status")
    long getListingCountByStatus(ListingStatus status);

    @Query("SELECT COUNT(DISTINCT l.seller.id) FROM Listing l WHERE l.status = :status")
    long getActiveSellerCount(ListingStatus status);

    @Query("SELECT COUNT(DISTINCT l.city) FROM Listing l WHERE l.status = :status AND l.city IS NOT NULL")
    long getActiveCityCount(ListingStatus status);

    @Query("SELECT l.listingType, COUNT(l) FROM Listing l WHERE l.status = :status GROUP BY l.listingType")
    List<Object[]> getActiveCountsByType(ListingStatus status);


    @Modifying
    @Query("update Listing l set l.quantity = l.quantity - :qty where l.id = :id and l.quantity is not null and l.quantity >= :qty")
    int decrementQuantityIfEnough(@Param("id") UUID id, @Param("qty") int qty);

    @Modifying
    @Query("update Listing l set l.quantity = l.quantity + :qty where l.id = :id and l.quantity is not null")
    int incrementQuantity(@Param("id") UUID id, @Param("qty") int qty);


    @Query("SELECT COUNT(l) FROM Listing l WHERE l.seller.id = :sellerId AND l.createdAt BETWEEN :startDate AND :endDate")
    long countBySellerIdAndCreatedAtBetween(@Param("sellerId") Long sellerId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT l.status, COUNT(l) FROM Listing l WHERE l.seller.id = :sellerId AND l.createdAt BETWEEN :startDate AND :endDate GROUP BY l.status")
    List<Object[]> countBySellerIdAndStatusGrouped(@Param("sellerId") Long sellerId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}