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
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.events.NewListingCreatedEvent;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.clothing.ClothingSpecValidator;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ClothingBrandRepository clothingBrandRepository;
    private final ClothingTypeRepository clothingTypeRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ClothingListingFilterService clothingListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<ClothingSpecValidator> clothingSpecValidators;

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

        ClothingBrand brand = resolveBrand(request.brandId());
        if (brand == null) {
            return Result.error("Clothing brand not found", "CLOTHING_BRAND_NOT_FOUND");
        }
        ClothingType type = resolveType(request.clothingTypeId());
        if (type == null) {
            return Result.error("Clothing type not found", "CLOTHING_TYPE_NOT_FOUND");
        }

        clothing.setBrand(brand);
        clothing.setClothingType(type);
        clothing.setPurchaseDate(toPurchaseDate(request.purchaseYear()));

        clothing.setSeller(seller);
        clothing.setListingFeePaid(true);
        clothing.setStatus(ListingStatus.ACTIVE);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(clothing, clothingSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        ClothingListing saved = clothingRepository.save(clothing);
        log.info("Clothing listing created: {}", saved.getId());

        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateClothingListing(UUID id, ClothingUpdateRequest request, Long currentUserId) {
        
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        ClothingListing existing = clothingRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Clothing listing not found", "LISTING_NOT_FOUND");
        }

        
        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

        
        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q >= 1) existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.brandId().ifPresent(brandId -> {
            ClothingBrand brand = resolveBrand(brandId);
            if (brand != null) {
                existing.setBrand(brand);
            }
        });
        request.clothingTypeId().ifPresent(typeId -> {
            ClothingType type = resolveType(typeId);
            if (type != null) {
                existing.setClothingType(type);
            }
        });
        request.color().ifPresent(existing::setColor);
        request.purchaseYear().ifPresent(y -> existing.setPurchaseDate(toPurchaseDate(y)));
        request.condition().ifPresent(existing::setCondition);
        request.size().ifPresent(existing::setSize);
        request.shoeSizeEu().ifPresent(existing::setShoeSizeEu);
        request.material().ifPresent(existing::setMaterial);
        request.clothingGender().ifPresent(existing::setClothingGender);
        request.clothingCategory().ifPresent(existing::setClothingCategory);

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error("Quantity must be at least 1", ListingErrorCodes.INVALID_QUANTITY.toString());
        }

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, clothingSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        clothingRepository.save(existing);

        
        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing.getId(),
                    existing.getTitle(),
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }

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

    private ClothingBrand resolveBrand(UUID id) {
        if (id == null) {
            return null;
        }
        return clothingBrandRepository.findById(id).orElse(null);
    }

    private ClothingType resolveType(UUID id) {
        if (id == null) {
            return null;
        }
        return clothingTypeRepository.findById(id).orElse(null);
    }

    private LocalDate toPurchaseDate(Integer year) {
        if (year == null) {
            return null;
        }
        return LocalDate.of(year, 1, 1);
    }
}