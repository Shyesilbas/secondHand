package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.clothing.ClothingUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ClothingListing;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClothingListingService {
    
    private final ClothingListingRepository clothingRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ClothingListingFilterService clothingListingFilterService;
    private final PriceHistoryService priceHistoryService;
    
    @Transactional
    public UUID createClothingListing(ClothingCreateRequest request, User seller) {
        ClothingListing clothing = listingMapper.toClothingEntity(request);
        clothing.setSeller(seller);
        ClothingListing saved = clothingRepository.save(clothing);
        log.info("Clothing listing created: {}", saved.getId());
        return saved.getId();
    }
    
    @Transactional
    public void updateClothingListing(UUID id, ClothingUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        ClothingListing existing = clothingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Clothing listing not found",
                        HttpStatus.NOT_FOUND,
                        "LISTING_NOT_FOUND"
                ));

        listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);

        var oldPrice = existing.getPrice();
        var oldCurrency = existing.getCurrency();

                request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);

                request.brand().ifPresent(existing::setBrand);
        request.clothingType().ifPresent(existing::setClothingType);
        request.color().ifPresent(existing::setColor);
        request.purchaseDate().ifPresent(existing::setPurchaseDate);
        request.condition().ifPresent(existing::setCondition);

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
