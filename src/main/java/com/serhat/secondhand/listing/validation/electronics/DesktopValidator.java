package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class DesktopValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (!isDesktop(listing)) {
            return Result.success();
        }

        if (listing.getRam() == null || listing.getRam() <= 0) {
            return Result.error("RAM is required for desktop listings", "DESKTOP_RAM_REQUIRED");
        }
        if (listing.getStorage() == null || listing.getStorage() <= 0) {
            return Result.error("Storage is required for desktop listings", "DESKTOP_STORAGE_REQUIRED");
        }
        if (listing.getStorageType() == null) {
            return Result.error("Storage type is required for desktop listings", "DESKTOP_STORAGE_TYPE_REQUIRED");
        }
        if (listing.getProcessor() == null) {
            return Result.error("Processor is required for desktop listings", "DESKTOP_PROCESSOR_REQUIRED");
        }
        if (listing.getYear() == null || listing.getYear() < 1990) {
            return Result.error("Year is required for desktop listings", "DESKTOP_YEAR_REQUIRED");
        }
        if (listing.isWarrantyProof() && (listing.getOrigin() == null || listing.getOrigin().isBlank())) {
            return Result.error("Origin is required when warranty proof is provided", "DESKTOP_ORIGIN_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (!isDesktop(listing)) {
            return;
        }
        
        {
            listing.setBatteryCapacityMah(null);
            listing.setBatteryHealthPercent(null);
            listing.setBatteryLifeHours(null);
            listing.setCameraMegapixels(null);
            listing.setSupports5g(null);
            listing.setDualSim(null);
            listing.setHasNfc(null);
            listing.setConnectionType(null);
            listing.setWireless(null);
            listing.setNoiseCancelling(null);
            listing.setHasMicrophone(null);
        }
    }

    private boolean isDesktop(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "DESKTOP".equalsIgnoreCase(type.getName());
    }
}
