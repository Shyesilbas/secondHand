package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleListingRepository extends JpaRepository<VehicleListing, UUID> {
    

    List<VehicleListing> findByBrandAndModel(CarBrand brand, String model);


}