package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.transaction.annotation.Transactional
@org.springframework.cache.annotation.CacheConfig(cacheNames = "userProfile")
public class ListingCommandService {

    private final ListingRepository listingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ListingValidationService listingValidationService;
    private final ListingConfig listingConfig;
    private final PriceHistoryService priceHistoryService;

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public void publish(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listing.publish();
        listingRepository.save(listing);
        eventPublisher.publishEvent(new NewListingCreatedEvent(this, listing));
        log.info("Listing {} published", listingId);
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public void reactivate(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listing.reactivate();
        listingRepository.save(listing);
        log.info("Listing {} reactivated", listingId);
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public void deactivate(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listing.deactivate();
        listingRepository.save(listing);
        log.info("Listing {} deactivated", listingId);
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public void markAsSold(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listing.markAsSold();
        listingRepository.save(listing);
        log.info("Listing {} marked as sold", listingId);
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> deleteListing(UUID listingId, Long userId) {
        Result<Void> ownershipResult = listingValidationService.validateOwnership(listingId, userId);
        if (ownershipResult.isError()) return ownershipResult;

        listingRepository.deleteById(listingId);
        return Result.success();
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateSingleQuantity(UUID listingId, int quantity, Long userId) {
        if (quantity < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_QUANTITY_AT_LEAST_ONE,
                    ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        int updated = listingRepository.updateQuantity(listingId, quantity, userId);
        return updated > 0 ? Result.success() : Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateBatchQuantity(List<UUID> listingIds, int quantity, Long userId) {
        if (listingIds == null || listingIds.isEmpty()) return Result.success();
        if (quantity < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_QUANTITY_AT_LEAST_ONE,
                    ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        int updated = listingRepository.updateQuantityBatch(listingIds, quantity, userId);
        if (updated != listingIds.size()) {
            log.warn("Partial batch quantity update: {} of {} listings updated", updated, listingIds.size());
        }
        return Result.success();
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateSinglePrice(UUID listingId, BigDecimal price, Long userId) {
        if (price == null || price.compareTo(ListingBusinessConstants.MIN_NON_NEGATIVE_PRICE) < 0) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_PRICE_NON_NEGATIVE,
                    ListingBusinessConstants.ERROR_CODE_INVALID_PRICE);
        }
        Optional<Listing> listingOpt = listingRepository.findById(listingId);
        if (listingOpt.isEmpty()) {
            return Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
        }
        Listing listing = listingOpt.get();
        if (!userId.equals(listing.getSeller().getId())) {
            return Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
        }
        BigDecimal oldPrice = listing.getPrice();
        int updated = listingRepository.updatePrice(listingId, price, userId);
        if (updated <= 0) {
            return Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
        }
        if (priceChanged(oldPrice, price)) {
            priceHistoryService.recordPriceChange(
                    listingId,
                    listing.getTitle(),
                    oldPrice,
                    price,
                    listing.getCurrency(),
                    "Price updated via quick action");
        }
        return Result.success();
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateBatchPrice(List<UUID> listingIds, BigDecimal price, Long userId) {
        if (listingIds == null || listingIds.isEmpty()) return Result.success();
        if (price == null || price.compareTo(ListingBusinessConstants.MIN_NON_NEGATIVE_PRICE) < 0) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_PRICE_NON_NEGATIVE,
                    ListingBusinessConstants.ERROR_CODE_INVALID_PRICE);
        }
        List<Listing> ownedBefore = listingRepository.findAllByIdIn(listingIds).stream()
                .filter(l -> userId.equals(l.getSeller().getId()))
                .toList();
        int updated = listingRepository.updatePriceBatch(listingIds, price, userId);
        if (updated != listingIds.size()) {
            log.warn("Partial batch price update: {} of {} listings updated", updated, listingIds.size());
        }
        for (Listing l : ownedBefore) {
            if (priceChanged(l.getPrice(), price)) {
                priceHistoryService.recordPriceChange(
                        l.getId(),
                        l.getTitle(),
                        l.getPrice(),
                        price,
                        l.getCurrency(),
                        "Price updated via bulk quick action");
            }
        }
        return Result.success();
    }

    private static boolean priceChanged(BigDecimal oldPrice, BigDecimal newPrice) {
        if (oldPrice == null && newPrice == null) {
            return false;
        }
        if (oldPrice == null || newPrice == null) {
            return true;
        }
        return oldPrice.compareTo(newPrice) != 0;
    }

    public BigDecimal calculateTotalListingFee() {
        BigDecimal fee = listingConfig.getCreation().getFee();
        BigDecimal tax = listingConfig.getFee().getTax();
        BigDecimal taxAmount = fee.multiply(tax).divide(
                ListingBusinessConstants.PERCENT_DIVISOR,
                ListingBusinessConstants.FEE_TAX_CALCULATION_SCALE,
                ListingBusinessConstants.FEE_TAX_ROUNDING_MODE);
        return fee.add(taxAmount);
    }
}

