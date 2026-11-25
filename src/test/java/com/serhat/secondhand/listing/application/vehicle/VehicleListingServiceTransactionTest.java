package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.listing.domain.dto.request.vehicle.VehicleCreateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleListingServiceTransactionTest {

    /** The self-call into createListing bypasses the proxy; without this the lazy catalog entities fail with a 500. */
    @Test
    void createVehicleListingRunsInItsOwnTransaction() throws NoSuchMethodException {
        var method = VehicleListingService.class.getMethod("createVehicleListing", VehicleCreateRequest.class, Long.class);
        assertThat(method.getAnnotation(Transactional.class)).isNotNull();
    }
}
