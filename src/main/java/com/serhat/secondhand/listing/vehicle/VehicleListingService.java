package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.ListingService;
import com.serhat.secondhand.listing.application.PriceHistoryService;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleListingRepository;
import com.serhat.secondhand.listing.validation.ListingValidationEngine;
import com.serhat.secondhand.listing.validation.vehicle.VehicleSpecValidator;
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
public class VehicleListingService {

    private final VehicleListingRepository vehicleRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final VehicleListingFilterService vehicleListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final UserService userService;
    private final ListingValidationEngine listingValidationEngine;
    private final List<VehicleSpecValidator> vehicleSpecValidators;
    private final VehicleMapper vehicleMapper;
    private final VehicleListingResolver vehicleListingResolver;

    @Transactional
    public Result<UUID> createVehicleListing(VehicleCreateRequest request, Long sellerId) {
        log.info("Creating vehicle listing for sellerId: {}", sellerId);

        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }

        var resolutionResult = vehicleListingResolver.resolve(
                request.vehicleTypeId(),
                request.brandId(),
                request.vehicleModelId()
        );
        if (resolutionResult.isError()) {
            return Result.error(resolutionResult.getMessage(), resolutionResult.getErrorCode());
        }

        VehicleListing vehicle = listingMapper.toVehicleEntity(request);
        VehicleResolution res = resolutionResult.getData();
        vehicle.setSeller(userResult.getData());
        vehicle.setVehicleType(res.type());
        vehicle.setBrand(res.brand());
        vehicle.setModel(res.model());

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(vehicle, vehicleSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        VehicleListing saved = vehicleRepository.save(vehicle);
        log.info("Vehicle listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateVehicleListing(UUID id, VehicleUpdateRequest request, Long currentUserId) {
        log.info("Updating vehicle listing: {} by user: {}", id, currentUserId);

        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return ownershipResult;
        }

        VehicleListing existing = vehicleRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Vehicle listing not found", "LISTING_NOT_FOUND");
        }

        Result<Void> statusResult = listingService.validateEditableStatus(existing);
        if (statusResult.isError()) {
            return statusResult;
        }

        var oldPrice = existing.getPrice();

        Result<Void> applyResult = vehicleListingResolver.apply(existing, request.vehicleTypeId(), request.brandId(), request.vehicleModelId());
        if (applyResult.isError()) {
            return Result.error(applyResult.getMessage(), applyResult.getErrorCode());
        }
        vehicleMapper.updateEntityFromRequest(existing, request);

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(existing, vehicleSpecValidators);
        if (specResult.isError()) {
            return Result.error(specResult.getMessage(), specResult.getErrorCode());
        }

        vehicleRepository.save(existing);

        // 4. Price History Check
        priceHistoryService.recordPriceChangeIfUpdated(
                existing,
                oldPrice,
                request.base() != null ? request.base().price() : null,
                "Price updated via listing edit"
        );

        log.info("Vehicle listing updated: {}", id);
        return Result.success();
    }

    public List<VehicleListingDto> findByBrandAndModel(UUID brandId, UUID modelId) {
        List<VehicleListing> vehicles = vehicleRepository.findByBrand_IdAndModel_Id(brandId, modelId);
        return vehicles.stream()
                .map(listingMapper::toVehicleDto)
                .toList();
    }

    public VehicleListingDto getVehicleDetails(UUID id) {
        VehicleListing vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle listing not found"));
        return listingMapper.toVehicleDto(vehicle);
    }

    public Page<ListingDto> filterVehicles(VehicleListingFilterDto filters) {
        log.info("Filtering vehicle listings with criteria: {}", filters);
        return vehicleListingFilterService.filterVehicles(filters);
    }

}