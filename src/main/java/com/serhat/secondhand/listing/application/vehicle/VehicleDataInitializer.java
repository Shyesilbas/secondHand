package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.core.seed.SeedTask;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleListingRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTypeRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class VehicleDataInitializer implements SeedTask {

    private final CarBrandRepository brandRepository;
    private final VehicleTypeRepository typeRepository;
    private final VehicleModelRepository modelRepository;
    private final VehicleListingRepository vehicleListingRepository;

    @Override
    public String key() {
        return "vehicle";
    }

    @Override
    @Transactional
    public Result<Void> run() {
        dedupeDuplicateModels();
        seedBrands();
        seedTypes();
        seedModels();
        backfillNullModelTypes();
        return Result.success();
    }

    private void dedupeDuplicateModels() {
        List<Object[]> duplicates = modelRepository.findDuplicateModelKeys();
        for (Object[] row : duplicates) {
            if (row == null || row.length < 3) {
                continue;
            }
            UUID brandId = (UUID) row[0];
            UUID typeId = (UUID) row[1];
            String nameKey = (String) row[2];

            List<VehicleModel> models = typeId == null
                    ? modelRepository.findAllByBrand_IdAndTypeIsNullAndNameIgnoreCase(brandId, nameKey)
                    : modelRepository.findAllByBrand_IdAndType_IdAndNameIgnoreCase(brandId, typeId, nameKey);

            if (models == null || models.size() < 2) {
                continue;
            }

            VehicleModel keep = models.stream()
                    .max(Comparator.<VehicleModel>comparingLong(m -> vehicleListingRepository.countByModel_Id(m.getId()))
                            .thenComparing(m -> String.valueOf(m.getId())))
                    .orElse(models.get(0));

            List<UUID> deleteIds = models.stream()
                    .filter(m -> m.getId() != null && !m.getId().equals(keep.getId()))
                    .map(VehicleModel::getId)
                    .toList();

            if (deleteIds.isEmpty()) {
                continue;
            }

            vehicleListingRepository.reassignModel(keep, deleteIds);
            modelRepository.deleteAllById(deleteIds);
        }
    }

    private void seedBrands() {
        List<String> brands = List.of(
                "Audi", "BMW", "Mercedes-Benz", "Toyota", "Volkswagen", "Hyundai", "Peugeot", "Nissan", "Kia",
                "Ford", "Suzuki", "TOGG", "Renault", "Škoda", "SEAT", "Cupra", "Honda", "Opel", "Tesla", "Fiat",
                "Jeep", "Volvo", "Citroën", "Mazda", "Mini", "Porsche", "Alfa Romeo", "Land Rover",
                "Dacia", "Mitsubishi", "Subaru", "Chevrolet", "Lexus", "Chery", "MG", "BYD", "Jaguar", "Infiniti",
                "Yamaha", "Kawasaki", "Ducati", "KTM", "Vespa", "Harley-Davidson", "Triumph"
        );

        for (String label : brands) {
            upsertBrand(label);
        }
    }

    private void seedTypes() {
        List<String> types = List.of(
                "Car",
                "Motorcycle",
                "Scooter",
                "Bicycle",
                "Truck",
                "Van",
                "Other"
        );
        for (String label : types) {
            upsertType(label);
        }
    }

    private void seedModels() {
        Map<String, List<String>> brandModels = new LinkedHashMap<>();

        VehicleType car = getType("CAR");
        VehicleType motorcycle = getType("MOTORCYCLE");
        VehicleType scooter = getType("SCOOTER");

        brandModels.put("AUDI", List.of("A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "e-tron"));
        brandModels.put("BMW", List.of("1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "i3", "i4", "iX", "Z4"));
        brandModels.put("MERCEDES_BENZ", List.of("A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "EQB", "EQC", "EQS"));
        brandModels.put("TOYOTA", List.of("Corolla", "Yaris", "Auris", "C-HR", "RAV4", "Hilux", "Land Cruiser", "Camry", "Prius", "Proace", "Supra"));
        brandModels.put("VOLKSWAGEN", List.of("Polo", "Golf", "Jetta", "Passat", "Arteon", "T-Cross", "T-Roc", "Tiguan", "Touareg", "Transporter", "ID.3", "ID.4", "ID.7"));
        brandModels.put("HYUNDAI", List.of("i10", "i20", "i30", "Elantra", "Accent", "Bayon", "Kona", "Tucson", "Santa Fe", "IONIQ 5", "IONIQ 6"));
        brandModels.put("PEUGEOT", List.of("208", "308", "508", "2008", "3008", "5008", "Rifter", "Partner", "Traveller"));
        brandModels.put("NISSAN", List.of("Micra", "Juke", "Qashqai", "X-Trail", "Navara", "Leaf"));
        brandModels.put("KIA", List.of("Picanto", "Rio", "Ceed", "Stonic", "Sportage", "Sorento", "EV6", "Niro"));
        brandModels.put("FORD", List.of("Fiesta", "Focus", "Mondeo", "Puma", "Kuga", "Edge", "Ranger", "Transit", "Mustang", "Explorer"));
        brandModels.put("SUZUKI", List.of("Swift", "Vitara", "S-Cross", "Jimny", "Ignis"));
        brandModels.put("TOGG", List.of("T10X"));
        brandModels.put("RENAULT", List.of("Clio", "Megane", "Talisman", "Captur", "Kadjar", "Austral", "Koleos", "Symbol", "Kangoo"));
        brandModels.put("SKODA", List.of("Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"));
        brandModels.put("SEAT", List.of("Ibiza", "Leon", "Arona", "Ateca", "Tarraco"));
        brandModels.put("CUPRA", List.of("Formentor", "Ateca", "Leon", "Born"));
        brandModels.put("HONDA", List.of("Jazz", "Civic", "Accord", "CR-V", "HR-V", "ZR-V"));
        brandModels.put("OPEL", List.of("Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Combo"));
        brandModels.put("TESLA", List.of("Model 3", "Model S", "Model X", "Model Y"));
        brandModels.put("FIAT", List.of("Egea", "500", "500X", "Panda", "Doblo", "Fiorino", "Tipo"));
        brandModels.put("JEEP", List.of("Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler"));
        brandModels.put("VOLVO", List.of("S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "EX30", "EX90"));
        brandModels.put("CITROEN", List.of("C3", "C4", "C4 X", "C5 Aircross", "Berlingo", "Jumpy"));
        brandModels.put("MAZDA", List.of("Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-60"));
        brandModels.put("MINI", List.of("Cooper", "Cooper S", "Clubman", "Countryman", "John Cooper Works"));
        brandModels.put("PORSCHE", List.of("911", "Cayenne", "Macan", "Panamera", "Taycan", "Boxster", "Cayman"));
        brandModels.put("ALFA_ROMEO", List.of("Giulia", "Stelvio", "Tonale", "Giulietta", "MiTo"));
        brandModels.put("LAND_ROVER", List.of("Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"));
        brandModels.put("DACIA", List.of("Sandero", "Logan", "Duster", "Jogger", "Spring"));
        brandModels.put("MITSUBISHI", List.of("Lancer", "ASX", "Eclipse Cross", "Outlander", "Pajero"));
        brandModels.put("SUBARU", List.of("Impreza", "Legacy", "Forester", "Outback", "XV"));
        brandModels.put("CHEVROLET", List.of("Spark", "Aveo", "Cruze", "Captiva", "Camaro"));
        brandModels.put("LEXUS", List.of("CT", "IS", "ES", "GS", "LS", "UX", "NX", "RX"));
        brandModels.put("CHERY", List.of("Tiggo 7 Pro", "Tiggo 8 Pro", "Omoda 5"));
        brandModels.put("MG", List.of("ZS", "HS", "MG4", "Marvel R", "RX5"));
        brandModels.put("BYD", List.of("Atto 3", "Dolphin", "Seal", "Han", "Tang"));
        brandModels.put("JAGUAR", List.of("XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace"));
        brandModels.put("INFINITI", List.of("Q30", "Q50", "Q60", "QX30", "QX50", "QX70"));

        for (Map.Entry<String, List<String>> entry : brandModels.entrySet()) {
            CarBrand brand = getBrand(entry.getKey());
            if (brand == null || car == null) {
                continue;
            }
            for (String modelName : entry.getValue()) {
                ensureModel(brand, car, modelName);
            }
        }

        if (motorcycle != null) {
            CarBrand honda = getBrand("HONDA");
            CarBrand yamaha = getBrand("YAMAHA");
            CarBrand kawasaki = getBrand("KAWASAKI");
            CarBrand bmw = getBrand("BMW");
            CarBrand ducati = getBrand("DUCATI");
            CarBrand ktm = getBrand("KTM");
            CarBrand triumph = getBrand("TRIUMPH");
            CarBrand harley = getBrand("HARLEY_DAVIDSON");

            if (honda != null) {
                ensureModel(honda, motorcycle, "CBR 600RR");
                ensureModel(honda, motorcycle, "CB 650R");
                ensureModel(honda, motorcycle, "Africa Twin");
            }
            if (yamaha != null) {
                ensureModel(yamaha, motorcycle, "MT-07");
                ensureModel(yamaha, motorcycle, "R6");
                ensureModel(yamaha, motorcycle, "Tenere 700");
            }
            if (kawasaki != null) {
                ensureModel(kawasaki, motorcycle, "Ninja 400");
                ensureModel(kawasaki, motorcycle, "Z900");
            }
            if (bmw != null) {
                ensureModel(bmw, motorcycle, "R 1250 GS");
                ensureModel(bmw, motorcycle, "S 1000 RR");
            }
            if (ducati != null) {
                ensureModel(ducati, motorcycle, "Monster");
                ensureModel(ducati, motorcycle, "Panigale V4");
            }
            if (ktm != null) {
                ensureModel(ktm, motorcycle, "390 Duke");
                ensureModel(ktm, motorcycle, "1290 Super Duke R");
            }
            if (triumph != null) {
                ensureModel(triumph, motorcycle, "Street Triple");
                ensureModel(triumph, motorcycle, "Tiger 900");
            }
            if (harley != null) {
                ensureModel(harley, motorcycle, "Iron 883");
                ensureModel(harley, motorcycle, "Street Bob");
            }
        }

        if (scooter != null) {
            CarBrand vespa = getBrand("VESPA");
            CarBrand yamaha = getBrand("YAMAHA");
            CarBrand honda = getBrand("HONDA");
            if (vespa != null) {
                ensureModel(vespa, scooter, "Primavera 150");
                ensureModel(vespa, scooter, "GTS 300");
            }
            if (yamaha != null) {
                ensureModel(yamaha, scooter, "NMAX 125");
            }
            if (honda != null) {
                ensureModel(honda, scooter, "PCX 125");
            }
        }
    }

    private void ensureModel(CarBrand brand, VehicleType type, String modelName) {
        if (brand == null || type == null || modelName == null || modelName.isBlank()) {
            return;
        }
        if (modelRepository.findAllByBrand_IdAndType_IdAndNameIgnoreCase(brand.getId(), type.getId(), modelName).isEmpty()) {
            VehicleModel created = new VehicleModel();
            created.setBrand(brand);
            created.setType(type);
            created.setName(modelName);
            modelRepository.save(created);
        }
        List<VehicleModel> existingModels = modelRepository.findAllByBrand_IdAndNameIgnoreCase(brand.getId(), modelName);
        for (VehicleModel m : existingModels) {
            if (m.getType() == null) {
                m.setType(type);
                modelRepository.save(m);
            }
        }
    }

    private void backfillNullModelTypes() {
        VehicleType car = getType("CAR");
        if (car == null) {
            return;
        }
        List<VehicleModel> nullTypedModels = modelRepository.findByTypeIsNull();
        for (VehicleModel m : nullTypedModels) {
            m.setType(car);
            modelRepository.save(m);
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
                .replace('.', ' ')
                .replaceAll("\\s+", "_");
    }

    private CarBrand upsertBrand(String label) {
        String key = toKey(label);
        Optional<CarBrand> existing = brandRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            CarBrand brand = existing.get();
            if (brand.getLabel() == null || brand.getLabel().isBlank()) {
                brand.setLabel(label);
                return brandRepository.save(brand);
            }
            return brand;
        }
        CarBrand brand = new CarBrand();
        brand.setName(key);
        brand.setLabel(label);
        return brandRepository.save(brand);
    }

    private VehicleType upsertType(String label) {
        String key = toKey(label);
        Optional<VehicleType> existing = typeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            VehicleType type = existing.get();
            if (type.getLabel() == null || type.getLabel().isBlank()) {
                type.setLabel(label);
                return typeRepository.save(type);
            }
            return type;
        }
        VehicleType type = new VehicleType();
        type.setName(key);
        type.setLabel(label);
        return typeRepository.save(type);
    }

    private CarBrand getBrand(String name) {
        if (name == null) {
            return null;
        }
        return brandRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private VehicleType getType(String name) {
        if (name == null) {
            return null;
        }
        return typeRepository.findByNameIgnoreCase(name).orElse(null);
    }
}

