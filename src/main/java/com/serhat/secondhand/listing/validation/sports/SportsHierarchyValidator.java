package com.serhat.secondhand.listing.validation.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.SportsListing;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SportsHierarchyValidator implements SportsSpecValidator {

    @Override
    public Result<Void> validate(SportsListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (isDisciplineMismatch(listing.getDiscipline(), listing.getEquipmentType())) {
            return Result.error("Sport equipment type does not belong to selected discipline", "SPORT_EQUIPMENT_DISCIPLINE_MISMATCH");
        }

        return Result.success();
    }

    @Override
    public void cleanup(SportsListing listing) {
    }

    private boolean isDisciplineMismatch(SportDiscipline discipline, SportEquipmentType equipmentType) {
        if (discipline == null || equipmentType == null) {
            return false;
        }

        // 1. Direct foreign key check if relation is populated
        if (equipmentType.getDiscipline() != null) {
            UUID selectedId = discipline.getId();
            UUID equipDisciplineId = equipmentType.getDiscipline().getId();
            if (selectedId != null && equipDisciplineId != null) {
                return !selectedId.equals(equipDisciplineId);
            }
        }

        // 2. Fallback prefix check (e.g. FOOTBALL_BALL -> starts with FOOTBALL_)
        String discName = discipline.getName();
        String equipName = equipmentType.getName();
        if (discName == null || equipName == null) {
            return false;
        }

        // Universal equipment or "OTHER" discipline allows any
        if ("OTHER_EQUIPMENT".equalsIgnoreCase(equipName) || "OTHER".equalsIgnoreCase(discName)) {
            return false;
        }

        return !equipName.toUpperCase().startsWith(discName.toUpperCase() + "_");
    }
}
