package com.serhat.secondhand.listing.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SportsListingResolver {
    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;

    public Result<SportsResolution> resolve(UUID disciplineId, UUID equipmentTypeId, UUID conditionId) {
        var discipline = sportDisciplineRepository.findById(disciplineId).orElse(null);
        if (discipline == null) return Result.error("Sport discipline not found", "SPORT_DISCIPLINE_NOT_FOUND");

        var equipmentType = sportEquipmentTypeRepository.findById(equipmentTypeId).orElse(null);
        if (equipmentType == null) return Result.error("Sport equipment type not found", "SPORT_EQUIPMENT_TYPE_NOT_FOUND");

        var condition = sportConditionRepository.findById(conditionId).orElse(null);
        if (condition == null) return Result.error("Sport condition not found", "SPORT_CONDITION_NOT_FOUND");

        return Result.success(new SportsResolution(discipline, equipmentType, condition));
    }

    public Result<Void> apply(
            SportsListing listing,
            Optional<UUID> disciplineId,
            Optional<UUID> equipmentTypeId,
            Optional<UUID> conditionId
    ) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (disciplineId != null && disciplineId.isPresent()) {
            var discipline = sportDisciplineRepository.findById(disciplineId.get()).orElse(null);
            if (discipline == null) return Result.error("Sport discipline not found", "SPORT_DISCIPLINE_NOT_FOUND");
            listing.setDiscipline(discipline);
        }

        if (equipmentTypeId != null && equipmentTypeId.isPresent()) {
            var equipmentType = sportEquipmentTypeRepository.findById(equipmentTypeId.get()).orElse(null);
            if (equipmentType == null) return Result.error("Sport equipment type not found", "SPORT_EQUIPMENT_TYPE_NOT_FOUND");
            listing.setEquipmentType(equipmentType);
        }

        if (conditionId != null && conditionId.isPresent()) {
            var condition = sportConditionRepository.findById(conditionId.get()).orElse(null);
            if (condition == null) return Result.error("Sport condition not found", "SPORT_CONDITION_NOT_FOUND");
            listing.setCondition(condition);
        }

        return Result.success();
    }
}

