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
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public Result<UUID> createClothingListing(ClothingCreateRequest request, User seller) {
        ClothingListing clothing = listingMapper.toClothingEntity(request);
        if (clothing.getQuantity() == null || clothing.getQuantity() < 1) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }
        clothing.setSeller(seller);
        clothing.setListingFeePaid(true);
        clothing.setStatus(ListingStatus.ACTIVE);
        ClothingListing saved = clothingRepository.save(clothing);
        log.info("Clothing listing created: {}", saved.getId());
        
        eventPublisher.publishEvent(new NewListingCreatedEvent(this, saved));
        
        return Result.success(saved.getId());
    }
    
    @Transactional
    public Result<Void> updateClothingListing(UUID id, ClothingUpdateRequest request, User currentUser) {
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUser);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        ClothingListing existing = clothingRepository.findById(id)
                .orElse(null);

        if (existing == null) {
            return Result.error("Clothing listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.quantity().ifPresent(q -> {
            if (q < 1) {
                return;
            }
            existing.setQuantity(q);
        });
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.brand().ifPresent(existing::setBrand);
        request.clothingType().ifPresent(existing::setClothingType);
        request.color().ifPresent(existing::setColor);
        request.purchaseDate().ifPresent(existing::setPurchaseDate);
        request.condition().ifPresent(existing::setCondition);
        request.clothingGender().ifPresent(existing::setClothingGender);
        request.clothingCategory().ifPresent(existing::setClothingCategory);

        if (request.quantity().isPresent() && request.quantity().get() < 1) {
            return Result.error(ListingErrorCodes.INVALID_QUANTITY);
        }

        clothingRepository.save(existing);

        if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                    existing,
                    oldPrice,
                    existing.getPrice(),
                    existing.getCurrency(),
                    "Price updated via listing edit"
            );
        }
        log.info("Clothing listing updated: {}", id);
        return Result.success();
    }
    
    public List<ClothingListingDto> findByBrandAndClothingType(ClothingBrand brand, ClothingType clothingType) {
        List<ClothingListing> clothing = clothingRepository.findByBrandAndClothingType(brand, clothingType);
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
}
