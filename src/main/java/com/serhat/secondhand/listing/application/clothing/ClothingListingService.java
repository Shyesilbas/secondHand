package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.application.util.ListingErrorCodes;
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
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClothingListingService {

    private final ClothingListingRepository clothingRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ClothingListingFilterService clothingListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<ClothingSpecValidator> clothingSpecValidators;
    private final ClothingMapper clothingMapper;
    private final ClothingListingResolver clothingListingResolver;

    @Transactional
    public Result<UUID> createClothingListing(ClothingCreateRequest request, Long sellerId) {
        log.info("Creating clothing listing for sellerId: {}", sellerId);

        // 1. Resolve Seller
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        
        ClothingListing clothing = listingMapper.toClothingEntity(request);
        if (clothing.getQuantity() == null || clothing.getQuantity() < 1) {
            return Result.error("Invalid quantity for clothing listing", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        var resolutionResult = clothingListingResolver.resolve(request.brandId(), request.clothingTypeId());
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }
        ClothingResolution res = resolutionResult.getData();
        clothing.setBrand(res.brand());
        clothing.setClothingType(res.type());
        clothing.setPurchaseDate(toPurchaseDate(request.purchaseYear()));

        clothing.setSeller(seller);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(clothing, clothingSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        ClothingListing saved = clothingRepository.save(clothing);
        log.info("Clothing listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
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

        var oldPrice = existing.getPrice();

        Result<Void> quantityResult = listingService.applyQuantityUpdate(existing, request.quantity());
        if (quantityResult.isError()) {
            return Result.error(quantityResult.getMessage(), quantityResult.getErrorCode());
        }
        clothingMapper.updateEntityFromRequest(existing, request);
        Result<Void> applyResult = clothingListingResolver.apply(existing, request.brandId(), request.clothingTypeId());
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, clothingSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        clothingRepository.save(existing);

        
        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );

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