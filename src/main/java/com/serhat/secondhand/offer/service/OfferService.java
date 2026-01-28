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
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OfferService {

    private final OfferRepository offerRepository;
    private final ListingService listingService;
    private final UserService userService;
    private final OfferEmailNotificationService offerEmailNotificationService;
    private final OfferValidator offerValidator;
    private final OfferMapper offerMapper;

    @Transactional
    public Result<OfferDto> create(Long buyerId, CreateOfferRequest request) {
        var userResult = userService.findById(buyerId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User buyer = userResult.getData();

        Result<Void> validationResult = offerValidator.validateCreateRequest(request);
        if (validationResult.isError()) return Result.error(validationResult.getMessage(), validationResult.getErrorCode());

        Listing listing = listingService.findById(request.getListingId()).orElse(null);
        if (listing == null) return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);

        Result<Void> listingValidationResult = offerValidator.validateListingForOffer(listing, buyer);
        if (listingValidationResult.isError()) return Result.error(listingValidationResult.getMessage(), listingValidationResult.getErrorCode());

        Offer offer = offerMapper.toOffer(request, buyer, listing);
        Offer saved = offerRepository.save(offer);

        offerEmailNotificationService.notifyOfferReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> listMade(Long buyerId, Pageable pageable) {
        return offerRepository.findByBuyerIdWithDetails(buyerId, pageable)
                .map(offerMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> listReceived(Long sellerId, Pageable pageable) {
        return offerRepository.findBySellerIdWithDetails(sellerId, pageable)
                .map(offerMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Result<OfferDto> getByIdForUser(Long userId, UUID offerId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());

        Result<Offer> offerResult = findOffer(offerId);
        if (offerResult.isError()) return Result.error(offerResult.getMessage(), offerResult.getErrorCode());

        Offer offer = offerResult.getData();
        if (!offerValidator.isBuyerOrSeller(userResult.getData(), offer)) {
            return Result.error(OfferErrorCodes.OFFER_NOT_ALLOWED);
        }

        return Result.success(offerMapper.toDto(offer));
    }

    @Transactional
    public Result<OfferDto> accept(Long sellerId, UUID offerId) {
        Result<Offer> offerResult = getOfferForAction(sellerId, offerId);
        if (offerResult.isError()) return Result.error(offerResult.getMessage(), offerResult.getErrorCode());

        Offer offer = offerResult.getData();

        if (isExpired(offer)) {
            processManualExpiration(offer);
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (requirePending(offer).isError()) return Result.error(OfferErrorCodes.OFFER_NOT_PENDING);

        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(offer.getListing());
        if (eligibilityResult.isError()) return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());

        if (offerRepository.existsByListingAndStatusAndIdNot(offer.getListing(), OfferStatus.ACCEPTED, offer.getId())) {
            return Result.error(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        offer.setStatus(OfferStatus.ACCEPTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyAcceptedToCreator(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional
    public Result<OfferDto> reject(Long userId, UUID offerId) {
        Result<Offer> offerResult = getOfferForAction(userId, offerId);
        if (offerResult.isError()) return Result.error(offerResult.getMessage(), offerResult.getErrorCode());

        Offer offer = offerResult.getData();

        if (isExpired(offer)) {
            processManualExpiration(offer);
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (requirePending(offer).isError()) return Result.error(OfferErrorCodes.OFFER_NOT_PENDING);

        offer.setStatus(OfferStatus.REJECTED);
        Offer saved = offerRepository.save(offer);
        offerEmailNotificationService.notifyRejectedToCreator(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional
    public Result<OfferDto> counter(Long userId, UUID offerId, CounterOfferRequest request) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());
        User user = userResult.getData();

        if (offerValidator.validateCounterRequest(request).isError()) return Result.error(OfferErrorCodes.INVALID_TOTAL_PRICE);

        Result<Offer> previousResult = getOfferForAction(userId, offerId);
        if (previousResult.isError()) return Result.error(previousResult.getMessage(), previousResult.getErrorCode());

        Offer previous = previousResult.getData();

        if (isExpired(previous)) {
            processManualExpiration(previous);
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (requirePending(previous).isError()) return Result.error(OfferErrorCodes.OFFER_NOT_PENDING);

        if (offerValidator.validateListingEligibility(previous.getListing()).isError())
            return Result.error(OfferErrorCodes.LISTING_TYPE_NOT_ALLOWED);

        previous.setStatus(OfferStatus.REJECTED);
        offerRepository.save(previous);

        OfferActor actor = offerValidator.resolveActor(user, previous);
        Offer counter = offerMapper.toCounterOffer(request, previous, actor);
        Offer saved = offerRepository.save(counter);

        offerEmailNotificationService.notifyCounterReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional(readOnly = true)
    public Result<Offer> getAcceptedOfferForCheckout(Long buyerId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndBuyerId(offerId, buyerId).orElse(null);

        if (offer == null) return Result.error(OfferErrorCodes.OFFER_NOT_FOUND);

        if (isExpired(offer)) {
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (offer.getStatus() != OfferStatus.ACCEPTED) return Result.error(OfferErrorCodes.OFFER_NOT_ACCEPTED);

        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(offer.getListing());
        if (eligibilityResult.isError()) return Result.error(eligibilityResult.getErrorCode(), eligibilityResult.getMessage());

        return Result.success(offer);
    }

    @Transactional
    public void markCompleted(Offer offer) {
        if (offer == null) return;
        log.info("Marking offer {} as COMPLETED", offer.getId());
        offer.setStatus(OfferStatus.COMPLETED);
        offerRepository.save(offer);
    }


    private Result<Offer> getOfferForAction(Long userId, UUID offerId) {
        var userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getErrorCode(), userResult.getMessage());

        Result<Offer> offerResult = findOffer(offerId);
        if (offerResult.isError()) return offerResult;

        Offer offer = offerResult.getData();
        User user = userResult.getData();

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

    private boolean isExpired(Offer offer) {
        return offer != null &&
                offer.getStatus() == OfferStatus.PENDING &&
                offer.getExpiresAt() != null &&
                LocalDateTime.now().isAfter(offer.getExpiresAt());
    }

    private void processManualExpiration(Offer offer) {
        offer.setStatus(OfferStatus.EXPIRED);
        offerRepository.save(offer);
        offerEmailNotificationService.notifyExpiredToBoth(offer);
    }

    private Result<Void> requirePending(Offer offer) {
        return offer.getStatus() == OfferStatus.PENDING ? Result.success() : Result.error(OfferErrorCodes.OFFER_NOT_PENDING);
    }
}