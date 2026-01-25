package com.serhat.secondhand.offer.repository;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Offer> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<Offer> findByIdAndSellerId(UUID id, Long sellerId);

    Optional<Offer> findByIdAndBuyerId(UUID id, Long buyerId);

    boolean existsByListingAndStatusAndIdNot(Listing listing, OfferStatus status, UUID id);

}