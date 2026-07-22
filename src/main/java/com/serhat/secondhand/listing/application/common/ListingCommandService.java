package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.core.config.ListingConfig;
import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.entity.events.PriceDroppedEvent;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.util.ListingBusinessConstants;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.inventory.application.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;

import java.math.BigDecimal;
import java.util.List;
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
    private final EntityManager entityManager;
    private final InventoryService inventoryService;
    private static final List<ListingStatus> EDITABLE_STATUSES = List.of(
            ListingStatus.DRAFT,
            ListingStatus.ACTIVE,
            ListingStatus.INACTIVE
    );

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> publish(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            listing.publish();
            listingRepository.save(listing);
            eventPublisher.publishEvent(new NewListingCreatedEvent(this, listing));
            log.info("Listing {} published", listingId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> reactivate(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            listing.reactivate();
            listingRepository.save(listing);
            log.info("Listing {} reactivated", listingId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> deactivate(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            listing.deactivate();
            listingRepository.save(listing);
            log.info("Listing {} deactivated", listingId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> markAsSold(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            listing.markAsSold();
            listingRepository.save(listing);
            log.info("Listing {} marked as sold", listingId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> deleteListing(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            listing.delete();
            listingRepository.save(listing);
            log.info("Listing {} soft deleted", listingId);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<UUID> relist(UUID listingId, Long userId) {
        try {
            Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
            
            if (listing.getStatus() != ListingStatus.SOLD) {
                return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
            }
            
            // Detach the entity to create a deep copy for persisting as a new record
            entityManager.detach(listing);
            
            // Reset fields for the new listing
            listing.setId(null);
            listing.setListingNo(com.serhat.secondhand.listing.util.ListingNoGenerator.generate());
            listing.setStatus(ListingStatus.DRAFT);
            listing.setListingFeePaid(false);
            listing.setVersion(null);
            listing.setCreatedAt(null);
            listing.setUpdatedAt(null);
            
            // Save as a new entity
            listingRepository.save(listing);
            
            log.info("Listing {} relisted into new draft listing {}", listingId, listing.getId());
            return Result.success(listing.getId());
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateSingleQuantity(UUID listingId, int quantity, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);
        try {
            inventoryService.updateQuantity(listing.getId(), quantity);
            log.info("Listing {} quantity updated to {}", listingId, quantity);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateBatchQuantity(List<UUID> listingIds, int quantity, Long userId) {
        if (listingIds == null || listingIds.isEmpty()) return Result.success();
        if (quantity < ListingBusinessConstants.MIN_LISTING_QUANTITY) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }
        if (listingRepository.countByIdInAndSellerId(listingIds, userId) != listingIds.size()) {
            return Result.error(ListingErrorCodes.NOT_LISTING_OWNER);
        }
        if (listingRepository.countByIdInAndSellerIdAndStatusIn(listingIds, userId, EDITABLE_STATUSES) != listingIds.size()) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
        }
        for (UUID lId : listingIds) {
            inventoryService.updateQuantity(lId, quantity);
        }
        int updated = listingIds.size();
        log.info("Batch quantity updated to {} for {} listings", quantity, updated);
        return Result.success();
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    @TrackPriceChange(reason = "Price updated via quick action")
    public Result<Void> updateSinglePrice(UUID listingId, BigDecimal price, Long userId) {
        Listing listing = listingValidationService.findAndValidateOwner(listingId, userId);

        try {
            listing.updatePrice(price);
            listingRepository.save(listing);
            
            log.info("Listing {} price updated to {}", listingId, price);
            return Result.success();
        } catch (BusinessException e) {
            return Result.error(e.getMessage(), e.getErrorCode());
        }
    }

    @org.springframework.cache.annotation.CacheEvict(allEntries = true)
    public Result<Void> updateBatchPrice(List<UUID> listingIds, BigDecimal price, Long userId) {
        if (listingIds == null || listingIds.isEmpty()) return Result.success();
        if (price == null || price.compareTo(ListingBusinessConstants.MIN_NON_NEGATIVE_PRICE) < 0) {
            return Result.error(ListingErrorCodes.INVALID_PRICE);
        }
        if (listingRepository.countByIdInAndSellerId(listingIds, userId) != listingIds.size()) {
            return Result.error(ListingErrorCodes.NOT_LISTING_OWNER);
        }
        if (listingRepository.countByIdInAndSellerIdAndStatusIn(listingIds, userId, EDITABLE_STATUSES) != listingIds.size()) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
        }
        List<Listing> ownedBefore = listingRepository.findAllByIdIn(listingIds).stream()
                .filter(l -> l.isOwnedBy(userId))
                .toList();
        int updated = listingRepository.updatePriceBatch(listingIds, price, userId, EDITABLE_STATUSES);
        if (updated != listingIds.size()) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
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
                
                // Trigger PriceDroppedEvent if price decreased
                if (l.getPrice() != null && price != null && price.compareTo(l.getPrice()) < 0) {
                    eventPublisher.publishEvent(new PriceDroppedEvent(
                            this,
                            l.getId(),
                            l.getTitle(),
                            l.getPrice(),
                            price,
                            l.getCurrency()
                    ));
                }
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
