package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.VehicleSearchCriteria;
import com.serhat.secondhand.listing.domain.dto.request.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import com.serhat.secondhand.listing.domain.mapper.VehicleMapper;
import com.serhat.secondhand.listing.domain.repository.VehicleListingRepository;
import com.serhat.secondhand.user.domain.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleListingService implements IVehicleListingService {
    
    private final VehicleListingRepository vehicleRepository;
    private final IListingService listingService;
    private final VehicleMapper vehicleMapper;
    
    @Override
    @Transactional
    public UUID createVehicleListing(VehicleCreateRequest request, User seller) {
        VehicleListing vehicle = vehicleMapper.toEntity(request);
        vehicle.setSeller(seller);
        VehicleListing saved = vehicleRepository.save(vehicle);
        log.info("Vehicle listing created: {}", saved.getId());
        return saved.getId();
    }
    
    @Override
    @Transactional
    public void updateVehicleListing(UUID id, VehicleUpdateRequest request, User currentUser) {
        listingService.validateOwnership(id, currentUser);
        VehicleListing existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle listing not found"));
        vehicleMapper.updateEntity(request, existing);
        vehicleRepository.save(existing);
        log.info("Vehicle listing updated: {}", id);
    }
    
    @Override
    public List<VehicleListingDto> findByBrandAndModel(CarBrand brand, String model) {
        List<VehicleListing> vehicles = vehicleRepository.findByBrandAndModel(brand, model);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .toList();
    }
    
    @Override
    public List<VehicleListingDto> searchVehicles(VehicleSearchCriteria criteria) {
        List<VehicleListing> vehicles = vehicleRepository.searchByCriteria(criteria);
        return vehicles.stream()
                .map(vehicleMapper::toDto)
                .toList();
    }
    
    @Override
    public VehicleListingDto getVehicleDetails(UUID id) {
        VehicleListing vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle listing not found"));
        return vehicleMapper.toDto(vehicle);
    }
} 