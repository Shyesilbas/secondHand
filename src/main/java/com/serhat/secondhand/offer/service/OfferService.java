package com.serhat.secondhand.offer.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.offer.dto.CounterOfferRequest;
import com.serhat.secondhand.offer.dto.CreateOfferRequest;
import com.serhat.secondhand.offer.dto.OfferDto;
import com.serhat.secondhand.offer.email.OfferEmailNotificationService;
import com.serhat.secondhand.offer.entity.Offer;
import com.serhat.secondhand.offer.entity.OfferActor;
import com.serhat.secondhand.offer.entity.OfferStatus;
import com.serhat.secondhand.offer.mapper.OfferMapper;
import com.serhat.secondhand.offer.repository.OfferRepository;
import com.serhat.secondhand.offer.util.OfferErrorCodes;
import com.serhat.secondhand.offer.validator.OfferValidator;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final OfferValidator offerValidator;
    private final OfferMapper offerMapper;

    public OfferDto create(User buyer, CreateOfferRequest request) {
        offerValidator.validateCreateRequest(request);

        Listing listing = listingService.findById(request.getListingId())
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.LISTING_NOT_FOUND));

        offerValidator.validateListingForOffer(listing, buyer);

        Offer offer = offerMapper.toOffer(request, buyer, listing);
        Offer saved = offerRepository.save(offer);

        offerEmailNotificationService.notifyOfferReceived(saved);
        return offerMapper.toDto(saved);
    }

    public List<OfferDto> listMade(User buyer) {
        return offerRepository.findByBuyerOrderByCreatedAtDesc(buyer).stream()
                .peek(o -> expireIfNeeded(o, false))
                .map(offerMapper::toDto)
                .toList();
    }

    public List<OfferDto> listReceived(User seller) {
        return offerRepository.findBySellerOrderByCreatedAtDesc(seller).stream()
                .peek(o -> expireIfNeeded(o, false))
                .map(offerMapper::toDto)
                .toList();
    }

    public OfferDto getByIdForUser(User user, UUID offerId) {
        Offer offer = findOffer(offerId);
        if (!offerValidator.isBuyerOrSeller(user, offer)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }
        expireIfNeeded(offer, false);
        return offerMapper.toDto(offer);
    }

    public OfferDto accept(User seller, UUID offerId) {
        Offer offer = getOfferForAction(seller, offerId);

        expireIfNeeded(offer, true);
        requirePending(offer);
        offerValidator.validateListingEligibility(offer.getListing());

        if (offerRepository.existsByListingAndStatusAndIdNot(
                offer.getListing(), OfferStatus.ACCEPTED, offer.getId())) {
            throw new BusinessException(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyAcceptedToCreator(saved);
        return offerMapper.toDto(saved);
    }

    public OfferDto reject(User user, UUID offerId) {
        Offer offer = getOfferForAction(user, offerId);

        expireIfNeeded(offer, true);
        requirePending(offer);

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyRejectedToCreator(saved);
        return offerMapper.toDto(saved);
    }


    public OfferDto counter(User user, UUID offerId, CounterOfferRequest request) {
        offerValidator.validateCounterRequest(request);

        Offer previous = getOfferForAction(user, offerId);
        expireIfNeeded(previous, true);
        requirePending(previous);
        offerValidator.validateListingEligibility(previous.getListing());

        previous.setStatus(OfferStatus.REJECTED);
        offerRepository.save(previous);

        OfferActor actor = offerValidator.resolveActor(user, previous);
        Offer counter = offerMapper.toCounterOffer(request, previous, actor);
        Offer saved = offerRepository.save(counter);

        offerEmailNotificationService.notifyCounterReceived(saved);
        return offerMapper.toDto(saved);
    }

    public Offer getAcceptedOfferForCheckout(User buyer, UUID offerId) {
        Offer offer = offerRepository.findByIdAndBuyer(offerId, buyer)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));

        expireIfNeeded(offer, true);
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ACCEPTED);
        }
        offerValidator.validateListingEligibility(offer.getListing());
        return offer;
    }


    public void markCompleted(Offer offer) {
        if (offer != null && offer.getStatus() == OfferStatus.ACCEPTED) {
            offer.setStatus(OfferStatus.COMPLETED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyCompletedToBoth(offer);
        }
    }

    private Offer getOfferForAction(User user, UUID offerId) {
        Offer offer = findOffer(offerId);
        if (!offerValidator.isBuyerOrSeller(user, offer) || !offerValidator.isReceiver(user, offer)) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }
        return offer;
    }

    private Offer findOffer(UUID offerId) {
        return offerRepository.findById(offerId)
                .orElseThrow(() -> new BusinessException(OfferErrorCodes.OFFER_NOT_FOUND));
    }

    private boolean expireIfNeeded(Offer offer, boolean throwIfExpired) {
        if (offer == null || offer.getStatus() != OfferStatus.PENDING) {
            return false;
        }
        if (offer.getExpiresAt() != null && LocalDateTime.now().isAfter(offer.getExpiresAt())) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyExpiredToBoth(offer);
            
            if (throwIfExpired) {
                throw new BusinessException(OfferErrorCodes.OFFER_EXPIRED);
            }
            return true;
        }
        return false;
    }


    private void requirePending(Offer offer) {
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BusinessException(OfferErrorCodes.OFFER_NOT_PENDING);
        }
    }
}
