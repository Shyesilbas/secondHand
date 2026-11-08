package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleVersion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleVersionRepository extends JpaRepository<VehicleVersion, UUID> {

    @EntityGraph(attributePaths = "trims")
    List<VehicleVersion> findByGeneration_IdOrderByNameAsc(UUID generationId);
}
