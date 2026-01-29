package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, UUID> {
    List<VehicleModel> findByBrand_Id(UUID brandId);
    Optional<VehicleModel> findByBrand_IdAndNameIgnoreCase(UUID brandId, String name);
}

