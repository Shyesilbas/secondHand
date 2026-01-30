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
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.realestate.RealEstateSpecValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;

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
    private final ListingValidationEngine listingValidationEngine;
    private final List<RealEstateSpecValidator> realEstateSpecValidators;
    private final RealEstateMapper realEstateMapper;
    private final RealEstateListingResolver realEstateListingResolver;

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
        var resolutionResult = realEstateListingResolver.resolve(
                request.adTypeId(),
                request.realEstateTypeId(),
                request.heatingTypeId(),
                request.ownerTypeId()
        );
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }
        RealEstateResolution res = resolutionResult.getData();
        realEstateListing.setAdType(res.adType());
        realEstateListing.setRealEstateType(res.realEstateType());
        realEstateListing.setHeatingType(res.heatingType());
        realEstateListing.setOwnerType(res.ownerType());

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(realEstateListing, realEstateSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

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
            return ownershipResult;
        }

        RealEstateListing existing = realEstateRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Real Estate listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        Result<Void> applyResult = realEstateListingResolver.apply(
                existing,
                request.adTypeId(),
                request.realEstateTypeId(),
                request.heatingTypeId(),
                request.ownerTypeId()
        );
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        realEstateMapper.updateEntityFromRequest(existing, request);

        Result<Void> validationResult = listingValidationEngine.cleanupAndValidate(existing, realEstateSpecValidators);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        realEstateRepository.save(existing);

        // 4. Price History Check
        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );

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

}