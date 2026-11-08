package com.serhat.secondhand.listing.application.generator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * {@code data/listing-generator/prices.json}: estimated second-hand asking prices (TRY, {@code claude-draft}).
 * Vehicles are priced per generation for an average-mileage example of {@code anchorYear}; electronics per model
 * for the cheapest variant in good condition.
 */
@JsonIgnoreProperties(ignoreUnknown = false)
record GeneratorPrices(String source, String priceDate, String note,
                       List<VehiclePrice> vehicles, List<ElectronicPrice> electronics) {

    record VehiclePrice(String brand, String model, String generation, int anchorYear, List<Long> priceTry) {
        long low() { return priceTry.get(0); }
        long high() { return priceTry.get(1); }
    }

    record ElectronicPrice(String type, String brand, String model, List<Long> priceTry) {
        long low() { return priceTry.get(0); }
        long high() { return priceTry.get(1); }
    }
}
