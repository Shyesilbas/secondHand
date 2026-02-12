package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.application.IListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.clothing.ClothingSpecValidator;
import com.serhat.secondhand.user.application.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ClothingListingService extends AbstractListingService<ClothingListing, ClothingCreateRequest> {

    private final ClothingListingRepository clothingRepository;
    private final ClothingListingFilterService clothingListingFilterService;
    private final List<ClothingSpecValidator> clothingSpecValidators;
    private final ClothingMapper clothingMapper;
    private final ClothingListingResolver clothingListingResolver;
    
    public ClothingListingService(
            ClothingListingRepository clothingRepository,
            IListingService listingService,
            ListingMapper listingMapper,
            ClothingListingFilterService clothingListingFilterService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<ClothingSpecValidator> clothingSpecValidators,
            ClothingMapper clothingMapper,
            ClothingListingResolver clothingListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.clothingRepository = clothingRepository;
        this.clothingListingFilterService = clothingListingFilterService;
        this.clothingSpecValidators = clothingSpecValidators;
        this.clothingMapper = clothingMapper;
        this.clothingListingResolver = clothingListingResolver;
    }

    public Result<UUID> createClothingListing(ClothingCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "Clothing";
    }
    
    @Override
    protected ClothingListing mapRequestToEntity(ClothingCreateRequest request) {
        return listingMapper.toClothingEntity(request);
    }
    
    @Override
    protected boolean requiresQuantityValidation() {
        return true;
    }
    
    @Override
    protected Result<ClothingResolution> resolveEntities(ClothingCreateRequest request) {
        return clothingListingResolver.resolve(request.brandId(), request.clothingTypeId());
    }
    
    @Override
    protected void applyResolution(ClothingListing entity, Object resolution) {
        ClothingResolution res = (ClothingResolution) resolution;
        entity.setBrand(res.brand());
        entity.setClothingType(res.type());
    }
    
    @Override
    protected Result<Void> preProcess(ClothingListing entity, ClothingCreateRequest request) {
        entity.setPurchaseDate(toPurchaseDate(request.purchaseYear()));
        return Result.success();
    }
    
    @Override
    protected Result<Void> validate(ClothingListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, clothingSpecValidators);
    }
    
    @Override
    protected ClothingListing save(ClothingListing entity) {
        return clothingRepository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
    public Result<Void> updateClothingListing(UUID id, ClothingUpdateRequest request, Long currentUserId) {
        
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        ClothingListing existing = clothingRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Clothing listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        Result<Void> quantityResult = listingService.applyQuantityUpdate(existing, request.quantity());
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }
        Result<Void> applyResult = clothingListingResolver.apply(existing, request.brandId(), request.clothingTypeId());
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        clothingMapper.updateEntityFromRequest(existing, request);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, clothingSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        clothingRepository.save(existing);

        log.info("Clothing listing updated: {}", id);
        return Result.success();
    }

    public List<ClothingListingDto> findByBrandAndClothingType(UUID brandId, UUID clothingTypeId) {
        List<ClothingListing> clothing = clothingRepository.findByBrand_IdAndClothingType_Id(brandId, clothingTypeId);
        return clothing.stream()
                .map(listingMapper::toClothingDto)
                .toList();
    }

    public ClothingListingDto getClothingDetails(UUID id) {
        ClothingListing clothing = clothingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clothing listing not found"));
        return listingMapper.toClothingDto(clothing);
    }

    public Page<ListingDto> filterClothing(ClothingListingFilterDto filters) {
        log.info("Filtering clothing listings with criteria: {}", filters);
        return clothingListingFilterService.filterClothing(filters);
    }

    private LocalDate toPurchaseDate(Integer year) {
        if (year == null) {
            return null;
        }
        return LocalDate.of(year, 1, 1);
    }
}