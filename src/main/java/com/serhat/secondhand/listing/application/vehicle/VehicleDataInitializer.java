package com.serhat.secondhand.listing.application.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VehicleDataInitializer implements CommandLineRunner {

    private final CarBrandRepository brandRepository;
    private final VehicleModelRepository modelRepository;

    @Override
    public void run(String... args) {
        if (brandRepository.count() == 0) {
            seedBrands();
        }
        if (modelRepository.count() == 0) {
            seedModels();
        }
    }

    private void seedBrands() {
        List<String> brands = List.of(
                "Audi", "BMW", "Mercedes-Benz", "Toyota", "Volkswagen", "Hyundai", "Peugeot", "Nissan", "Kia",
                "Ford", "Suzuki", "TOGG", "Renault", "Škoda", "SEAT", "Cupra", "Honda", "Opel", "Tesla", "Fiat",
                "Jeep", "Volvo", "Citroën", "Mazda", "Mini", "Porsche", "Alfa Romeo", "Land Rover",
                "Dacia", "Mitsubishi", "Subaru", "Chevrolet", "Lexus", "Chery", "MG", "BYD", "Jaguar", "Infiniti"
        );

        for (String label : brands) {
            String key = toKey(label);
            CarBrand existing = brandRepository.findByNameIgnoreCase(key).orElse(null);
            if (existing != null) {
                if (existing.getLabel() == null || existing.getLabel().isBlank()) {
                    existing.setLabel(label);
                    brandRepository.save(existing);
                }
                continue;
            }
            CarBrand brand = new CarBrand();
            brand.setName(key);
            brand.setLabel(label);
            brandRepository.save(brand);
        }
    }

    private void seedModels() {
        Map<String, List<String>> brandModels = new LinkedHashMap<>();

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
            String brandKey = entry.getKey();
            CarBrand brand = brandRepository.findByNameIgnoreCase(brandKey).orElse(null);
            if (brand == null) {
                continue;
            }
            for (String modelName : entry.getValue()) {
                if (modelRepository.findByBrand_IdAndNameIgnoreCase(brand.getId(), modelName).isPresent()) {
                    continue;
                }
                VehicleModel model = new VehicleModel();
                model.setName(modelName);
                model.setBrand(brand);
                modelRepository.save(model);
            }
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
}

