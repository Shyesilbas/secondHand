package com.serhat.secondhand.listing.application.sports;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class SportsDataInitializer implements SeedTask {

    private final SportDisciplineRepository sportDisciplineRepository;
    private final SportEquipmentTypeRepository sportEquipmentTypeRepository;
    private final SportConditionRepository sportConditionRepository;

    @Override
    public String key() {
        return "sports";
    }

    @Override
    public Result<Void> run() {
        if (sportDisciplineRepository.count() == 0) {
            seedDisciplines();
        }
        if (sportEquipmentTypeRepository.count() == 0) {
            seedEquipmentTypes();
        }
        if (sportConditionRepository.count() == 0) {
            seedConditions();
        }
        return Result.success();
    }

    private void seedDisciplines() {
        List<String> labels = List.of(
                "Football",
                "Basketball",
                "Tennis",
                "Volleyball",
                "Running",
                "Cycling",
                "Fitness",
                "Swimming",
                "Boxing",
                "Other"
        );

        for (String label : labels) {
            SportDiscipline discipline = new SportDiscipline();
            discipline.setName(toKey(label));
            discipline.setLabel(label);
            sportDisciplineRepository.save(discipline);
        }
    }

    private void seedEquipmentTypes() {
        List<String> labels = List.of(
                "Ball",
                "Shoes",
                "Cleats",
                "Jersey",
                "Shorts",
                "Sleeve",
                "Wristband",
                "Gloves",
                "Racket",
                "Helmet",
                "Treadmill",
                "Exercise Bike",
                "Other"
        );

        for (String label : labels) {
            SportEquipmentType equipmentType = new SportEquipmentType();
            equipmentType.setName(toKey(label));
            equipmentType.setLabel(label);
            sportEquipmentTypeRepository.save(equipmentType);
        }
    }

    private void seedConditions() {
        List<String> labels = List.of(
                "New",
                "Like New",
                "Good",
                "Fair",
                "Worn"
        );

        for (String label : labels) {
            SportCondition condition = new SportCondition();
            condition.setName(toKey(label));
            condition.setLabel(label);
            sportConditionRepository.save(condition);
        }
    }

    private String toKey(String label) {
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFKD)
                .replaceAll("\\p{M}", "");
        return normalized.trim()
                .toUpperCase(Locale.ROOT)
                .replace('&', ' ')
                .replace('\'', ' ')
                .replace('-', ' ')
                .replaceAll("\\s+", "_");
    }
}

