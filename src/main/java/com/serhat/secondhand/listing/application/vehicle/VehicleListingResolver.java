package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
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
    private final VehicleGenerationRepository vehicleGenerationRepository;
    private final VehicleEngineRepository vehicleEngineRepository;
    private final VehicleTrimRepository vehicleTrimRepository;

    public Result<VehicleResolution> resolve(
            UUID vehicleTypeId, UUID brandId, UUID modelId,
            UUID generationId, UUID engineId, UUID trimId) {
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

        var generation = generationId != null ? vehicleGenerationRepository.findById(generationId).orElse(null) : null;
        if (generationId != null && generation == null) {
            return Result.error("Vehicle generation not found", "VEHICLE_GENERATION_NOT_FOUND");
        }

        var engine = engineId != null ? vehicleEngineRepository.findById(engineId).orElse(null) : null;
        if (engineId != null && engine == null) {
            return Result.error("Vehicle engine not found", "VEHICLE_ENGINE_NOT_FOUND");
        }

        var trim = trimId != null ? vehicleTrimRepository.findById(trimId).orElse(null) : null;
        if (trimId != null && trim == null) {
            return Result.error("Vehicle trim not found", "VEHICLE_TRIM_NOT_FOUND");
        }

        return Result.success(new VehicleResolution(type, brand, model, generation, engine, trim));
    }

    public Result<Void> apply(
            VehicleListing listing,
            Optional<UUID> vehicleTypeId,
            Optional<UUID> brandId,
            Optional<UUID> modelId,
            Optional<UUID> generationId,
            Optional<UUID> engineId,
            Optional<UUID> trimId) {
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

        if (generationId != null) {
            if (generationId.isPresent()) {
                var generation = vehicleGenerationRepository.findById(generationId.get()).orElse(null);
                if (generation == null) {
                    return Result.error("Vehicle generation not found", "VEHICLE_GENERATION_NOT_FOUND");
                }
                listing.setGeneration(generation);
            } else {
                listing.setGeneration(null);
            }
        }

        if (engineId != null) {
            if (engineId.isPresent()) {
                var engine = vehicleEngineRepository.findById(engineId.get()).orElse(null);
                if (engine == null) {
                    return Result.error("Vehicle engine not found", "VEHICLE_ENGINE_NOT_FOUND");
                }
                listing.setEngine(engine);
            } else {
                listing.setEngine(null);
            }
        }

        if (trimId != null) {
            if (trimId.isPresent()) {
                var trim = vehicleTrimRepository.findById(trimId.get()).orElse(null);
                if (trim == null) {
                    return Result.error("Vehicle trim not found", "VEHICLE_TRIM_NOT_FOUND");
                }
                listing.setTrim(trim);
            } else {
                listing.setTrim(null);
            }
        }

        return Result.success();
    }
}

