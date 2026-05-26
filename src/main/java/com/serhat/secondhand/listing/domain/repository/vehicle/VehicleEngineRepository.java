package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleEngine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleEngineRepository extends JpaRepository<VehicleEngine, UUID> {
    List<VehicleEngine> findByGeneration_Id(UUID generationId);
    Optional<VehicleEngine> findByGeneration_IdAndNameIgnoreCase(UUID generationId, String name);
}
