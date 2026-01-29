package com.serhat.secondhand.listing.application.electronic;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ElectronicDataInitializer implements CommandLineRunner {

    private final ElectronicBrandRepository brandRepository;
    private final ElectronicTypeRepository typeRepository;
    private final ElectronicModelRepository modelRepository;

    @Override
    public void run(String... args) {
        seedBrands();
        seedTypes();
        seedModels();
        backfillNullModelTypes();
    }

    private void seedBrands() {
        List<String> brands = List.of(
                "Apple", "Samsung", "Xiaomi", "Sony", "Asus", "Huawei", "Dell", "HP", "Lenovo",
                "Microsoft", "Google", "LG", "Kodak", "Nikon", "BenQ", "Philips", "Fujitsu", "Oki", "JBL", "Decathlon",
                "Other"
        );
        for (String label : brands) {
            upsertBrand(label);
        }
    }

    private void seedTypes() {
        List<String> types = List.of(
                "Mobile Phone", "Laptop", "Tablet", "Game Console", "Headphones",
                "TV", "TV STB", "Speaker", "Camera", "Microphone",
                "Air Conditioner", "Washing Machine", "Kitchenary", "Video Player",
                "Other"
        );
        for (String label : types) {
            upsertType(label);
        }
    }

    private void seedModels() {
        ElectronicBrand apple = getBrand("APPLE");
        ElectronicBrand samsung = getBrand("SAMSUNG");
        ElectronicBrand xiaomi = getBrand("XIAOMI");
        ElectronicBrand sony = getBrand("SONY");
        ElectronicBrand asus = getBrand("ASUS");
        ElectronicBrand huawei = getBrand("HUAWEI");
        ElectronicBrand dell = getBrand("DELL");
        ElectronicBrand hp = getBrand("HP");
        ElectronicBrand lenovo = getBrand("LENOVO");
        ElectronicBrand microsoft = getBrand("MICROSOFT");
        ElectronicBrand google = getBrand("GOOGLE");
        ElectronicBrand lg = getBrand("LG");
        ElectronicBrand kodak = getBrand("KODAK");
        ElectronicBrand nikon = getBrand("NIKON");
        ElectronicBrand benq = getBrand("BENQ");
        ElectronicBrand philips = getBrand("PHILIPS");
        ElectronicBrand fujitsu = getBrand("FUJITSU");
        ElectronicBrand oki = getBrand("OKI");
        ElectronicBrand jbl = getBrand("JBL");
        ElectronicBrand otherBrand = getBrand("OTHER");

        ElectronicType mobilePhone = getType("MOBILE_PHONE");
        ElectronicType laptop = getType("LAPTOP");
        ElectronicType tablet = getType("TABLET");
        ElectronicType gameConsole = getType("GAME_CONSOLE");
        ElectronicType headphones = getType("HEADPHONES");
        ElectronicType tv = getType("TV");
        ElectronicType tvStb = getType("TV_STB");
        ElectronicType speaker = getType("SPEAKER");
        ElectronicType camera = getType("CAMERA");
        ElectronicType microphone = getType("MICROPHONE");
        ElectronicType airConditioner = getType("AIR_CONDITIONER");
        ElectronicType washingMachine = getType("WASHING_MACHINE");
        ElectronicType kitchenary = getType("KITCHENARY");
        ElectronicType videoPlayer = getType("VIDEO_PLAYER");

        if (apple != null && mobilePhone != null) {
            ensureModel(apple, mobilePhone, "iPhone 11");
            ensureModel(apple, mobilePhone, "iPhone 12");
            ensureModel(apple, mobilePhone, "iPhone 13");
            ensureModel(apple, mobilePhone, "iPhone 14");
            ensureModel(apple, mobilePhone, "iPhone 15");
            ensureModel(apple, mobilePhone, "iPhone 15 Pro");
            ensureModel(apple, mobilePhone, "iPhone 15 Pro Max");
        }
        if (apple != null && laptop != null) {
            ensureModel(apple, laptop, "MacBook Air M1");
            ensureModel(apple, laptop, "MacBook Air M2");
            ensureModel(apple, laptop, "MacBook Air M3");
            ensureModel(apple, laptop, "MacBook Pro 14");
            ensureModel(apple, laptop, "MacBook Pro 16");
        }
        if (apple != null && tablet != null) {
            ensureModel(apple, tablet, "iPad 9");
            ensureModel(apple, tablet, "iPad 10");
            ensureModel(apple, tablet, "iPad Air 5");
            ensureModel(apple, tablet, "iPad Air 6");
            ensureModel(apple, tablet, "iPad Mini 6");
            ensureModel(apple, tablet, "iPad Pro 11");
            ensureModel(apple, tablet, "iPad Pro 12.9");
        }
        if (apple != null && headphones != null) {
            ensureModel(apple, headphones, "AirPods 2");
            ensureModel(apple, headphones, "AirPods 3");
            ensureModel(apple, headphones, "AirPods Pro 2");
            ensureModel(apple, headphones, "AirPods Max");
        }

        if (samsung != null && mobilePhone != null) {
            ensureModel(samsung, mobilePhone, "Galaxy S21");
            ensureModel(samsung, mobilePhone, "Galaxy S22");
            ensureModel(samsung, mobilePhone, "Galaxy S23");
            ensureModel(samsung, mobilePhone, "Galaxy S24");
            ensureModel(samsung, mobilePhone, "Galaxy A54");
            ensureModel(samsung, mobilePhone, "Galaxy A55");
            ensureModel(samsung, mobilePhone, "Galaxy Z Flip 5");
            ensureModel(samsung, mobilePhone, "Galaxy Z Fold 5");
        }
        if (samsung != null && laptop != null) {
            ensureModel(samsung, laptop, "Galaxy Book 2");
            ensureModel(samsung, laptop, "Galaxy Book 3");
            ensureModel(samsung, laptop, "Galaxy Book 4");
            ensureModel(samsung, laptop, "Galaxy Book Pro");
        }
        if (samsung != null && tablet != null) {
            ensureModel(samsung, tablet, "Galaxy Tab S8");
            ensureModel(samsung, tablet, "Galaxy Tab S9");
            ensureModel(samsung, tablet, "Galaxy Tab A8");
        }
        if (samsung != null && headphones != null) {
            ensureModel(samsung, headphones, "Galaxy Buds 2");
            ensureModel(samsung, headphones, "Galaxy Buds 2 Pro");
            ensureModel(samsung, headphones, "Galaxy Buds FE");
        }
        if (samsung != null && tv != null) {
            ensureModel(samsung, tv, "55Q60C");
        }
        if (samsung != null && kitchenary != null) {
            ensureModel(samsung, kitchenary, "Smart MW7000K");
        }

        if (xiaomi != null && mobilePhone != null) {
            ensureModel(xiaomi, mobilePhone, "Xiaomi 12");
            ensureModel(xiaomi, mobilePhone, "Xiaomi 13");
            ensureModel(xiaomi, mobilePhone, "Xiaomi 14");
            ensureModel(xiaomi, mobilePhone, "Xiaomi 13 Pro");
            ensureModel(xiaomi, mobilePhone, "Redmi Note 12");
            ensureModel(xiaomi, mobilePhone, "Redmi Note 13");
            ensureModel(xiaomi, mobilePhone, "POCO X5");
            ensureModel(xiaomi, mobilePhone, "POCO X6");
        }
        if (xiaomi != null && tablet != null) {
            ensureModel(xiaomi, tablet, "Xiaomi Pad 5");
            ensureModel(xiaomi, tablet, "Xiaomi Pad 6");
        }
        if (xiaomi != null && headphones != null) {
            ensureModel(xiaomi, headphones, "Redmi Buds 4");
            ensureModel(xiaomi, headphones, "Redmi Buds 5");
        }
        if (xiaomi != null && speaker != null) {
            ensureModel(xiaomi, speaker, "Mi Smart Speaker");
        }

        if (sony != null && gameConsole != null) {
            ensureModel(sony, gameConsole, "PlayStation 4");
            ensureModel(sony, gameConsole, "PlayStation 4 Pro");
            ensureModel(sony, gameConsole, "PlayStation 5");
            ensureModel(sony, gameConsole, "PlayStation 5 Slim");
            ensureModel(sony, gameConsole, "PlayStation VR");
        }
        if (sony != null && headphones != null) {
            ensureModel(sony, headphones, "WH-1000XM4");
            ensureModel(sony, headphones, "WH-1000XM5");
            ensureModel(sony, headphones, "WF-1000XM4");
            ensureModel(sony, headphones, "WF-1000XM5");
        }
        if (sony != null && mobilePhone != null) {
            ensureModel(sony, mobilePhone, "Xperia 1 V");
            ensureModel(sony, mobilePhone, "Xperia 5 V");
        }
        if (sony != null && tv != null) {
            ensureModel(sony, tv, "BRAVIA 43");
            ensureModel(sony, tv, "BRAVIA XR 55");
        }
        if (sony != null && camera != null) {
            ensureModel(sony, camera, "ZV-E10");
            ensureModel(sony, camera, "Alpha 6400");
        }
        if (sony != null && microphone != null) {
            ensureModel(sony, microphone, "UWP-D22");
        }

        if (asus != null && laptop != null) {
            ensureModel(asus, laptop, "ZenBook 14");
            ensureModel(asus, laptop, "VivoBook 15");
            ensureModel(asus, laptop, "ROG Zephyrus G14");
            ensureModel(asus, laptop, "ROG Zephyrus G15");
            ensureModel(asus, laptop, "TUF Gaming F15");
            ensureModel(asus, laptop, "TUF Gaming");
        }
        if (asus != null && headphones != null) {
            ensureModel(asus, headphones, "TUF H3");
        }
        if (asus != null && tablet != null) {
            ensureModel(asus, tablet, "Pad 10");
            ensureModel(asus, tablet, "Pad 11");
        }

        if (huawei != null && mobilePhone != null) {
            ensureModel(huawei, mobilePhone, "P40");
            ensureModel(huawei, mobilePhone, "P50");
            ensureModel(huawei, mobilePhone, "Mate 50");
        }
        if (huawei != null && laptop != null) {
            ensureModel(huawei, laptop, "MateBook D14");
            ensureModel(huawei, laptop, "MateBook D15");
            ensureModel(huawei, laptop, "MateBook D16");
            ensureModel(huawei, laptop, "MateBook X Pro");
        }
        if (huawei != null && tablet != null) {
            ensureModel(huawei, tablet, "MatePad 11");
            ensureModel(huawei, tablet, "MatePad Pro");
        }
        if (huawei != null && headphones != null) {
            ensureModel(huawei, headphones, "FreeBuds 5i");
        }

        if (dell != null && laptop != null) {
            ensureModel(dell, laptop, "Inspiron 15");
            ensureModel(dell, laptop, "XPS 13");
            ensureModel(dell, laptop, "XPS 15");
            ensureModel(dell, laptop, "Latitude 5440");
        }

        if (hp != null && laptop != null) {
            ensureModel(hp, laptop, "Pavilion 15");
            ensureModel(hp, laptop, "Envy 13");
            ensureModel(hp, laptop, "Spectre x360");
            ensureModel(hp, laptop, "Victus 16");
        }

        if (lenovo != null && laptop != null) {
            ensureModel(lenovo, laptop, "IdeaPad 3");
            ensureModel(lenovo, laptop, "IdeaPad 5");
            ensureModel(lenovo, laptop, "ThinkPad E14");
            ensureModel(lenovo, laptop, "ThinkPad X1 Carbon");
            ensureModel(lenovo, laptop, "Legion 5");
        }

        if (microsoft != null) {
            if (laptop != null) {
                ensureModel(microsoft, laptop, "Surface Laptop 4");
                ensureModel(microsoft, laptop, "Surface Laptop Studio");
            }
            if (tablet != null) {
                ensureModel(microsoft, tablet, "Surface Pro 9");
                ensureModel(microsoft, tablet, "Surface Go 3");
            }
            if (gameConsole != null) {
                ensureModel(microsoft, gameConsole, "Xbox Series X");
                ensureModel(microsoft, gameConsole, "Xbox Series S");
            }
        }

        if (google != null && mobilePhone != null) {
            ensureModel(google, mobilePhone, "Pixel 7 Pro");
            ensureModel(google, mobilePhone, "Pixel 8");
            ensureModel(google, mobilePhone, "Pixel 8 Pro");
        }
        if (google != null && tablet != null) {
            ensureModel(google, tablet, "Pixel Tablet");
        }
        if (google != null && speaker != null) {
            ensureModel(google, speaker, "Nest Audio");
        }

        if (lg != null && tv != null) {
            ensureModel(lg, tv, "LG OLED 55");
            ensureModel(lg, tv, "65UP8100");
            ensureModel(lg, tv, "WebOs");
        }
        if (lg != null && washingMachine != null) {
            ensureModel(lg, washingMachine, "TurboWash 9kg");
            ensureModel(lg, washingMachine, "LG Washing Machine 10kg");
        }
        if (lg != null && airConditioner != null) {
            ensureModel(lg, airConditioner, "Standard");
        }

        if (philips != null && tvStb != null) {
            ensureModel(philips, tvStb, "TV Box 4K");
        }
        if (philips != null && kitchenary != null) {
            ensureModel(philips, kitchenary, "HR3573");
        }
        if (philips != null && airConditioner != null) {
            ensureModel(philips, airConditioner, "Standard");
        }
        if (philips != null && headphones != null) {
            ensureModel(philips, headphones, "Standard");
        }

        if (kodak != null && camera != null) {
            ensureModel(kodak, camera, "EasyShare C1530");
            ensureModel(kodak, camera, "Standard");
        }
        if (nikon != null && camera != null) {
            ensureModel(nikon, camera, "D7500");
            ensureModel(nikon, camera, "Standard");
        }
        if (benq != null && videoPlayer != null) {
            ensureModel(benq, videoPlayer, "W1070+");
        }
        if (benq != null && tv != null) {
            ensureModel(benq, tv, "40 inch");
            ensureModel(benq, tv, "44 inch");
            ensureModel(benq, tv, "53 inch");
        }

        if (fujitsu != null && airConditioner != null) {
            ensureModel(fujitsu, airConditioner, "12K Inverter");
        }
        if (oki != null && tv != null) {
            ensureModel(oki, tv, "41 inch");
            ensureModel(oki, tv, "59 inch");
        }

        if (jbl != null && speaker != null) {
            ensureModel(jbl, speaker, "JBL Flip 6");
        }

        if (otherBrand != null) {
            if (speaker != null) {
                ensureModel(otherBrand, speaker, "Standard");
            }
            if (tv != null) {
                ensureModel(otherBrand, tv, "Standard");
            }
        }
    }

    private void ensureModel(ElectronicBrand brand, ElectronicType type, String modelName) {
        if (brand == null || type == null || modelName == null || modelName.isBlank()) {
            return;
        }
        if (modelRepository.findByBrand_IdAndType_IdAndNameIgnoreCase(brand.getId(), type.getId(), modelName).isEmpty()) {
            ElectronicModel created = new ElectronicModel();
            created.setBrand(brand);
            created.setType(type);
            created.setName(modelName);
            modelRepository.save(created);
        }
        List<ElectronicModel> existingModels = modelRepository.findAllByBrand_IdAndNameIgnoreCase(brand.getId(), modelName);
        for (ElectronicModel m : existingModels) {
            if (m.getType() == null) {
                m.setType(type);
                modelRepository.save(m);
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

    private ElectronicBrand getBrand(String name) {
        if (name == null) {
            return null;
        }
        return brandRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private ElectronicType getType(String name) {
        if (name == null) {
            return null;
        }
        return typeRepository.findByNameIgnoreCase(name).orElse(null);
    }

    private ElectronicBrand upsertBrand(String label) {
        String key = toKey(label);
        Optional<ElectronicBrand> existing = brandRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ElectronicBrand brand = existing.get();
            if (brand.getLabel() == null || brand.getLabel().isBlank()) {
                brand.setLabel(label);
                return brandRepository.save(brand);
            }
            return brand;
        }
        ElectronicBrand brand = new ElectronicBrand();
        brand.setName(key);
        brand.setLabel(label);
        return brandRepository.save(brand);
    }

    private ElectronicType upsertType(String label) {
        String key = toKey(label);
        Optional<ElectronicType> existing = typeRepository.findByNameIgnoreCase(key);
        if (existing.isPresent()) {
            ElectronicType type = existing.get();
            if (type.getLabel() == null || type.getLabel().isBlank()) {
                type.setLabel(label);
                return typeRepository.save(type);
            }
            return type;
        }
        ElectronicType type = new ElectronicType();
        type.setName(key);
        type.setLabel(label);
        return typeRepository.save(type);
    }

    private void backfillNullModelTypes() {
        ElectronicType mobilePhone = getType("MOBILE_PHONE");
        ElectronicType laptop = getType("LAPTOP");
        ElectronicType tablet = getType("TABLET");
        ElectronicType gameConsole = getType("GAME_CONSOLE");
        ElectronicType headphones = getType("HEADPHONES");
        ElectronicType other = getType("OTHER");

        List<ElectronicModel> nullTypedModels = modelRepository.findByTypeIsNull();
        for (ElectronicModel m : nullTypedModels) {
            String name = m.getName();
            if (name == null) {
                if (other != null) {
                    m.setType(other);
                    modelRepository.save(m);
                }
                continue;
            }
            String n = name.trim().toLowerCase(Locale.ROOT);
            ElectronicType inferred =
                    (mobilePhone != null && (n.startsWith("iphone") || n.startsWith("pixel") || n.contains("galaxy s") || n.contains("redmi") || n.contains("poco") || n.startsWith("xiaomi "))) ? mobilePhone :
                    (laptop != null && (n.startsWith("macbook") || n.contains("galaxy book") || n.contains("matebook") || n.contains("thinkpad") || n.contains("ideapad") || n.contains("inspiron") || n.contains("xps") || n.contains("pavilion") || n.contains("spectre") || n.contains("zenbook") || n.contains("vivobook") || n.contains("legion") || n.contains("rog") || n.contains("tuf"))) ? laptop :
                    (tablet != null && (n.startsWith("ipad") || n.contains("tab ") || n.contains("matepad") || n.contains("pad "))) ? tablet :
                    (gameConsole != null && (n.startsWith("playstation") || n.startsWith("xbox") || n.contains("nintendo"))) ? gameConsole :
                    (headphones != null && (n.contains("airpods") || n.contains("buds") || n.startsWith("wh-") || n.startsWith("wf-") || n.contains("freebuds"))) ? headphones :
                    other;

            if (inferred != null) {
                m.setType(inferred);
                modelRepository.save(m);
            }
        }
    }
}

