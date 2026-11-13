package com.serhat.secondhand.offer.application;

import com.serhat.secondhand.offer.config.OfferConfigProperties;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
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
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OfferService implements IOfferService {

    private final OfferRepository offerRepository;
    private final ListingQueryService listingService;
    private final IUserService userService;
    private final OfferEmailNotificationService offerEmailNotificationService;
    private final OfferValidator offerValidator;
    private final OfferMapper offerMapper;
    private final OfferStockHoldService offerStockHoldService;
    private final OfferConfigProperties offerConfigProperties;

    @Transactional
    public Result<OfferDto> create(Long buyerId, CreateOfferRequest request) {
        Result<User> buyerResult = findUser(buyerId);
        if (buyerResult.isError()) return buyerResult.propagateError();
        User buyer = buyerResult.getData();

        Result<Void> validationResult = offerValidator.validateCreateRequest(request);
        if (validationResult.isError()) return Result.error(validationResult.getMessage(), validationResult.getErrorCode());

        Listing listing = listingService.findById(request.getListingId()).orElse(null);
        if (listing == null) return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);

        Result<Void> listingValidationResult = offerValidator.validateListingForOffer(listing, buyer);
        if (listingValidationResult.isError()) return Result.error(listingValidationResult.getMessage(), listingValidationResult.getErrorCode());

        Result<Void> stockValidationResult = offerValidator.validateListingStockForOffer(listing, request.getQuantity());
        if (stockValidationResult.isError()) return Result.error(stockValidationResult.getMessage(), stockValidationResult.getErrorCode());

        Offer offer = offerMapper.toOffer(request, buyer, listing);
        Offer saved;
        try {
            saved = offerRepository.save(offer);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent create offer conflict for listing {}", request.getListingId(), ex);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }

        offerEmailNotificationService.notifyOfferReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> listMade(Long buyerId, Pageable pageable) {
        return offerRepository.findByBuyerId(buyerId, pageable)
                .map(offerMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<OfferDto> listReceived(Long sellerId, Pageable pageable) {
        return offerRepository.findBySellerId(sellerId, pageable)
                .map(offerMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Result<OfferDto> getByIdForUser(Long userId, UUID offerId) {
        Result<User> userResult = findUser(userId);
        if (userResult.isError()) return userResult.propagateError();

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

        Listing lockedListing = listingService.findByIdWithLock(offer.getListing().getId()).orElse(null);
        if (lockedListing == null) return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);
        offer.setListing(lockedListing);

        Result<Void> eligibilityResult = validateListingForCheckout(offer);
        if (eligibilityResult.isError()) return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());

        if (offerRepository.existsByListingAndStatusAndIdNot(lockedListing, OfferStatus.ACCEPTED, offer.getId())) {
            return Result.error(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        // From here expiresAt is the buyer's payment deadline; OfferScheduler expires the offer after it.
        LocalDateTime paymentDeadline = offerConfigProperties.calculatePaymentDeadline();
        // Hold the stock before changing the offer, so a refused hold leaves the offer untouched (still PENDING).
        Result<Void> holdResult = offerStockHoldService.hold(offer, paymentDeadline);
        if (holdResult.isError()) return Result.error(holdResult.getMessage(), holdResult.getErrorCode());

        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setExpiresAt(paymentDeadline);
        Offer saved;
        try {
            saved = offerRepository.save(offer);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent accept offer conflict for offer {}", offerId, ex);
            offerStockHoldService.releaseNow(offer);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }
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
        Offer saved;
        try {
            saved = offerRepository.save(offer);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent reject offer conflict for offer {}", offerId, ex);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }
        offerEmailNotificationService.notifyRejectedToCreator(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional
    public Result<OfferDto> counter(Long userId, UUID offerId, CounterOfferRequest request) {
        Result<User> userResult = findUser(userId);
        if (userResult.isError()) return userResult.propagateError();
        User user = userResult.getData();

        Result<Void> counterValidationResult = offerValidator.validateCounterRequest(request);
        if (counterValidationResult.isError()) return counterValidationResult.propagateError();

        Result<Offer> previousResult = getOfferForAction(userId, offerId);
        if (previousResult.isError()) return Result.error(previousResult.getMessage(), previousResult.getErrorCode());

        Offer previous = previousResult.getData();

        if (isExpired(previous)) {
            processManualExpiration(previous);
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (requirePending(previous).isError()) return Result.error(OfferErrorCodes.OFFER_NOT_PENDING);

        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(previous.getListing());
        if (eligibilityResult.isError()) {
            return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());
        }

        Result<Void> stockValidationResult = offerValidator.validateListingStockForOffer(previous.getListing(), request.getQuantity());
        if (stockValidationResult.isError()) return Result.error(stockValidationResult.getMessage(), stockValidationResult.getErrorCode());

        previous.setStatus(OfferStatus.REJECTED);
        try {
            offerRepository.save(previous);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent counter-offer parent update conflict for offer {}", offerId, ex);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }

        OfferActor actor = offerValidator.resolveActor(user, previous);
        Offer counter = offerMapper.toCounterOffer(request, previous, actor);
        Offer saved;
        try {
            saved = offerRepository.save(counter);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent counter-offer create conflict for offer {}", offerId, ex);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }

        offerEmailNotificationService.notifyCounterReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }

    @Transactional
    public Result<Offer> getAcceptedOfferForCheckout(Long buyerId, UUID offerId) {
        Offer offer = offerRepository.findByIdAndBuyerId(offerId, buyerId).orElse(null);

        if (offer == null) return Result.error(OfferErrorCodes.OFFER_NOT_FOUND);

        if (isExpired(offer)) {
            return Result.error(OfferErrorCodes.OFFER_EXPIRED);
        }

        if (offer.getStatus() != OfferStatus.ACCEPTED) return Result.error(OfferErrorCodes.OFFER_NOT_ACCEPTED);

        Listing lockedListing = listingService.findByIdWithLock(offer.getListing().getId()).orElse(null);
        if (lockedListing == null) return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);
        offer.setListing(lockedListing);

        Result<Void> eligibilityResult = validateListingForCheckout(offer);
        if (eligibilityResult.isError()) return Result.error(eligibilityResult.getMessage(), eligibilityResult.getErrorCode());

        if (offerRepository.existsByListingAndStatusAndIdNot(lockedListing, OfferStatus.ACCEPTED, offer.getId())) {
            return Result.error(OfferErrorCodes.OFFER_ALREADY_ACCEPTED_FOR_LISTING);
        }

        return Result.success(offer);
    }

    /**
     * One conditional UPDATE instead of a managed save: the version check runs now, not at commit,
     * so a concurrent checkout of the same offer gets a clear 409 instead of a commit-time failure.
     */
    @Transactional
    public Result<Void> markCompleted(Offer offer) {
        if (offer == null) return Result.success();
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            log.warn("Refusing markCompleted for offer {} with status {}", offer.getId(), offer.getStatus());
            return Result.error(OfferErrorCodes.OFFER_NOT_ACCEPTED);
        }
        int updated = offerRepository.completeIfAccepted(offer.getId(), offer.getVersion(), LocalDateTime.now());
        if (updated == 0) {
            log.warn("Concurrent markCompleted conflict for offer {}", offer.getId());
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }
        log.info("Marked offer {} as COMPLETED", offer.getId());
        return Result.success();
    }

    private Result<Offer> getOfferForAction(Long userId, UUID offerId) {
        Result<User> userResult = findUser(userId);
        if (userResult.isError()) return userResult.propagateError();

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

    private Result<User> findUser(Long userId) {
        Result<User> userResult = userService.findById(userId);
        if (userResult.isError()) return Result.error(userResult.getMessage(), userResult.getErrorCode());
        return userResult;
    }

    /** PENDING offers expire at the response deadline, ACCEPTED offers at the payment deadline. */
    private boolean isExpired(Offer offer) {
        return offer != null &&
                OfferStatus.EXPIRABLE.contains(offer.getStatus()) &&
                offer.getExpiresAt() != null &&
                LocalDateTime.now().isAfter(offer.getExpiresAt());
    }

    private void processManualExpiration(Offer offer) {
        boolean wasAccepted = offer.getStatus() == OfferStatus.ACCEPTED;
        offer.setStatus(OfferStatus.EXPIRED);
        try {
            offerRepository.save(offer);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent manual expiration conflict for offer {}", offer.getId(), ex);
            return;
        }
        if (wasAccepted) offerStockHoldService.releaseAfterCommit(offer);
        offerEmailNotificationService.notifyExpiredToBoth(offer);
    }

    private Result<Void> requirePending(Offer offer) {
        return offer.getStatus() == OfferStatus.PENDING ? Result.success() : Result.error(OfferErrorCodes.OFFER_NOT_PENDING);
    }

    private Result<Void> validateListingForCheckout(Offer offer) {
        Result<Void> eligibilityResult = offerValidator.validateListingEligibility(offer.getListing());
        if (eligibilityResult.isError()) {
            return eligibilityResult;
        }
        return offerValidator.validateListingStockForOffer(offer.getListing(), offer.getQuantity());
    }

    @Override
    @Transactional
    public Result<OfferDto> createSellerOffer(Long sellerId, Long buyerId, UUID listingId, java.math.BigDecimal price, int expirationHours) {
        Result<User> sellerResult = findUser(sellerId);
        if (sellerResult.isError()) return sellerResult.propagateError();
        User seller = sellerResult.getData();

        Result<User> buyerResult = findUser(buyerId);
        if (buyerResult.isError()) return buyerResult.propagateError();
        User buyer = buyerResult.getData();

        Listing listing = listingService.findById(listingId).orElse(null);
        if (listing == null) return Result.error(OfferErrorCodes.LISTING_NOT_FOUND);

        Offer offer = Offer.builder()
                .listing(listing)
                .seller(seller)
                .buyer(buyer)
                .quantity(1)
                .totalPrice(price)
                .status(OfferStatus.PENDING)
                .createdBy(com.serhat.secondhand.offer.entity.OfferActor.SELLER)
                .expiresAt(LocalDateTime.now().plusHours(expirationHours > 0 ? expirationHours : 48))
                .build();

        Offer saved;
        try {
            saved = offerRepository.save(offer);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent create seller offer conflict for listing {}", listingId, ex);
            return Result.error(OfferErrorCodes.OFFER_CONCURRENT_MODIFICATION);
        }

        offerEmailNotificationService.notifyCounterReceived(saved);
        return Result.success(offerMapper.toDto(saved));
    }
}
