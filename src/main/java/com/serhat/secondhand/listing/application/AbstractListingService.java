package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
public abstract class AbstractListingService<T extends Listing, C> {
    
    protected final IUserService userService;
    protected final IListingService listingService;
    protected final ListingMapper listingMapper;
    protected final ListingValidationEngine listingValidationEngine;
    
    protected AbstractListingService(
            IUserService userService,
            IListingService listingService,
            ListingMapper listingMapper,
            ListingValidationEngine listingValidationEngine) {
        this.userService = userService;
        this.listingService = listingService;
        this.listingMapper = listingMapper;
        this.listingValidationEngine = listingValidationEngine;
    }

    @Transactional
    public final Result<UUID> createListing(C request, Long sellerId) {
        log.info("Creating {} listing for sellerId: {}", getListingType(), sellerId);
        
        // Step 1: Resolve seller
        Result<User> sellerResult = resolveSeller(sellerId);
        if (sellerResult.isError()) {
            return Result.error(sellerResult.getMessage(), sellerResult.getErrorCode());
        }
        User seller = sellerResult.getData();
        
        // Step 2: Map request to entity
        T entity = mapRequestToEntity(request);
        
        // Step 3: Optional quantity validation
        if (requiresQuantityValidation()) {
            Result<Void> quantityResult = validateQuantity(entity);
            if (quantityResult.isError()) {
                return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
            }
        }
        
        // Step 4: Resolve foreign key entities
        Result<?> resolutionResult = resolveEntities(request);
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }
        
        // Step 5: Apply resolved entities to listing
        applyResolution(entity, resolutionResult.getData());
        
        // Step 6: Set seller
        entity.setSeller(seller);
        
        // Step 7: Optional pre-processing
        Result<Void> preprocessResult = preProcess(entity, request);
        if (preprocessResult.isError()) {
            return Result.error(preprocessResult.getMessage(), preprocessResult.getErrorCode());
        }
        
        // Step 8: Validate
        Result<Void> validationResult = validate(entity);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }
        
        // Step 9: Save
        T saved = save(entity);
        
        log.info("{} listing created: {}", getListingType(), saved.getId());
        return Result.success(saved.getId());
    }
    

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
    

    private Result<User> resolveSeller(Long sellerId) {
        return userService.findById(sellerId);
    }
}
