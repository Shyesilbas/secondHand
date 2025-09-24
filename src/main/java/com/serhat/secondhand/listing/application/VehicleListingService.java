package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleListingRepository;
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
public class VehicleListingService {
    
    private final VehicleListingRepository vehicleRepository;
    private final ListingService listingService;
    private final ListingMapper listingMapper;
    private final VehicleListingFilterService vehicleListingFilterService;
    private final PriceHistoryService priceHistoryService;
    
    @Transactional
    public UUID createVehicleListing(VehicleCreateRequest request, User seller) {
        VehicleListing vehicle = listingMapper.toVehicleEntity(request);
        vehicle.setSeller(seller);
        VehicleListing saved = vehicleRepository.save(vehicle);
        log.info("Vehicle listing created: {}", saved.getId());
        return saved.getId();
    }
    
    @Transactional
    public void updateVehicleListing(UUID id, VehicleUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);

        VehicleListing existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "Vehicle listing not found",
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

        request.model().ifPresent(existing::setModel);
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

        vehicleRepository.save(existing);

                if (request.price().isPresent() && (oldPrice == null || !oldPrice.equals(existing.getPrice()))) {
            priceHistoryService.recordPriceChange(
                existing, 
                oldPrice, 
                existing.getPrice(), 
                existing.getCurrency(), 
                "Price updated via listing edit"
            );
        }
        log.info("Vehicle listing updated: {}", id);
    }
    
    public List<VehicleListingDto> findByBrandAndModel(CarBrand brand, String model) {
        List<VehicleListing> vehicles = vehicleRepository.findByBrandAndModel(brand, model);
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
