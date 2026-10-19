package com.serhat.secondhand.core.application;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.FuelType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleEngine;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleGeneration;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleTrim;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.repository.books.*;
import com.serhat.secondhand.listing.domain.repository.clothing.*;
import com.serhat.secondhand.listing.domain.repository.electronics.*;
import com.serhat.secondhand.listing.domain.repository.realestate.*;
import com.serhat.secondhand.listing.domain.repository.sports.*;
import com.serhat.secondhand.listing.domain.repository.vehicle.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnumReadServiceTest {

    @Mock private ElectronicTypeRepository electronicTypeRepository;
    @Mock private ElectronicBrandRepository electronicBrandRepository;
    @Mock private ElectronicModelRepository electronicModelRepository;
    @Mock private BookTypeRepository bookTypeRepository;
    @Mock private BookGenreRepository bookGenreRepository;
    @Mock private BookLanguageRepository bookLanguageRepository;
    @Mock private BookFormatRepository bookFormatRepository;
    @Mock private BookConditionRepository bookConditionRepository;
    @Mock private ClothingBrandRepository clothingBrandRepository;
    @Mock private ClothingTypeRepository clothingTypeRepository;
    @Mock private RealEstateTypeRepository realEstateTypeRepository;
    @Mock private RealEstateAdTypeRepository realEstateAdTypeRepository;
    @Mock private HeatingTypeRepository heatingTypeRepository;
    @Mock private ListingOwnerTypeRepository listingOwnerTypeRepository;
    @Mock private CarBrandRepository carBrandRepository;
    @Mock private VehicleTypeRepository vehicleTypeRepository;
    @Mock private VehicleModelRepository vehicleModelRepository;
    @Mock private VehicleGenerationRepository vehicleGenerationRepository;
    @Mock private VehicleEngineRepository vehicleEngineRepository;
    @Mock private VehicleTrimRepository vehicleTrimRepository;
    @Mock private SportDisciplineRepository sportDisciplineRepository;
    @Mock private SportEquipmentTypeRepository sportEquipmentTypeRepository;
    @Mock private SportConditionRepository sportConditionRepository;

    private EnumReadService enumReadService;

    @BeforeEach
    void setUp() {
        enumReadService = new EnumReadService(
                electronicTypeRepository,
                electronicBrandRepository,
                electronicModelRepository,
                bookTypeRepository,
                bookGenreRepository,
                bookLanguageRepository,
                bookFormatRepository,
                bookConditionRepository,
                clothingBrandRepository,
                clothingTypeRepository,
                realEstateTypeRepository,
                realEstateAdTypeRepository,
                heatingTypeRepository,
                listingOwnerTypeRepository,
                carBrandRepository,
                vehicleTypeRepository,
                vehicleModelRepository,
                vehicleGenerationRepository,
                vehicleEngineRepository,
                vehicleTrimRepository,
                sportDisciplineRepository,
                sportEquipmentTypeRepository,
                sportConditionRepository
        );
    }

    @Test
    void getVehicleModels_preservesSameModelNameAcrossDifferentTypesAndBrands() {
        CarBrand renault = new CarBrand();
        renault.setId(UUID.randomUUID());
        renault.setName("RENAULT");

        VehicleType carType = new VehicleType();
        carType.setId(UUID.randomUUID());
        carType.setName("CAR");

        VehicleType commercialType = new VehicleType();
        commercialType.setId(UUID.randomUUID());
        commercialType.setName("COMMERCIAL");

        VehicleModel kangooCar = new VehicleModel();
        kangooCar.setId(UUID.randomUUID());
        kangooCar.setName("Kangoo");
        kangooCar.setBrand(renault);
        kangooCar.setType(carType);

        VehicleModel kangooCommercial = new VehicleModel();
        kangooCommercial.setId(UUID.randomUUID());
        kangooCommercial.setName("Kangoo");
        kangooCommercial.setBrand(renault);
        kangooCommercial.setType(commercialType);

        when(vehicleModelRepository.findAll()).thenReturn(List.of(kangooCar, kangooCommercial));

        List<Map<String, Object>> models = enumReadService.getVehicleModels();

        assertThat(models).hasSize(2);
        assertThat(models).extracting("typeId")
                .containsExactlyInAnyOrder(carType.getId(), commercialType.getId());
    }

    @Test
    void getVehicleGenerations_preservesGenerationsWithSameNameUnderDifferentModels() {
        VehicleModel modelA = new VehicleModel();
        modelA.setId(UUID.randomUUID());
        modelA.setName("Golf");

        VehicleModel modelB = new VehicleModel();
        modelB.setId(UUID.randomUUID());
        modelB.setName("Passat");

        VehicleGeneration gen1Golf = new VehicleGeneration();
        gen1Golf.setId(UUID.randomUUID());
        gen1Golf.setName("1. Nesil");
        gen1Golf.setModel(modelA);

        VehicleGeneration gen1Passat = new VehicleGeneration();
        gen1Passat.setId(UUID.randomUUID());
        gen1Passat.setName("1. Nesil");
        gen1Passat.setModel(modelB);

        when(vehicleGenerationRepository.findAll()).thenReturn(List.of(gen1Golf, gen1Passat));

        List<Map<String, Object>> generations = enumReadService.getVehicleGenerations();

        assertThat(generations).hasSize(2);
        assertThat(generations).extracting("modelId")
                .containsExactlyInAnyOrder(modelA.getId(), modelB.getId());
    }

    @Test
    void getVehicleEngines_preservesEnginesWithSameNameUnderDifferentGenerations() {
        VehicleGeneration genA = new VehicleGeneration();
        genA.setId(UUID.randomUUID());
        genA.setName("Mk7");

        VehicleGeneration genB = new VehicleGeneration();
        genB.setId(UUID.randomUUID());
        genB.setName("B8");

        VehicleEngine engA = new VehicleEngine();
        engA.setId(UUID.randomUUID());
        engA.setName("1.6 TDI");
        engA.setGeneration(genA);
        engA.setFuelType(FuelType.DIESEL);

        VehicleEngine engB = new VehicleEngine();
        engB.setId(UUID.randomUUID());
        engB.setName("1.6 TDI");
        engB.setGeneration(genB);
        engB.setFuelType(FuelType.DIESEL);

        when(vehicleEngineRepository.findAll()).thenReturn(List.of(engA, engB));

        List<Map<String, Object>> engines = enumReadService.getVehicleEngines();

        assertThat(engines).hasSize(2);
        assertThat(engines).extracting("generationId")
                .containsExactlyInAnyOrder(genA.getId(), genB.getId());
    }

    @Test
    void getVehicleTrims_preservesTrimsWithSameNameUnderDifferentGenerations() {
        VehicleGeneration genA = new VehicleGeneration();
        genA.setId(UUID.randomUUID());
        genA.setName("Gen1");

        VehicleGeneration genB = new VehicleGeneration();
        genB.setId(UUID.randomUUID());
        genB.setName("Gen2");

        VehicleTrim trimA = new VehicleTrim();
        trimA.setId(UUID.randomUUID());
        trimA.setName("Style");
        trimA.setGeneration(genA);

        VehicleTrim trimB = new VehicleTrim();
        trimB.setId(UUID.randomUUID());
        trimB.setName("Style");
        trimB.setGeneration(genB);

        when(vehicleTrimRepository.findAll()).thenReturn(List.of(trimA, trimB));

        List<Map<String, Object>> trims = enumReadService.getVehicleTrims();

        assertThat(trims).hasSize(2);
        assertThat(trims).extracting("generationId")
                .containsExactlyInAnyOrder(genA.getId(), genB.getId());
    }

    @Test
    void getElectronicModels_preservesSameModelNameAcrossDifferentBrandsOrTypes() {
        ElectronicBrand apple = new ElectronicBrand();
        apple.setId(UUID.randomUUID());
        apple.setName("APPLE");

        ElectronicBrand asus = new ElectronicBrand();
        asus.setId(UUID.randomUUID());
        asus.setName("ASUS");

        ElectronicType laptopType = new ElectronicType();
        laptopType.setId(UUID.randomUUID());
        laptopType.setName("LAPTOP");

        ElectronicModel applePro = new ElectronicModel();
        applePro.setId(UUID.randomUUID());
        applePro.setName("Pro");
        applePro.setBrand(apple);
        applePro.setType(laptopType);
        applePro.setReleaseYear(2023);
        applePro.setIsLegacy(false);
        applePro.setAliases(List.of("MBP16", "MacBook Pro"));

        ElectronicModel asusPro = new ElectronicModel();
        asusPro.setId(UUID.randomUUID());
        asusPro.setName("Pro");
        asusPro.setBrand(asus);
        asusPro.setType(laptopType);
        asusPro.setReleaseYear(2021);
        asusPro.setIsLegacy(true);
        asusPro.setAliases(List.of("ROG Zephyrus"));

        when(electronicModelRepository.findAll()).thenReturn(List.of(applePro, asusPro));

        List<Map<String, Object>> models = enumReadService.getElectronicModels();

        assertThat(models).hasSize(2);
        assertThat(models).extracting("brandId")
                .containsExactlyInAnyOrder(apple.getId(), asus.getId());
        
        Map<String, Object> appleModel = models.stream()
                .filter(m -> m.get("brandId").equals(apple.getId()))
                .findFirst().orElseThrow();
        assertThat(appleModel.get("releaseYear")).isEqualTo(2023);
        assertThat(appleModel.get("isLegacy")).isEqualTo(false);
        assertThat(appleModel.get("aliases")).asList().containsExactly("MBP16", "MacBook Pro");
    }

    @Test
    void getBookGenres_preservesSameGenreNameAcrossDifferentBookTypes() {
        BookType fiction = new BookType();
        fiction.setId(UUID.randomUUID());
        fiction.setName("FICTION");

        BookType nonFiction = new BookType();
        nonFiction.setId(UUID.randomUUID());
        nonFiction.setName("NON_FICTION");

        BookGenre genreA = new BookGenre();
        genreA.setId(UUID.randomUUID());
        genreA.setName("HISTORY");
        genreA.setLabel("Tarih");
        genreA.setBookType(fiction);

        BookGenre genreB = new BookGenre();
        genreB.setId(UUID.randomUUID());
        genreB.setName("HISTORY");
        genreB.setLabel("Tarih");
        genreB.setBookType(nonFiction);

        when(bookGenreRepository.findAll()).thenReturn(List.of(genreA, genreB));

        List<Map<String, Object>> genres = enumReadService.getBookGenres();

        assertThat(genres).hasSize(2);
        assertThat(genres).extracting("bookTypeId")
                .containsExactlyInAnyOrder(fiction.getId(), nonFiction.getId());
    }

    @Test
    void getCarBrands_deduplicatesExactDuplicateBrandsAndPrefersLocalizedLabel() {
        CarBrand rawBrand = new CarBrand();
        rawBrand.setId(UUID.randomUUID());
        rawBrand.setName("MERCEDES");
        rawBrand.setLabel("MERCEDES");

        CarBrand localizedBrand = new CarBrand();
        localizedBrand.setId(UUID.randomUUID());
        localizedBrand.setName("MERCEDES");
        localizedBrand.setLabel("Mercedes-Benz");

        when(carBrandRepository.findAll()).thenReturn(List.of(rawBrand, localizedBrand));

        List<Map<String, Object>> brands = enumReadService.getCarBrands();

        assertThat(brands).hasSize(1);
        assertThat(brands.get(0).get("label")).isEqualTo("Mercedes-Benz");
    }

    @Test
    void getRealEstateTypes_returnsTypesWithCategoryIncludingCommercialLandAsLand() {
        RealEstateType commercialLand = new RealEstateType();
        commercialLand.setId(UUID.randomUUID());
        commercialLand.setName("COMMERCIAL_LAND");
        commercialLand.setLabel("Ticari / Sanayi İmarlı Arsa");

        RealEstateType apartment = new RealEstateType();
        apartment.setId(UUID.randomUUID());
        apartment.setName("APARTMENT");
        apartment.setLabel("Daire");

        when(realEstateTypeRepository.findAll()).thenReturn(List.of(commercialLand, apartment));

        List<Map<String, Object>> types = enumReadService.getRealEstateTypes();

        assertThat(types).hasSize(2);
        Map<String, Object> landMap = types.stream()
                .filter(t -> "COMMERCIAL_LAND".equals(t.get("name")))
                .findFirst().orElseThrow();
        assertThat(landMap.get("category")).isEqualTo("LAND");

        Map<String, Object> aptMap = types.stream()
                .filter(t -> "APARTMENT".equals(t.get("name")))
                .findFirst().orElseThrow();
        assertThat(aptMap.get("category")).isEqualTo("RESIDENTIAL");
    }
}
