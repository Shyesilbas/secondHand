package com.serhat.secondhand.offer.mapper;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class OfferMapper {

    public OfferDto toDto(Offer offer) {
        Listing listing = offer.getListing();
        User buyer = offer.getBuyer();
        User seller = offer.getSeller();

        return OfferDto.builder()
                .id(offer.getId())
                .listingId(listing != null ? listing.getId() : null)
                .listingTitle(listing != null ? listing.getTitle() : null)
                .listingImageUrl(listing != null ? listing.getImageUrl() : null)
                .buyerId(buyer != null ? buyer.getId() : null)
                .buyerName(buyer != null ? buyer.getName() : null)
                .buyerSurname(buyer != null ? buyer.getSurname() : null)
                .sellerId(seller != null ? seller.getId() : null)
                .sellerName(seller != null ? seller.getName() : null)
                .sellerSurname(seller != null ? seller.getSurname() : null)
                .listingUnitPrice(listing != null && listing.getPrice() != null ? listing.getPrice() : BigDecimal.ZERO)
                .quantity(offer.getQuantity())
                .totalPrice(offer.getTotalPrice())
                .status(offer.getStatus())
                .createdBy(offer.getCreatedBy())
                .parentOfferId(offer.getParentOffer() != null ? offer.getParentOffer().getId() : null)
                .createdAt(offer.getCreatedAt())
                .expiresAt(offer.getExpiresAt())
                .build();
    }

    public Offer toOffer(CreateOfferRequest request, User buyer, Listing listing) {
        return Offer.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(listing.getSeller())
                .quantity(request.getQuantity())
                .totalPrice(request.getTotalPrice())
                .status(OfferStatus.PENDING)
                .createdBy(OfferActor.BUYER)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
    }

    public Offer toCounterOffer(CounterOfferRequest request, Offer previous, OfferActor actor) {
        return Offer.builder()
                .listing(previous.getListing())
                .buyer(previous.getBuyer())
                .seller(previous.getSeller())
                .quantity(request.getQuantity())
                .totalPrice(request.getTotalPrice())
                .status(OfferStatus.PENDING)
                .createdBy(actor)
                .parentOffer(previous)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
    }

}
