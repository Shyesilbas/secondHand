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
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleListingRepository;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.entity.User;
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
    private final CarBrandRepository carBrandRepository;
    private final VehicleModelRepository vehicleModelRepository;

    @Transactional
    public Result<UUID> createVehicleListing(VehicleCreateRequest request, Long sellerId) {
        log.info("Creating vehicle listing for sellerId: {}", sellerId);

        // 1. Resolve User
        var userResult = userService.findById(sellerId);
        if (userResult.isError()) {
            return Result.error(userResult.getMessage(), userResult.getErrorCode());
        }
        User seller = userResult.getData();

        // 2. Map and Save
        VehicleListing vehicle = listingMapper.toVehicleEntity(request);
        vehicle.setSeller(seller);
        vehicle.setStatus(ListingStatus.ACTIVE);
        vehicle.setListingFeePaid(true);
        vehicle.setBrand(resolveBrand(request.brandId()));
        vehicle.setModel(resolveModel(request.vehicleModelId()));

        if (vehicle.getBrand() != null && vehicle.getModel() != null) {
            var modelBrandId = vehicle.getModel().getBrand() != null ? vehicle.getModel().getBrand().getId() : null;
            var brandId = vehicle.getBrand().getId();
            if (modelBrandId == null || !modelBrandId.equals(brandId)) {
                return Result.error("Vehicle model does not belong to the selected brand", "MODEL_BRAND_MISMATCH");
            }
        }

        VehicleListing saved = vehicleRepository.save(vehicle);
        log.info("Vehicle listing created: {}", saved.getId());

        return Result.success(saved.getId());
    }

    @Transactional
    public Result<Void> updateVehicleListing(UUID id, VehicleUpdateRequest request, Long currentUserId) {
        log.info("Updating vehicle listing: {} by user: {}", id, currentUserId);

        // 1. Ownership Validation (Using updated Long based method)
        Result<Void> ownershipResult = listingService.validateOwnership(id, currentUserId);
        if (ownershipResult.isError()) {
            return Result.error(ownershipResult.getMessage(), ownershipResult.getErrorCode());
        }

        VehicleListing existing = vehicleRepository.findById(id).orElse(null);
        if (existing == null) {
            return Result.error("Vehicle listing not found", "LISTING_NOT_FOUND");
        }

        // 2. Status Validation
        Result<Void> statusResult = listingService.validateStatus(existing, ListingStatus.DRAFT, ListingStatus.ACTIVE, ListingStatus.INACTIVE);
        if (statusResult.isError()) {
            return Result.error(statusResult.getMessage(), statusResult.getErrorCode());
        }

        var oldPrice = existing.getPrice();

        // 3. Selective Updates
        request.title().ifPresent(existing::setTitle);
        request.description().ifPresent(existing::setDescription);
        request.price().ifPresent(existing::setPrice);
        request.currency().ifPresent(existing::setCurrency);
        request.city().ifPresent(existing::setCity);
        request.district().ifPresent(existing::setDistrict);
        request.imageUrl().ifPresent(existing::setImageUrl);

        request.year().ifPresent(existing::setYear);
        request.mileage().ifPresent(existing::setMileage);
        request.engineCapacity().ifPresent(existing::setEngineCapacity);
        request.gearbox().ifPresent(existing::setGearbox);
        request.seatCount().ifPresent(existing::setSeatCount);
        request.doors().ifPresent(existing::setDoors);
        request.wheels().ifPresent(existing::setWheels);
        request.color().ifPresent(existing::setColor);
        request.fuelCapacity().ifPresent(existing::setFuelCapacity);
        request.fuelConsumption().ifPresent(existing::setFuelConsumption);
        request.horsePower().ifPresent(existing::setHorsePower);
        request.kilometersPerLiter().ifPresent(existing::setKilometersPerLiter);
        request.fuelType().ifPresent(existing::setFuelType);
        request.swap().ifPresent(existing::setSwap);
        request.brandId().ifPresent(idValue -> existing.setBrand(resolveBrand(idValue)));
        request.vehicleModelId().ifPresent(idValue -> existing.setModel(resolveModel(idValue)));

        if (existing.getBrand() != null && existing.getModel() != null) {
            var modelBrandId = existing.getModel().getBrand() != null ? existing.getModel().getBrand().getId() : null;
            var brandId = existing.getBrand().getId();
            if (modelBrandId == null || !modelBrandId.equals(brandId)) {
                return Result.error("Vehicle model does not belong to the selected brand", "MODEL_BRAND_MISMATCH");
            }
        }

        vehicleRepository.save(existing);

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

    private com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand resolveBrand(UUID id) {
        if (id == null) {
            return null;
        }
        return carBrandRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Car brand not found"));
    }

    private com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel resolveModel(UUID id) {
        if (id == null) {
            return null;
        }
        return vehicleModelRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Vehicle model not found"));
    }
}