package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.VehicleListingDto;
import com.serhat.secondhand.listing.domain.dto.request.VehicleCreateRequest;
import com.serhat.secondhand.listing.domain.dto.request.VehicleSearchCriteria;
import com.serhat.secondhand.listing.domain.dto.request.VehicleUpdateRequest;
import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import com.serhat.secondhand.user.domain.entity.User;

import java.util.List;
import java.util.UUID;

public interface IVehicleListingService {
    
    UUID createVehicleListing(VehicleCreateRequest request, User seller);
    void updateVehicleListing(UUID id, VehicleUpdateRequest request, User currentUser);
    
    List<VehicleListingDto> findByBrandAndModel(CarBrand brand, String model);
    List<VehicleListingDto> searchVehicles(VehicleSearchCriteria criteria);
    
    VehicleListingDto getVehicleDetails(UUID id);
} 