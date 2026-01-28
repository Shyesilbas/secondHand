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

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Listing l WHERE l.id = :id")
    Optional<Listing> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.id = :id")
    Optional<Listing> findByIdWithSeller(@Param("id") UUID id);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.status = :status")
    Page<Listing> findByStatus(@Param("status") ListingStatus status, Pageable pageable);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.seller.id = :sellerId")
    Page<Listing> findBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.seller.id = :sellerId AND l.status = :status")
    List<Listing> findBySellerIdAndStatus(@Param("sellerId") Long sellerId, @Param("status") ListingStatus status);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.seller.id = :sellerId AND l.listingType = :listingType")
    Page<Listing> findBySellerIdAndListingType(@Param("sellerId") Long sellerId, @Param("listingType") ListingType listingType, Pageable pageable);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller " +
            "WHERE (LOWER(l.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "OR LOWER(l.listingNo) LIKE LOWER(CONCAT('%', :listingNo, '%'))) " +
            "AND l.status = :status")
    Page<Listing> findBySearch(@Param("title") String title,
                               @Param("listingNo") String listingNo,
                               @Param("status") ListingStatus status,
                               Pageable pageable);

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
    @Query("update Listing l set l.quantity = l.quantity + :qty where l.id = :id and l.quantity is not null")
    int incrementQuantity(@Param("id") UUID id, @Param("qty") int qty);

    @Query("SELECT l FROM Listing l JOIN FETCH l.seller WHERE l.id IN :ids")
    List<Listing> findAllByIdIn(@Param("ids") Collection<UUID> ids);

    long countBySellerIdAndStatus(Long sellerId, ListingStatus status);

    long countBySellerId(Long sellerId);

    List<Listing> findByStatus(ListingStatus status);
}