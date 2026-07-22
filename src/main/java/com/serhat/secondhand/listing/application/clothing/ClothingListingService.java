package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.category.AbstractListingService;
import com.serhat.secondhand.listing.application.filter.GenericListingFilterService;
import com.serhat.secondhand.listing.application.common.ListingValidationService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import com.serhat.secondhand.listing.validation.common.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.clothing.ClothingSpecValidator;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.inventory.application.InventoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ClothingListingService extends AbstractListingService<ClothingListing, ClothingCreateRequest> {

    private final ClothingListingRepository clothingRepository;
    private final GenericListingFilterService<ClothingListing, ClothingListingFilterDto> genericFilterService;
    private final ClothingFilterPredicateBuilder predicateBuilder;
    private final List<ClothingSpecValidator> clothingSpecValidators;
    private final ClothingListingResolver clothingListingResolver;

    public ClothingListingService(
            ClothingListingRepository clothingRepository,
            ListingValidationService listingValidationService,
            ListingMapper listingMapper,
            GenericListingFilterService<ClothingListing, ClothingListingFilterDto> genericFilterService,
            ClothingFilterPredicateBuilder predicateBuilder,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<ClothingSpecValidator> clothingSpecValidators,
            ClothingListingResolver clothingListingResolver,
            InventoryService inventoryService) {
        super(userService, listingValidationService, listingMapper, listingValidationEngine, inventoryService);
        this.clothingRepository = clothingRepository;
        this.genericFilterService = genericFilterService;
        this.predicateBuilder = predicateBuilder;
        this.clothingSpecValidators = clothingSpecValidators;
        this.clothingListingResolver = clothingListingResolver;
    }

    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", allEntries = true)
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

    @Override
    protected Integer extractQuantity(ClothingCreateRequest request) {
        return request.quantity();
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", allEntries = true)
    public Result<Void> updateClothingListing(UUID id, ClothingUpdateRequest request, Long currentUserId) {
        return standardUpdate(
                id, request, currentUserId,
                request.quantity(),
                clothingRepository::findById,
                existing -> clothingListingResolver.apply(existing, request.brandId(), request.clothingTypeId()),
                (existing, req) -> listingMapper.updateClothing(existing, req),
                existing -> listingValidationEngine.cleanupAndValidate(existing, clothingSpecValidators)
        );
    }

    public Page<ClothingListingDto> findByBrandAndClothingType(UUID brandId, UUID clothingTypeId, Pageable pageable) {
        return clothingRepository.findByBrand_IdAndClothingType_Id(brandId, clothingTypeId, pageable)
                .map(listingMapper::toClothingDto);
    }

    public ClothingListingDto getClothingDetails(UUID id) {
        ClothingListing clothing = clothingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Clothing listing not found"));
        return listingMapper.toClothingDto(clothing);
    }

    public Page<ListingDto> filterClothing(ClothingListingFilterDto filters) {
        return genericFilterService.filter(filters, ClothingListing.class, predicateBuilder);
    }

    private LocalDate toPurchaseDate(Integer year) {
        return year == null ? null : LocalDate.of(year, 1, 1);
    }
}
