package com.serhat.secondhand.offer.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findAllByStatusAndExpiresAtBefore(OfferStatus status, LocalDateTime now);

    Optional<Offer> findByIdAndBuyerId(UUID id, Long buyerId);

    boolean existsByListingAndStatusAndIdNot(Listing listing, OfferStatus status, UUID id);

    @Query("SELECT o FROM Offer o " +
            "JOIN FETCH o.listing " +
            "JOIN FETCH o.buyer " +
            "JOIN FETCH o.listing.seller " +
            "WHERE o.buyer.id = :buyerId")
    Page<Offer> findByBuyerIdWithDetails(@Param("buyerId") Long buyerId, Pageable pageable);

    @Query("SELECT o FROM Offer o " +
            "JOIN FETCH o.listing " +
            "JOIN FETCH o.buyer " +
            "JOIN FETCH o.listing.seller " +
            "WHERE o.listing.seller.id = :sellerId")
    Page<Offer> findBySellerIdWithDetails(@Param("sellerId") Long sellerId, Pageable pageable);

}