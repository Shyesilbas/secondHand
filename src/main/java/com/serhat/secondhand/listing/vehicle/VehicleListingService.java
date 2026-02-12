package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.AbstractListingService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.application.IListingService;
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
import com.serhat.secondhand.user.application.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class VehicleListingService extends AbstractListingService<VehicleListing, VehicleCreateRequest> {

    private final VehicleListingRepository vehicleRepository;
    private final VehicleListingFilterService vehicleListingFilterService;
    private final PriceHistoryService priceHistoryService;
    private final List<VehicleSpecValidator> vehicleSpecValidators;
    private final VehicleMapper vehicleMapper;
    private final VehicleListingResolver vehicleListingResolver;
    
    public VehicleListingService(
            VehicleListingRepository vehicleRepository,
            IListingService listingService,
            ListingMapper listingMapper,
            VehicleListingFilterService vehicleListingFilterService,
            PriceHistoryService priceHistoryService,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<VehicleSpecValidator> vehicleSpecValidators,
            VehicleMapper vehicleMapper,
            VehicleListingResolver vehicleListingResolver) {
        super(userService, listingService, listingMapper, listingValidationEngine);
        this.vehicleRepository = vehicleRepository;
        this.vehicleListingFilterService = vehicleListingFilterService;
        this.priceHistoryService = priceHistoryService;
        this.vehicleSpecValidators = vehicleSpecValidators;
        this.vehicleMapper = vehicleMapper;
        this.vehicleListingResolver = vehicleListingResolver;
    }

    public Result<UUID> createVehicleListing(VehicleCreateRequest request, Long sellerId) {
        return createListing(request, sellerId);
    }
    
    @Override
    protected String getListingType() {
        return "Vehicle";
    }
    
    @Override
    protected VehicleListing mapRequestToEntity(VehicleCreateRequest request) {
        return listingMapper.toVehicleEntity(request);
    }
    
    @Override
    protected Result<VehicleResolution> resolveEntities(VehicleCreateRequest request) {
        return vehicleListingResolver.resolve(
                request.vehicleTypeId(),
                request.brandId(),
                request.vehicleModelId()
        );
    }
    
    @Override
    protected void applyResolution(VehicleListing entity, Object resolution) {
        VehicleResolution res = (VehicleResolution) resolution;
        entity.setVehicleType(res.type());
        entity.setBrand(res.brand());
        entity.setModel(res.model());
    }
    
    @Override
    protected Result<Void> validate(VehicleListing entity) {
        return listingValidationEngine.cleanupAndValidate(entity, vehicleSpecValidators);
    }
    
    @Override
    protected VehicleListing save(VehicleListing entity) {
        return vehicleRepository.save(entity);
    }

    @Transactional
    @TrackPriceChange(reason = "Price updated via listing edit")
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