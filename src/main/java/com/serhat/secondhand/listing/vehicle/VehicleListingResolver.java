package com.serhat.secondhand.listing.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VehicleListingResolver {
    private final VehicleTypeRepository vehicleTypeRepository;
    private final CarBrandRepository carBrandRepository;
    private final VehicleModelRepository vehicleModelRepository;

    public Result<VehicleResolution> resolve(UUID vehicleTypeId, UUID brandId, UUID modelId) {
        if (vehicleTypeId == null) {
            return Result.error("Vehicle type is required", "VEHICLE_TYPE_REQUIRED");
        }
        if (brandId == null) {
            return Result.error("Vehicle brand is required", "VEHICLE_BRAND_REQUIRED");
        }
        if (modelId == null) {
            return Result.error("Vehicle model is required", "VEHICLE_MODEL_REQUIRED");
        }

        var type = vehicleTypeRepository.findById(vehicleTypeId).orElse(null);
        if (type == null) {
            return Result.error("Vehicle type not found", "VEHICLE_TYPE_NOT_FOUND");
        }

        var brand = carBrandRepository.findById(brandId).orElse(null);
        if (brand == null) {
            return Result.error("Vehicle brand not found", "VEHICLE_BRAND_NOT_FOUND");
        }

        var model = vehicleModelRepository.findById(modelId).orElse(null);
        if (model == null) {
            return Result.error("Vehicle model not found", "VEHICLE_MODEL_NOT_FOUND");
        }

        return Result.success(new VehicleResolution(type, brand, model));
    }

    public Result<Void> apply(VehicleListing listing, Optional<UUID> vehicleTypeId, Optional<UUID> brandId, Optional<UUID> modelId) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (vehicleTypeId != null && vehicleTypeId.isPresent()) {
            var type = vehicleTypeRepository.findById(vehicleTypeId.get()).orElse(null);
            if (type == null) {
                return Result.error("Vehicle type not found", "VEHICLE_TYPE_NOT_FOUND");
            }
            listing.setVehicleType(type);
        }

        if (brandId != null && brandId.isPresent()) {
            var brand = carBrandRepository.findById(brandId.get()).orElse(null);
            if (brand == null) {
                return Result.error("Vehicle brand not found", "VEHICLE_BRAND_NOT_FOUND");
            }
            listing.setBrand(brand);
        }

        if (modelId != null && modelId.isPresent()) {
            var model = vehicleModelRepository.findById(modelId.get()).orElse(null);
            if (model == null) {
                return Result.error("Vehicle model not found", "VEHICLE_MODEL_NOT_FOUND");
            }
            listing.setModel(model);
        }

        return Result.success();
    }
}

