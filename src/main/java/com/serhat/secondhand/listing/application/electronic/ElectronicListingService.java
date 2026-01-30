package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.electronics.ElectronicUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.electronic.ElectronicSpecValidator;
import com.serhat.secondhand.user.application.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ElectronicListingService {
    private final ElectronicListingRepository repository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final ElectronicListingFilterService electronicListingFilterService;
    private final PriceHistoryService priceHistoryService;
    
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<ElectronicSpecValidator> electronicSpecValidators;
    private final ElectronicMapper electronicMapper;
    private final ElectronicListingResolver electronicListingResolver;

    @Transactional
    public Result<UUID> createElectronicListing(ElectronicCreateRequest request, Long sellerId) {
        log.info("Creating electronic listing for sellerId: {}", sellerId);

        var userResult = userService.findById(sellerId);
        if (userResult.isError()) return Result.error(userResult.getMessage(), userResult.getErrorCode());

        var resolutionResult = electronicListingResolver.resolve(
                request.electronicTypeId(),
                request.electronicBrandId(),
                request.electronicModelId()
        );
        if (resolutionResult.isError()) return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());

        ElectronicListing electronicListing = listingMapper.toElectronicEntity(request);
        ElectronicResolution res = resolutionResult.getData();

        electronicListing.setElectronicType(res.type());
        electronicListing.setElectronicBrand(res.brand());
        electronicListing.setModel(res.model());
        electronicListing.setSeller(userResult.getData());

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(electronicListing, electronicSpecValidators);
        if (specResult.isError()) return Result.error(specResult.getMessage(), specResult.getErrorCode());

        ElectronicListing saved = repository.save(electronicListing);
        log.info("Electronic listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateElectronicListings(UUID id, ElectronicUpdateRequest request, Long currentUserId) {
        // 1. Ownership Check (Updated to Long userId)
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        ElectronicListing existing = repository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Electronic listing not found", "LISTING_NOT_FOUND");
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

        Result<Void> resolutionResult = electronicListingResolver.apply(
                existing,
                request.electronicTypeId(),
                request.electronicBrandId(),
                request.electronicModelId()
        );
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }

        electronicMapper.updateEntityFromRequest(existing, request);

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(existing, electronicSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        repository.save(existing);

        // 5. Price History
        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );

        log.info("Electronic listing updated: {}", id);
        return Result.success();
    }

    public List<ElectronicListingDto> findByElectronicType(UUID electronicTypeId) {
        List<ElectronicListing> electronicListings = repository.findByElectronicType_Id(electronicTypeId);
        return electronicListings.stream()
                .map(listingMapper::toElectronicDto)
                .toList();
    }

    public ElectronicListingDto getElectronicDetails(UUID id) {
        ElectronicListing electronic = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Electronic listing not found"));
        return listingMapper.toElectronicDto(electronic);
    }

    public Page<ListingDto> filterElectronics(ElectronicListingFilterDto filters) {
        log.info("Filtering electronics listings with criteria: {}", filters);
        return electronicListingFilterService.filterElectronics(filters);
    }
}