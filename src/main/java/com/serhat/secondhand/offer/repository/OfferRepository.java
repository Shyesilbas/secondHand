package com.serhat.secondhand.offer.repository;

import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findByBuyerOrderByCreatedAtDesc(User buyer);

    List<Offer> findBySellerOrderByCreatedAtDesc(User seller);

    Optional<Offer> findByIdAndSeller(UUID id, User seller);

    Optional<Offer> findByIdAndBuyer(UUID id, User buyer);

    boolean existsByListingAndStatusAndIdNot(Listing listing, OfferStatus status, UUID id);
}

