package com.serhat.secondhand.listing.application.realestate;

import com.serhat.secondhand.listing.application.common.LocationCatalogService;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Gives a real estate listing an approximate map point: a random point 100-300 m away from its neighborhood's
 * center. The seller's address is never asked or stored, so the map shows the area, not the building.
 * Listings whose neighborhood has no known center get no point (the map is not shown).
 */
@Component
@RequiredArgsConstructor
public class RealEstateLocationService {

    static final double MIN_OFFSET_METERS = 100;
    static final double MAX_OFFSET_METERS = 300;
    private static final double METERS_PER_DEGREE_LAT = 111_320;

    private final LocationCatalogService locationCatalogService;

    /** Sets the point when the listing has none (new listing, or its neighborhood changed). */
    public void placeIfMissing(RealEstateListing listing) {
        if (listing.getLatitude() != null && listing.getLongitude() != null) {
            return;
        }
        locationCatalogService.findNeighborhood(listing.getDistrictKey(), listing.getNeighborhoodKey())
                .filter(n -> n.getLat() != null && n.getLon() != null)
                .ifPresentOrElse(n -> {
                    double[] point = offset(n.getLat(), n.getLon());
                    listing.setLatitude(scale(point[0]));
                    listing.setLongitude(scale(point[1]));
                }, () -> {
                    listing.setLatitude(null);
                    listing.setLongitude(null);
                });
    }

    static double[] offset(double lat, double lon) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        // Uniform over the ring area, so points do not crowd near the inner edge.
        double distance = Math.sqrt(random.nextDouble(
                MIN_OFFSET_METERS * MIN_OFFSET_METERS, MAX_OFFSET_METERS * MAX_OFFSET_METERS));
        double bearing = random.nextDouble(0, 2 * Math.PI);
        double dLat = distance * Math.cos(bearing) / METERS_PER_DEGREE_LAT;
        double dLon = distance * Math.sin(bearing) / (METERS_PER_DEGREE_LAT * Math.cos(Math.toRadians(lat)));
        return new double[]{lat + dLat, lon + dLon};
    }

    private static BigDecimal scale(double value) {
        return BigDecimal.valueOf(value).setScale(6, RoundingMode.HALF_UP);
    }
}
