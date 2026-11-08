package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.*;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleSpecSnapshotterTest {

    private final VehicleSpecSnapshotter snapshotter = new VehicleSpecSnapshotter();

    private static VehicleGeneration golf8() {
        VehicleGeneration g = new VehicleGeneration();
        g.setName("Golf 8");
        g.setBodyType(BodyType.HATCHBACK);
        g.setDoors(Doors.FIVE);
        g.setSeatCount(SeatCount.FIVE);
        return g;
    }

    @Test
    void copiesVersionAndGenerationFactsOverClientValues() {
        VehicleGeneration generation = golf8();
        VehicleVersion version = new VehicleVersion();
        version.setGeneration(generation);
        version.setFuelType(FuelType.GASOLINE);
        version.setEngineCapacity(1498);
        version.setHorsePower(150);
        version.setGearbox(GearType.AUTOMATIC);
        version.setDrivetrain(Drivetrain.FWD);

        VehicleListing listing = VehicleListing.builder()
                .generation(generation)
                .vehicleVersion(version)
                .fuelType(FuelType.DIESEL)
                .horsePower(999)
                .doors(Doors.TWO)
                .build();

        snapshotter.apply(listing);

        assertThat(listing.getFuelType()).isEqualTo(FuelType.GASOLINE);
        assertThat(listing.getHorsePower()).isEqualTo(150);
        assertThat(listing.getEngineCapacity()).isEqualTo(1498);
        assertThat(listing.getGearbox()).isEqualTo(GearType.AUTOMATIC);
        assertThat(listing.getDrivetrain()).isEqualTo(Drivetrain.FWD);
        assertThat(listing.getDoors()).isEqualTo(Doors.FIVE);
        assertThat(listing.getSeatCount()).isEqualTo(SeatCount.FIVE);
        assertThat(listing.getBodyType()).isEqualTo(BodyType.HATCHBACK);
    }

    @Test
    void keepsSellerValueWhenCatalogDoesNotKnowIt() {
        VehicleVersion version = new VehicleVersion();
        version.setFuelType(FuelType.DIESEL);
        VehicleListing listing = VehicleListing.builder()
                .vehicleVersion(version)
                .gearbox(GearType.MANUAL)
                .horsePower(110)
                .build();

        snapshotter.apply(listing);

        assertThat(listing.getGearbox()).isEqualTo(GearType.MANUAL);
        assertThat(listing.getHorsePower()).isEqualTo(110);
        assertThat(listing.getFuelType()).isEqualTo(FuelType.DIESEL);
    }

    @Test
    void leavesSellerDeclaredSpecsWithoutVersion() {
        VehicleListing listing = VehicleListing.builder()
                .generation(golf8())
                .doors(Doors.THREE)
                .build();

        snapshotter.apply(listing);

        assertThat(listing.getDoors()).isEqualTo(Doors.THREE);
    }
}
