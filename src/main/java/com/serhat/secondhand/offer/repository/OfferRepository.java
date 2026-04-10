package com.serhat.secondhand.offer.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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

    @EntityGraph(attributePaths = {"listing", "buyer", "seller"})
    Page<Offer> findByBuyerId(Long buyerId, Pageable pageable);

    @EntityGraph(attributePaths = {"listing", "buyer", "seller"})
    Page<Offer> findBySellerId(Long sellerId, Pageable pageable);

}