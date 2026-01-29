package com.serhat.secondhand.listing.realestate;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.realestate.RealEstateUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealEstateListingService {

    private final RealEstateRepository realEstateRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final RealEstateListingFilterService realEstateListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final UserService userService;
    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;

    @Transactional
    public Result<UUID> createRealEstateListing(RealEstateCreateRequest request, Long sellerId) {
        log.info("Creating real estate listing for sellerId: {}", sellerId);

        // 1. Resolve Seller
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        // 2. Map and Save
        RealEstateListing realEstateListing = listingMapper.toRealEstateEntity(request);
        realEstateListing.setSeller(seller);
        realEstateListing.setStatus(ListingStatus.ACTIVE);
        realEstateListing.setListingFeePaid(true);
        realEstateListing.setAdType(resolveAdType(request.adTypeId()));
        realEstateListing.setRealEstateType(resolveRealEstateType(request.realEstateTypeId()));
        realEstateListing.setHeatingType(resolveHeatingType(request.heatingTypeId()));
        realEstateListing.setOwnerType(resolveOwnerType(request.ownerTypeId()));

        RealEstateListing saved = realEstateRepository.save(realEstateListing);
        log.info("Real estate listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateRealEstateListing(UUID id, RealEstateUpdateRequest request, Long currentUserId) {
        log.info("Updating real estate listing: {} by user: {}", id, currentUserId);

        // 1. Ownership Validation (ID Based)
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        RealEstateListing existing = realEstateRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Real Estate listing not found", "LISTING_NOT_FOUND");
        }

        // 2. Status Validation
        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

        // 3. Mapping Updates
        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.adTypeId().ifPresent(idValue -> existing.setAdType(resolveAdType(idValue)));
        request.realEstateTypeId().ifPresent(idValue -> existing.setRealEstateType(resolveRealEstateType(idValue)));
        request.heatingTypeId().ifPresent(idValue -> existing.setHeatingType(resolveHeatingType(idValue)));
        request.ownerTypeId().ifPresent(idValue -> existing.setOwnerType(resolveOwnerType(idValue)));
        request.squareMeters().ifPresent(existing::setSquareMeters);
        request.roomCount().ifPresent(existing::setRoomCount);
        request.bathroomCount().ifPresent(existing::setBathroomCount);
        request.floor().ifPresent(existing::setFloor);
        request.buildingAge().ifPresent(existing::setBuildingAge);
        request.furnished().ifPresent(existing::setFurnished);

        realEstateRepository.save(existing);

        // 4. Price History Check
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

        log.info("Real estate listing updated: {}", id);
        return Result.success();
    }

    public Page<ListingDto> filterRealEstate(RealEstateFilterDto filters) {
        log.info("Filtering real estate listings with criteria: {}", filters);
        return realEstateListingFilterService.filterRealEstates(filters);
    }

    public RealEstateListingDto getRealEstateDetails(UUID id) {
        RealEstateListing realEstateListing = realEstateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Real Estate listing not found"));
        return listingMapper.toRealEstateDto(realEstateListing);
    }

    private com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType resolveRealEstateType(UUID id) {
        if (id == null) {
            return null;
        }
        return realEstateTypeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Real estate type not found"));
    }

    private com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType resolveAdType(UUID id) {
        if (id == null) {
            return null;
        }
        return realEstateAdTypeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Real estate ad type not found"));
    }

    private com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType resolveHeatingType(UUID id) {
        if (id == null) {
            return null;
        }
        return heatingTypeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Heating type not found"));
    }

    private com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType resolveOwnerType(UUID id) {
        if (id == null) {
            return null;
        }
        return listingOwnerTypeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Owner type not found"));
    }
}