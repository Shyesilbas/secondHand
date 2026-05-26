package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleTrim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleTrimRepository extends JpaRepository<VehicleTrim, UUID> {
    List<VehicleTrim> findByGeneration_Id(UUID generationId);
    Optional<VehicleTrim> findByGeneration_IdAndNameIgnoreCase(UUID generationId, String name);
}
