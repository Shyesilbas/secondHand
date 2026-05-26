package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleGeneration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleGenerationRepository extends JpaRepository<VehicleGeneration, UUID> {
    List<VehicleGeneration> findByModel_Id(UUID modelId);
    Optional<VehicleGeneration> findByModel_IdAndNameIgnoreCase(UUID modelId, String name);
}
