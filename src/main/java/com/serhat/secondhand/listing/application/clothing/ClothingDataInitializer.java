package com.serhat.secondhand.listing.application.clothing;

import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingBrand;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ClothingDataInitializer implements CommandLineRunner {

    private final ClothingBrandRepository brandRepository;
    private final ClothingTypeRepository typeRepository;

    @Override
    public void run(String... args) {
        if (brandRepository.count() == 0) {
            seedBrands();
        }
        if (typeRepository.count() == 0) {
            seedTypes();
        }
    }

    private void seedBrands() {
        List<String> brands = List.of(
                "Nike", "Adidas", "Puma", "Under Armour", "Reebok", "New Balance", "Converse", "Vans", "Asics",
                "Zara", "H&M", "Uniqlo", "GAP", "Mango", "Bershka", "Pull&Bear", "Stradivarius", "Massimo Dutti",
                "Tommy Hilfiger", "Calvin Klein", "Lacoste", "Ralph Lauren", "Levi's", "Diesel", "Armani",
                "The North Face", "Columbia", "Patagonia",
                "Gucci", "Prada", "Louis Vuitton", "Chanel", "Hermès", "Burberry",
                "Decathlon", "Quechua", "Kipsta", "Domyos",
                "Other"
        );

        for (String label : brands) {
            ClothingBrand brand = new ClothingBrand();
            brand.setName(toKey(label));
            brand.setLabel(label);
            brandRepository.save(brand);
        }
    }

    private void seedTypes() {
        List<String> types = List.of(
                "T-Shirt", "Shirt", "Pants", "Jeans", "Shorts", "Dress", "Skirt", "Jacket", "Coat",
                "Sweater", "Hoodie", "Sweatshirt", "Suit", "Blazer", "Vest", "Underwear", "Socks",
                "Hat", "Cap", "Scarf", "Gloves", "Belt", "Tie", "Bag",
                "Shoes", "Sneakers", "Boots", "Sandals", "Heels", "Flats",
                "Other"
        );

        for (String label : types) {
            ClothingType type = new ClothingType();
            type.setName(toKey(label));
            type.setLabel(label);
            typeRepository.save(type);
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

