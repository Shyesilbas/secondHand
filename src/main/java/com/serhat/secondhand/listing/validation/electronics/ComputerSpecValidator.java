package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class ComputerSpecValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (listing == null) {
            return Result.success();
        }

        boolean isLaptop = isType(listing, "LAPTOP");
        boolean isDesktop = isType(listing, "DESKTOP");

        if (!isLaptop && !isDesktop) {
            return Result.success();
        }

        // --- Common Required Validations ---
        if (listing.getRam() == null || listing.getRam() <= 0) {
            return Result.error("RAM is required and must be greater than 0", "COMPUTER_RAM_REQUIRED");
        }
        if (listing.getStorage() == null || listing.getStorage() <= 0) {
            return Result.error("Storage is required and must be greater than 0", "COMPUTER_STORAGE_REQUIRED");
        }
        if (listing.getStorageType() == null) {
            return Result.error("Storage type is required", "COMPUTER_STORAGE_TYPE_REQUIRED");
        }
        if (listing.getProcessor() == null) {
            return Result.error("Processor is required", "COMPUTER_PROCESSOR_REQUIRED");
        }

        // --- Year Validation (Optional, but if present must be >= 1990) ---
        if (listing.getYear() != null && listing.getYear() < 1990) {
            return Result.error("Year must be 1990 or later", "COMPUTER_YEAR_INVALID");
        }

        // --- Origin Validation (If warrantyProof is true, origin is required) ---
        if (listing.isWarrantyProof() && (listing.getOrigin() == null || listing.getOrigin().isBlank())) {
            return Result.error("Origin is required when warranty proof is provided", "COMPUTER_ORIGIN_REQUIRED");
        }

        // --- Laptop Specific Validations ---
        if (isLaptop) {
            // Screen Size (Optional, but if present must be > 0)
            if (listing.getScreenSize() != null && listing.getScreenSize() <= 0) {
                return Result.error("Screen size must be greater than 0", "LAPTOP_SCREEN_SIZE_INVALID");
            }

            // Battery Health (Optional, but if present must be 1-100)
            Integer batteryHealth = listing.getBatteryHealthPercent();
            if (batteryHealth != null && (batteryHealth < 1 || batteryHealth > 100)) {
                return Result.error("Battery health percent must be between 1 and 100", "LAPTOP_BATTERY_HEALTH_INVALID");
            }
        }


        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (listing == null) {
            return;
        }

        boolean isLaptop = isType(listing, "LAPTOP");
        boolean isDesktop = isType(listing, "DESKTOP");

        if (!isLaptop && !isDesktop) {
            return;
        }

        // --- Common Cleanup (Phone & Headphone fields are nullified) ---
        listing.setBatteryReplaced(null);
        listing.setBatteryOriginal(null);
        listing.setScreenReplaced(null);
        listing.setBodyReplaced(null);
        listing.setFaceIdWorking(null);
        listing.setTouchIdWorking(null);
        listing.setImeiRegistered(null);
        listing.setDualSim(null);
        listing.setSupports5g(null);
        listing.setHasNfc(null);
        listing.setCameraMegapixels(null);

        listing.setConnectionType(null);
        listing.setWireless(null);
        listing.setNoiseCancelling(null);
        listing.setHasMicrophone(null);
        listing.setBatteryLifeHours(null);

        // --- Desktop Specific Cleanup ---
        if (isDesktop) {
            listing.setScreenSize(null);
            listing.setBatteryHealthPercent(null);
            listing.setBatteryCapacityMah(null);
        }
    }

    private boolean isType(ElectronicListing listing, String typeName) {
        ElectronicType type = listing.getElectronicType();
        return type != null && type.getName() != null && typeName.equalsIgnoreCase(type.getName());
    }
}
