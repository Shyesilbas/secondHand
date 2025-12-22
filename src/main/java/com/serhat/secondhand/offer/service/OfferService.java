package com.serhat.secondhand.offer.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OfferService {

    private final OfferRepository offerRepository;
    private final ListingService listingService;
    private final OfferEmailNotificationService offerEmailNotificationService;

    public OfferDto create(User buyer, CreateOfferRequest request) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BusinessException(OfferErrorCodes.INVALID_QUANTITY);
        }
        if (request.getTotalPrice() == null || request.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OfferErrorCodes.INVALID_TOTAL_PRICE);
        }

        Listing listing = listingService.findById(request.getListingId())
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.LISTING_NOT_FOUND));

        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessException(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            throw new BusinessException(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
        if (listing.getSeller() != null && listing.getSeller().getId() != null && listing.getSeller().getId().equals(buyer.getId())) {
            throw new BusinessException(OfferErrorCodes.SELF_OFFER_NOT_ALLOWED);
        }

        Offer offer = Offer.builder()
                .listing(listing)
                .buyer(buyer)
                .seller(listing.getSeller())
                .quantity(request.getQuantity())
                .totalPrice(request.getTotalPrice())
                .status(OfferStatus.PENDING)
                .createdBy(OfferActor.BUYER)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyOfferReceived(saved);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OfferDto> listMade(User buyer) {
        return offerRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDto> listReceived(User seller) {
        return offerRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfferDto getByIdForUser(User user, UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));
        if (!isBuyerOrSeller(user, offer)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }
        return toDto(offer);
    }

    public OfferDto accept(User seller, UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));

        if (!isBuyerOrSeller(seller, offer) || !isReceiver(seller, offer)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }

        expireIfNeeded(offer);
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_PENDING);
        }

        validateListingEligibility(offer);
        if (offerRepository.existsByListingAndStatusAndIdNot(offer.getListing(), OfferStatus.ACCEPTED, offer.getId())) {
            throw new BusinessException(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyAcceptedToCreator(saved);
        return toDto(saved);
    }

    public OfferDto reject(User user, UUID offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));

        if (!isBuyerOrSeller(user, offer) || !isReceiver(user, offer)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }

        expireIfNeeded(offer);
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_PENDING);
        }

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyRejectedToCreator(saved);
        return toDto(saved);
    }

    public OfferDto counter(User user, UUID offerId, CounterOfferRequest request) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BusinessException(OfferErrorCodes.INVALID_QUANTITY);
        }
        if (request.getTotalPrice() == null || request.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(OfferErrorCodes.INVALID_TOTAL_PRICE);
        }

        Offer previous = offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));

        if (!isBuyerOrSeller(user, previous) || !isReceiver(user, previous)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }

        expireIfNeeded(previous);
        if (previous.getStatus() != OfferStatus.PENDING) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_PENDING);
        }

        validateListingEligibility(previous);
        previous.setStatus(OfferStatus.REJECTED);
        offerRepository.save(previous);

        OfferActor actor = resolveActor(user, previous);
        Offer counter = Offer.builder()
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

        Offer saved = offerRepository.save(counter);
        offerEmailNotificationService.notifyCounterReceived(saved);
        return toDto(saved);
    }

    public Offer getAcceptedOfferForCheckout(User buyer, UUID offerId) {
        Offer offer = offerRepository.findByIdAndBuyer(offerId, buyer)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));

        expireIfNeeded(offer);
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ACCEPTED);
        }
        validateListingEligibility(offer);
        return offer;
    }

    public void markCompleted(Offer offer) {
        if (offer == null) {
            return;
        }
        if (offer.getStatus() == OfferStatus.ACCEPTED) {
            offer.setStatus(OfferStatus.COMPLETED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyCompletedToBoth(offer);
        }
    }

    private void expireIfNeeded(Offer offer) {
        if (offer == null) {
            return;
        }
        if (offer.getStatus() == OfferStatus.EXPIRED || offer.getStatus() == OfferStatus.REJECTED || offer.getStatus() == OfferStatus.COMPLETED) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        if (offer.getExpiresAt() != null && now.isAfter(offer.getExpiresAt())) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyExpiredToBoth(offer);
            throw new BusinessException(OfferErrorCodes.OFFER_EXPIRED);
        }
    }

    private boolean isBuyerOrSeller(User user, Offer offer) {
        if (user == null || offer == null) {
            return false;
        }
        Long userId = user.getId();
        return (offer.getBuyer() != null && offer.getBuyer().getId() != null && offer.getBuyer().getId().equals(userId))
                || (offer.getSeller() != null && offer.getSeller().getId() != null && offer.getSeller().getId().equals(userId));
    }

    private boolean isReceiver(User user, Offer offer) {
        if (user == null || offer == null || offer.getCreatedBy() == null) {
            return false;
        }
        OfferActor actor = resolveActor(user, offer);
        if (actor == null) {
            return false;
        }
        return offer.getCreatedBy() != actor;
    }

    private OfferActor resolveActor(User user, Offer offer) {
        if (user == null || offer == null) {
            return null;
        }
        Long userId = user.getId();
        if (offer.getBuyer() != null && offer.getBuyer().getId() != null && offer.getBuyer().getId().equals(userId)) {
            return OfferActor.BUYER;
        }
        if (offer.getSeller() != null && offer.getSeller().getId() != null && offer.getSeller().getId().equals(userId)) {
            return OfferActor.SELLER;
        }
        return null;
    }

    private void validateListingEligibility(Offer offer) {
        if (offer == null || offer.getListing() == null) {
            throw new BusinessException(OfferErrorCodes.LISTING_NOT_FOUND);
        }
        Listing listing = offer.getListing();
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new BusinessException(OfferErrorCodes.LISTING_NOT_ACTIVE);
        }
        if (listing.getListingType() == ListingType.VEHICLE || listing.getListingType() == ListingType.REAL_ESTATE) {
            throw new BusinessException(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);
        }
    }

    private OfferDto toDto(Offer offer) {
        if (offer == null) {
            return null;
        }
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
                .listingUnitPrice(listing.getPrice() != null ? listing.getPrice() : BigDecimal.ZERO)
                .quantity(offer.getQuantity())
                .totalPrice(offer.getTotalPrice())
                .status(offer.getStatus())
                .createdBy(offer.getCreatedBy())
                .parentOfferId(offer.getParentOffer() != null ? offer.getParentOffer().getId() : null)
                .createdAt(offer.getCreatedAt())
                .expiresAt(offer.getExpiresAt())
                .build();
    }
}

