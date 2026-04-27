package com.serhat.secondhand.listing.application.category;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.common.ListingValidationService;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import com.serhat.secondhand.listing.validation.common.ListingValidationEngine;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
public abstract class AbstractListingService<T extends Listing, C> {

    protected final IUserService userService;
    protected final ListingValidationService listingValidationService;
    protected final ListingMapper listingMapper;
    protected final ListingValidationEngine listingValidationEngine;

    protected AbstractListingService(
            IUserService userService,
            ListingValidationService listingValidationService,
            ListingMapper listingMapper,
            ListingValidationEngine listingValidationEngine) {
        this.userService = userService;
        this.listingValidationService = listingValidationService;
        this.listingMapper = listingMapper;
        this.listingValidationEngine = listingValidationEngine;
    }

    @Transactional
    public Result<UUID> createListing(C request, Long sellerId) {
        log.info("Creating {} listing for sellerId: {}", getListingType(), sellerId);

        Result<User> sellerResult = userService.findById(sellerId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        User seller = sellerResult.getData();

        T entity = mapRequestToEntity(request);

        if (requiresQuantityValidation()) {
            Result<Void> quantityResult = validateQuantity(entity);
            if (quantityResult.isError()) {
                return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
            }
        }

        Result<?> resolutionResult = resolveEntities(request);
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }

        applyResolution(entity, resolutionResult.getData());
        entity.setSeller(seller);

        Result<Void> preprocessResult = preProcess(entity, request);
        if (preprocessResult.isError()) {
            return Result.error(preprocessResult.getMessage(), preprocessResult.getErrorCode());
        }

        Result<Void> validationResult = validate(entity);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        T saved = save(entity);
        log.info("{} listing created: {}", getListingType(), saved.getId());
        return Result.success(saved.getId());
    }

    // ── Convenience delegates used in *ListingService.performUpdate ──

    public Result<Void> validateOwnership(UUID listingId, Long userId) {
        return listingValidationService.validateOwnership(listingId, userId);
    }

    public Result<Void> applyQuantityUpdate(Listing listing, Optional<Integer> quantity) {
        if (quantity.isPresent()) {
            try {
                listing.updateQuantity(quantity.get());
                return Result.success();
            } catch (BusinessException e) {
                return Result.error(e.getMessage(), e.getErrorCode());
            }
        }
        return Result.success();
    }

    // ── Abstract template methods ──

    protected abstract String getListingType();

    protected abstract T mapRequestToEntity(C request);

    protected abstract Result<?> resolveEntities(C request);

    protected abstract void applyResolution(T entity, Object resolution);

    protected abstract Result<Void> validate(T entity);

    protected abstract T save(T entity);

    protected boolean requiresQuantityValidation() {
        return false;
    }

    protected Result<Void> validateQuantity(T entity) {
        if (entity.getQuantity() == null || entity.getQuantity() < 1) {
            return Result.error("Invalid quantity for " + getListingType().toLowerCase() + " listing",
                    ListingErrorCodes.INVALID_QUANTITY.toString());
        }
        return Result.success();
    }

    protected Result<Void> preProcess(T entity, C request) {
        return Result.success();
    }
    
    @Transactional
    protected <U, R> Result<Void> performUpdate(
            UUID id,
            U request,
            Long currentUserId,
            java.util.function.Function<UUID, Optional<T>> finder,
            java.util.function.BiConsumer<T, U> updater,
            java.util.function.Function<T, Result<Void>> resolver,
            java.util.function.Function<T, Result<Void>> validator) {
        
        log.info("Updating {} listing: {} by user: {}", getListingType(), id, currentUserId);
        
        Result<Void> ownershipResult = validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }
        
        Optional<T> existingOpt = finder.apply(id);
        if (existingOpt.isEmpty()) {
            return Result.error(getListingType() + " listing not found", ListingErrorCodes.LISTING_NOT_FOUND.toString());
        }
        
        T existing = existingOpt.get();
        
        if (!existing.isEditable()) {
            return Result.error(ListingErrorCodes.INVALID_LISTING_STATUS);
        }
        
        if (resolver != null) {
            Result<Void> resolveResult = resolver.apply(existing);
            if (resolveResult.isError()) {
                return resolveResult;
            }
        }
        
        updater.accept(existing, request);
        
        Result<Void> validationResult = validator.apply(existing);
        if (validationResult.isError()) {
            return validationResult;
        }
        
        save(existing);
        log.info("{} listing updated: {}", getListingType(), existing.getId());
        return Result.success();
    }
}
