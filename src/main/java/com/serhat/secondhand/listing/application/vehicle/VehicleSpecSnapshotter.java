package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleGeneration;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleVersion;
import org.springframework.stereotype.Component;

/**
 * Copies catalog facts onto the listing's spec columns when a version is picked, so the listing shows and
 * filters by catalog values instead of what the client sent. A fact the catalog does not know (null) keeps
 * the seller's value. Without a version nothing is copied: the specs stay seller-declared.
 * Hierarchy (version belongs to the generation, year in range) is checked by VehicleHierarchyValidator.
 */
@Component
public class VehicleSpecSnapshotter {

    public void apply(VehicleListing listing) {
        if (listing == null || listing.getVehicleVersion() == null) {
            return;
        }
        VehicleVersion version = listing.getVehicleVersion();
        if (version.getFuelType() != null) listing.setFuelType(version.getFuelType());
        if (version.getEngineCapacity() != null) listing.setEngineCapacity(version.getEngineCapacity());
        if (version.getHorsePower() != null) listing.setHorsePower(version.getHorsePower());
        if (version.getGearbox() != null) listing.setGearbox(version.getGearbox());
        if (version.getDrivetrain() != null) listing.setDrivetrain(version.getDrivetrain());

        VehicleGeneration generation = listing.getGeneration();
        if (generation != null) {
            if (generation.getBodyType() != null) listing.setBodyType(generation.getBodyType());
            if (generation.getDoors() != null) listing.setDoors(generation.getDoors());
            if (generation.getSeatCount() != null) listing.setSeatCount(generation.getSeatCount());
        }
    }
}
