package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.category.AbstractListingService;
import com.serhat.secondhand.listing.application.filter.GenericListingFilterService;
import com.serhat.secondhand.listing.application.common.ListingValidationService;
import com.serhat.secondhand.listing.aspect.TrackPriceChange;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleListingRepository;
import com.serhat.secondhand.listing.validation.common.ListingValidationEngine;
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
    private final GenericListingFilterService<VehicleListing, VehicleListingFilterDto> genericFilterService;
    private final VehicleFilterPredicateBuilder predicateBuilder;
    private final List<VehicleSpecValidator> vehicleSpecValidators;
    private final VehicleListingResolver vehicleListingResolver;

    public VehicleListingService(
            VehicleListingRepository vehicleRepository,
            ListingValidationService listingValidationService,
            ListingMapper listingMapper,
            GenericListingFilterService<VehicleListing, VehicleListingFilterDto> genericFilterService,
            VehicleFilterPredicateBuilder predicateBuilder,
            IUserService userService,
            ListingValidationEngine listingValidationEngine,
            List<VehicleSpecValidator> vehicleSpecValidators,
            VehicleListingResolver vehicleListingResolver) {
        super(userService, listingValidationService, listingMapper, listingValidationEngine);
        this.vehicleRepository = vehicleRepository;
        this.genericFilterService = genericFilterService;
        this.predicateBuilder = predicateBuilder;
        this.vehicleSpecValidators = vehicleSpecValidators;
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
        Result<Void> ownershipResult = validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) return ownershipResult;

        return vehicleRepository.findById(id)
                .map(existing -> performUpdate(existing, request))
                .orElseGet(() -> Result.error("Vehicle listing not found", "LISTING_NOT_FOUND"));
    }

    private Result<Void> performUpdate(VehicleListing existing, VehicleUpdateRequest request) {
        Result<Void> statusResult = validateEditableStatus(existing);
        if (statusResult.isError()) return statusResult;

        Result<Void> applyResult = vehicleListingResolver.apply(existing, request.vehicleTypeId(), request.brandId(), request.vehicleModelId());
        if (applyResult.isError()) return Result.error(applyResult.getMessage(), applyResult.getErrorCode());

        listingMapper.updateVehicle(existing, request);

        Result<Void> specResult = listingValidationEngine.cleanupAndValidate(existing, vehicleSpecValidators);
        if (specResult.isError()) return Result.error(specResult.getMessage(), specResult.getErrorCode());

        vehicleRepository.save(existing);
        log.info("Vehicle listing updated: {}", existing.getId());
        return Result.success();
    }

    public List<VehicleListingDto> findByBrandAndModel(UUID brandId, UUID modelId) {
        return vehicleRepository.findByBrand_IdAndModel_Id(brandId, modelId)
                .stream().map(listingMapper::toVehicleDto).toList();
    }

    public VehicleListingDto getVehicleDetails(UUID id) {
        VehicleListing vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle listing not found"));
        return listingMapper.toVehicleDto(vehicle);
    }

    public Page<ListingDto> filterVehicles(VehicleListingFilterDto filters) {
        return genericFilterService.filter(filters, VehicleListing.class, predicateBuilder);
    }
}
