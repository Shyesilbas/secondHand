package com.serhat.secondhand.listing.domain.mapper;

import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.ListingStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VehicleMapper {
    
    public VehicleListingDto toDto(VehicleListing vehicle) {
        if (vehicle == null) {
            return null;
        }
        
        VehicleListingDto dto = new VehicleListingDto();
        dto.setId(vehicle.getId());
        dto.setTitle(vehicle.getTitle());
        dto.setDescription(vehicle.getDescription());
        dto.setPrice(vehicle.getPrice());
        dto.setCurrency(vehicle.getCurrency());
        dto.setStatus(vehicle.getStatus());
        dto.setCity(vehicle.getCity());
        dto.setDistrict(vehicle.getDistrict());
        dto.setSellerName(vehicle.getSeller().getName());
        dto.setSellerSurname(vehicle.getSeller().getSurname());
        dto.setCreatedAt(vehicle.getCreatedAt());
        dto.setUpdatedAt(vehicle.getUpdatedAt());
        
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getModel());
        dto.setYear(vehicle.getYear());
        dto.setMileage(vehicle.getMileage());
        dto.setEngineCapacity(vehicle.getEngineCapacity());
        dto.setGearbox(vehicle.getGearbox());
        dto.setSeatCount(vehicle.getSeatCount());
        dto.setDoors(vehicle.getDoors());
        dto.setWheels(vehicle.getWheels());
        dto.setColor(vehicle.getColor());
        dto.setFuelCapacity(vehicle.getFuelCapacity());
        dto.setFuelConsumption(vehicle.getFuelConsumption());
        dto.setHorsePower(vehicle.getHorsePower());
        dto.setKilometersPerLiter(vehicle.getKilometersPerLiter());
        dto.setFuelType(vehicle.getFuelType());
        
        return dto;
    }
    
    public VehicleListing toEntity(VehicleCreateRequest request) {
        if (request == null) {
            return null;
        }
        
        VehicleListing vehicle = new VehicleListing();
        vehicle.setTitle(request.title());
        vehicle.setDescription(request.description());
        vehicle.setPrice(request.price());
        vehicle.setCurrency(request.currency());
        vehicle.setStatus(ListingStatus.DRAFT);
        vehicle.setCity(request.city());
        vehicle.setDistrict(request.district());
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());
        
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setYear(request.year());
        vehicle.setMileage(request.mileage());
        vehicle.setEngineCapacity(request.engineCapacity());
        vehicle.setGearbox(request.gearbox());
        vehicle.setSeatCount(request.seatCount());
        vehicle.setDoors(request.doors());
        vehicle.setWheels(request.wheels());
        vehicle.setColor(request.color());
        vehicle.setFuelCapacity(request.fuelCapacity());
        vehicle.setFuelConsumption(request.fuelConsumption());
        vehicle.setHorsePower(request.horsePower());
        vehicle.setKilometersPerLiter(request.kilometersPerLiter());
        vehicle.setFuelType(request.fuelType());
        
        return vehicle;
    }
    
    public void updateEntity(VehicleUpdateRequest request, VehicleListing existing) {
        if (request == null || existing == null) {
            return;
        }
        
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
        
        existing.setUpdatedAt(LocalDateTime.now());
    }
} 