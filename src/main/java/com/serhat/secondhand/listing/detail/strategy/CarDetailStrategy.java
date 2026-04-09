package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import org.springframework.stereotype.Service;

@Service
public class CarDetailStrategy implements ListingDetailStrategy {

    @Override
    public String getDetailSummary(Listing listing) {
        if (!(listing instanceof VehicleListing vehicle)) {
            return "";
        }

        String brand = vehicle.getBrand() != null ? vehicle.getBrand().getLabel() : null;
        String model = vehicle.getModel() != null ? vehicle.getModel().getName() : null;
        String year = vehicle.getYear() != null ? vehicle.getYear().toString() : null;
        String mileage = vehicle.getMileage() != null ? vehicle.getMileage().toString() : null;
        String fuel = vehicle.getFuelType() != null ? vehicle.getFuelType().getLabel().toLowerCase() : null;

        StringBuilder sb = new StringBuilder("Bu araç");
        if (brand != null && !brand.isBlank()) {
            sb.append(" ").append(brand);
        }
        if (model != null && !model.isBlank()) {
            sb.append(" ").append(model);
        }
        if (year != null) {
            sb.append(" ").append(year).append(" model");
        }
        if (mileage != null) {
            sb.append(", ").append(mileage).append(" KM'de");
        }
        if (fuel != null && !fuel.isBlank()) {
            sb.append(", ").append(fuel).append(" bir araçtır");
        } else {
            sb.append(" bir araçtır");
        }
        sb.append(".");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.VEHICLE;
    }
}

