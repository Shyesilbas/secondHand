package com.serhat.secondhand.listing.validation.electronic;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class LaptopValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (!isLaptop(listing)) {
            return Result.success();
        }

        if (listing.getRam() == null || listing.getRam() <= 0) {
            return Result.error("RAM is required for laptop listings", "LAPTOP_RAM_REQUIRED");
        }
        if (listing.getStorage() == null || listing.getStorage() <= 0) {
            return Result.error("Storage is required for laptop listings", "LAPTOP_STORAGE_REQUIRED");
        }
        if (listing.getStorageType() == null) {
            return Result.error("Storage type is required for laptop listings", "LAPTOP_STORAGE_TYPE_REQUIRED");
        }
        if (listing.getProcessor() == null) {
            return Result.error("Processor is required for laptop listings", "LAPTOP_PROCESSOR_REQUIRED");
        }
        if (listing.getScreenSize() == null || listing.getScreenSize() <= 0) {
            return Result.error("Screen size is required for laptop listings", "LAPTOP_SCREEN_SIZE_REQUIRED");
        }
        if (listing.getYear() == null || listing.getYear() < 1990) {
            return Result.error("Year is required for laptop listings", "LAPTOP_YEAR_REQUIRED");
        }
        if (listing.isWarrantyProof() && (listing.getOrigin() == null || listing.getOrigin().isBlank())) {
            return Result.error("Origin is required when warranty proof is provided", "LAPTOP_ORIGIN_REQUIRED");
        }

        Integer batteryHealth = listing.getBatteryHealthPercent();
        if (batteryHealth != null && (batteryHealth < 1 || batteryHealth > 100)) {
            return Result.error("Battery health percent must be between 1 and 100", "LAPTOP_BATTERY_HEALTH_INVALID");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (!isLaptop(listing)) {
            return;
        }
        
        {
            listing.setBatteryCapacityMah(null);
            listing.setCameraMegapixels(null);
            listing.setSupports5g(null);
            listing.setDualSim(null);
            listing.setHasNfc(null);
            listing.setConnectionType(null);
            listing.setWireless(null);
            listing.setNoiseCancelling(null);
            listing.setHasMicrophone(null);
            listing.setBatteryLifeHours(null);
        }
    }

    private boolean isLaptop(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "LAPTOP".equalsIgnoreCase(type.getName());
    }
}

