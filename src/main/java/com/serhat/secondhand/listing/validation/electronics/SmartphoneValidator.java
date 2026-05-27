package com.serhat.secondhand.listing.validation.electronics;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.stereotype.Component;

@Component
public class SmartphoneValidator implements ElectronicSpecValidator {

    @Override
    public Result<Void> validate(ElectronicListing listing) {
        if (!isMobilePhone(listing)) {
            return Result.success();
        }

        if (listing.getStorage() == null || listing.getStorage() <= 0) {
            return Result.error("Storage is required for mobile phone listings", "MOBILE_PHONE_STORAGE_REQUIRED");
        }

        return Result.success();
    }

    @Override
    public void cleanup(ElectronicListing listing) {
        if (!isMobilePhone(listing)) {
            return;
        }
        
        {
            listing.setRam(null);
            listing.setProcessor(null);
            listing.setScreenSize(null);
            listing.setBatteryCapacityMah(null);
            listing.setCameraMegapixels(null);
            listing.setStorageType(null);
            listing.setGpuModel(null);
            listing.setOperatingSystem(null);
            listing.setConnectionType(null);
            listing.setWireless(null);
            listing.setNoiseCancelling(null);
            listing.setHasMicrophone(null);
            listing.setBatteryLifeHours(null);
            listing.setDualSim(null);
            listing.setSupports5g(null);
        }
    }

    private boolean isMobilePhone(ElectronicListing listing) {
        if (listing == null) {
            return false;
        }
        ElectronicType type = listing.getElectronicType();
        if (type == null || type.getName() == null) {
            return false;
        }
        return "MOBILE_PHONE".equalsIgnoreCase(type.getName());
    }
}
