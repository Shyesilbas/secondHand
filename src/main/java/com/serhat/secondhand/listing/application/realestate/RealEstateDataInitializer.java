package com.serhat.secondhand.listing.application.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.realestate.HeatingType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.ListingOwnerType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateAdType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class RealEstateDataInitializer implements CommandLineRunner {

    private final RealEstateTypeRepository realEstateTypeRepository;
    private final RealEstateAdTypeRepository realEstateAdTypeRepository;
    private final HeatingTypeRepository heatingTypeRepository;
    private final ListingOwnerTypeRepository listingOwnerTypeRepository;

    @Override
    public void run(String... args) {
        if (realEstateTypeRepository.count() == 0) {
            seedRealEstateTypes();
        }
        if (realEstateAdTypeRepository.count() == 0) {
            seedAdTypes();
        }
        if (heatingTypeRepository.count() == 0) {
            seedHeatingTypes();
        }
        if (listingOwnerTypeRepository.count() == 0) {
            seedOwnerTypes();
        }
    }

    private void seedRealEstateTypes() {
        List<String> types = List.of(
                "Apartment", "Residence", "Studio", "Duplex", "Penthouse",
                "House", "Villa", "Summer House",
                "Land", "Farm",
                "Office", "Commercial", "Shop", "Warehouse", "Industrial",
                "Other"
        );
        for (String label : types) {
            RealEstateType type = new RealEstateType();
            type.setName(toKey(label));
            type.setLabel(label);
            realEstateTypeRepository.save(type);
        }
    }

    private void seedAdTypes() {
        List<String> types = List.of("For Sale", "For Rent");
        for (String label : types) {
            RealEstateAdType type = new RealEstateAdType();
            type.setName(toKey(label));
            type.setLabel(label);
            realEstateAdTypeRepository.save(type);
        }
    }

    private void seedHeatingTypes() {
        List<String> types = List.of(
                "None", "Stove", "Natural Gas", "Central System", "Combi Boiler",
                "Air Conditioner", "Geothermal", "Floor Heating", "Solar", "Other"
        );
        for (String label : types) {
            HeatingType type = new HeatingType();
            type.setName(toKey(label));
            type.setLabel(label);
            heatingTypeRepository.save(type);
        }
    }

    private void seedOwnerTypes() {
        List<String> types = List.of("Owner", "Agency", "Builder");
        for (String label : types) {
            ListingOwnerType type = new ListingOwnerType();
            type.setName(toKey(label));
            type.setLabel(label);
            listingOwnerTypeRepository.save(type);
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

