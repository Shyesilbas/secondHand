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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@org.springframework.transaction.annotation.Transactional
public class ListingCommandService {

    private final ListingRepository listingRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ListingValidationService listingValidationService;
    private final ListingConfig listingConfig;

    public void publish(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listingValidationService.validateStatus(listing, ListingStatus.DRAFT);
        if (!listing.isListingFeePaid()) {
            throw new BusinessException(ListingErrorCodes.LISTING_FEE_NOT_PAID);
        }
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
        eventPublisher.publishEvent(new NewListingCreatedEvent(this, listing));
    }

    public void reactivate(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listingValidationService.validateStatus(listing, ListingStatus.INACTIVE);
        listing.setStatus(ListingStatus.ACTIVE);
        listingRepository.save(listing);
    }

    public void deactivate(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listingValidationService.validateStatus(listing, ListingStatus.ACTIVE);
        listing.setStatus(ListingStatus.INACTIVE);
        listingRepository.save(listing);
    }

    public void markAsSold(UUID listingId, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        listingValidationService.validateStatus(listing, ListingStatus.ACTIVE, ListingStatus.RESERVED);
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);
        log.info("Listing with id {} has marked as sold.", listingId);
    }

    public Result<Void> deleteListing(UUID listingId, Long userId) {
        Result<Void> ownershipResult = listingValidationService.validateOwnership(listingId, userId);
        if (ownershipResult.isError()) return ownershipResult;

        listingRepository.deleteById(listingId);
        return Result.success();
    }

    public Result<Void> updateSingleQuantity(UUID listingId, int quantity, Long userId) {
        if (quantity < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_QUANTITY_AT_LEAST_ONE,
                    ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        int updated = listingRepository.updateQuantity(listingId, quantity, userId);
        return updated > 0 ? Result.success() : Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
    }

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

    public Result<Void> updateSinglePrice(UUID listingId, BigDecimal price, Long userId) {
        if (price == null || price.compareTo(ListingBusinessConstants.MIN_NON_NEGATIVE_PRICE) < 0) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_PRICE_NON_NEGATIVE,
                    ListingBusinessConstants.ERROR_CODE_INVALID_PRICE);
        }
        int updated = listingRepository.updatePrice(listingId, price, userId);
        return updated > 0 ? Result.success() : Result.error(ListingErrorCodes.LISTING_NOT_FOUND);
    }

    public Result<Void> updateBatchPrice(List<UUID> listingIds, BigDecimal price, Long userId) {
        if (listingIds == null || listingIds.isEmpty()) return Result.success();
        if (price == null || price.compareTo(ListingBusinessConstants.MIN_NON_NEGATIVE_PRICE) < 0) {
            return Result.error(ListingBusinessConstants.ERROR_MESSAGE_PRICE_NON_NEGATIVE,
                    ListingBusinessConstants.ERROR_CODE_INVALID_PRICE);
        }
        int updated = listingRepository.updatePriceBatch(listingIds, price, userId);
        if (updated != listingIds.size()) {
            log.warn("Partial batch price update: {} of {} listings updated", updated, listingIds.size());
        }
        return Result.success();
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

