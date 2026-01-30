package com.serhat.secondhand.listing.domain.dto.request.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicConnectionType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public record ElectronicUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<Integer> quantity,
        Optional<String> city,
        Optional<String> district,
        Optional<UUID> electronicTypeId,
        Optional<UUID> electronicBrandId,
        Optional<UUID> electronicModelId,
        Optional<String> origin,
        Optional<Boolean> warrantyProof,
        Optional<Integer> year,
        Optional<Color> color,
        Optional<String> imageUrl,
        Optional<Integer> ram,
        Optional<Integer> storage,
        Optional<StorageType> storageType,
        Optional<Processor> processor,
        Optional<Integer> screenSize,
        Optional<String> gpuModel,
        Optional<String> operatingSystem,
        Optional<Integer> batteryHealthPercent,
        Optional<Integer> batteryCapacityMah,
        Optional<Integer> cameraMegapixels,
        Optional<Boolean> supports5g,
        Optional<Boolean> dualSim,
        Optional<Boolean> hasNfc,
        Optional<ElectronicConnectionType> connectionType,
        Optional<Boolean> wireless,
        Optional<Boolean> noiseCancelling,
        Optional<Boolean> hasMicrophone,
        Optional<Integer> batteryLifeHours
) {
}
