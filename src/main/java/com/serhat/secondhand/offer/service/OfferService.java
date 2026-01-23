package com.serhat.secondhand.offer.service;

import com.serhat.secondhand.core.result.Result;
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

    public Result<OfferDto> create(User buyer, CreateOfferRequest request) {
        Result<Void> validationResult = offerValidator.validateCreateRequest(request);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        Listing listing = listingService.findById(request.getListingId())
                .orElse(null);
        
        if (listing == null) {
            return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);
        }

        Result<Void> listingValidationResult = offerValidator.validateListingForOffer(listing, buyer);
        if (listingValidationResult.isError()) {
            return Result.error(listingValidationResult.getMessage(), listingValidationResult.getErrorCode());
        }

        Offer offer = offerMapper.toOffer(request, buyer, listing);
        Offer saved = offerRepository.save(offer);

        offerEmailNotificationService.notifyOfferReceived(saved);
        return Result.success(offerMapper.toDto(saved));
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

    public Result<OfferDto> getByIdForUser(User user, UUID offerId) {
        Result<Offer> offerResult = findOffer(offerId);
        if (offerResult.isError()) {
            return Result.error(offerResult.getMessage(), offerResult.getErrorCode());
        }
        
        Offer offer = offerResult.getData();
        if (!offerValidator.isBuyerOrSeller(user, offer)) {
            return Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }
        expireIfNeeded(offer, false);
        return Result.success(offerMapper.toDto(offer));
    }

    public Result<OfferDto> accept(User seller, UUID offerId) {
        Result<Offer> offerResult = getOfferForAction(seller, offerId);
        if (offerResult.isError()) {
            return Result.error(offerResult.getMessage(), offerResult.getErrorCode());
        }

        Offer offer = offerResult.getData();
        Result<Void> expireResult = expireIfNeeded(offer, true);
        if (expireResult.isError()) {
            return Result.error(expireResult.getMessage(), expireResult.getErrorCode());
        }
        
        Result<Void> pendingResult = requirePending(offer);
        if (pendingResult.isError()) {
            return Result.error(pendingResult.getMessage(), pendingResult.getErrorCode());
        }
        
        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(offer.getListing());
        if (eligibilityResult.isError()) {
            return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());
        }

        if (offerRepository.existsByListingAndStatusAndIdNot(
                offer.getListing(), OfferStatus.ACCEPTED, offer.getId())) {
            return Result.error(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyAcceptedToCreator(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    public Result<OfferDto> reject(User user, UUID offerId) {
        Result<Offer> offerResult = getOfferForAction(user, offerId);
        if (offerResult.isError()) {
            return Result.error(offerResult.getMessage(), offerResult.getErrorCode());
        }

        Offer offer = offerResult.getData();
        Result<Void> expireResult = expireIfNeeded(offer, true);
        if (expireResult.isError()) {
            return Result.error(expireResult.getMessage(), expireResult.getErrorCode());
        }
        
        Result<Void> pendingResult = requirePending(offer);
        if (pendingResult.isError()) {
            return Result.error(pendingResult.getMessage(), pendingResult.getErrorCode());
        }

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyRejectedToCreator(saved);
        return Result.success(offerMapper.toDto(saved));
    }


    public Result<OfferDto> counter(User user, UUID offerId, CounterOfferRequest request) {
        Result<Void> validationResult = offerValidator.validateCounterRequest(request);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        Result<Offer> previousResult = getOfferForAction(user, offerId);
        if (previousResult.isError()) {
            return Result.error(previousResult.getMessage(), previousResult.getErrorCode());
        }
        
        Offer previous = previousResult.getData();
        Result<Void> expireResult = expireIfNeeded(previous, true);
        if (expireResult.isError()) {
            return Result.error(expireResult.getMessage(), expireResult.getErrorCode());
        }
        
        Result<Void> pendingResult = requirePending(previous);
        if (pendingResult.isError()) {
            return Result.error(pendingResult.getMessage(), pendingResult.getErrorCode());
        }
        
        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(previous.getListing());
        if (eligibilityResult.isError()) {
            return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());
        }

        previous.setStatus(OfferStatus.REJECTED);
        offerRepository.save(previous);

        OfferActor actor = offerValidator.resolveActor(user, previous);
        Offer counter = offerMapper.toCounterOffer(request, previous, actor);
        Offer saved = offerRepository.save(counter);

        offerEmailNotificationService.notifyCounterReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    public Result<Offer> getAcceptedOfferForCheckout(User buyer, UUID offerId) {
        Offer offer = offerRepository.findByIdAndBuyer(offerId, buyer)
                .orElse(null);
        
        if (offer == null) {
            return Result.error(OfferErrorCodes.OFFER_NOT_FOUND);
        }

        Result<Void> expireResult = expireIfNeeded(offer, true);
        if (expireResult.isError()) {
            return Result.error(expireResult.getMessage(), expireResult.getErrorCode());
        }
        
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            return Result.error(OfferErrorCodes.OFFER_NOT_ACCEPTED);
        }
        
        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(offer.getListing());
        if (eligibilityResult.isError()) {
            return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());
        }
        
        return Result.success(offer);
    }


    public void markCompleted(Offer offer) {
        if (offer != null && offer.getStatus() == OfferStatus.ACCEPTED) {
            offer.setStatus(OfferStatus.COMPLETED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyCompletedToBoth(offer);
        }
    }

    private Result<Offer> getOfferForAction(User user, UUID offerId) {
        Result<Offer> offerResult = findOffer(offerId);
        if (offerResult.isError()) {
            return offerResult;
        }
        
        Offer offer = offerResult.getData();
        if (!offerValidator.isBuyerOrSeller(user, offer) || !offerValidator.isReceiver(user, offer)) {
            return Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }
        return Result.success(offer);
    }

    private Result<Offer> findOffer(UUID offerId) {
        return offerRepository.findById(offerId)
                .map(Result::success)
                .orElse(Result.error(OfferErrorCodes.OFFER_NOT_FOUND));
    }

    private Result<Void> expireIfNeeded(Offer offer, boolean throwIfExpired) {
        if (offer == null || offer.getStatus() != OfferStatus.PENDING) {
            return Result.success();
        }
        if (offer.getExpiresAt() != null && LocalDateTime.now().isAfter(offer.getExpiresAt())) {
            offer.setStatus(OfferStatus.EXPIRED);
            offerRepository.save(offer);
            offerEmailNotificationService.notifyExpiredToBoth(offer);
            
            if (throwIfExpired) {
                return Result.error(OfferErrorCodes.OFFER_EXPIRED);
            }
            return Result.success();
        }
        return Result.success();
    }


    private Result<Void> requirePending(Offer offer) {
        if (offer.getStatus() != OfferStatus.PENDING) {
            return Result.error(OfferErrorCodes.OFFER_NOT_PENDING);
        }
        return Result.success();
    }
}
