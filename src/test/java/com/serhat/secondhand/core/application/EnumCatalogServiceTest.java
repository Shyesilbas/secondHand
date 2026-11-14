package com.serhat.secondhand.core.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.core.config.CacheConfig;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.application.common.ListingFeePaymentService;
import com.serhat.secondhand.listing.application.realestate.RealEstateSpecCatalogService;
import com.serhat.secondhand.listing.application.size.SizeSystemCatalog;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingGroup;
import com.serhat.secondhand.listing.domain.entity.enums.clothing.ClothingType;
import com.serhat.secondhand.listing.domain.entity.enums.common.Color;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelColor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.Processor;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.StorageType;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateCategory;
import com.serhat.secondhand.listing.domain.entity.enums.realestate.RealEstateType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.BodyType;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.CarBrand;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleType;
import com.serhat.secondhand.listing.domain.repository.books.BookConditionRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookFormatRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookGenreRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookLanguageRepository;
import com.serhat.secondhand.listing.domain.repository.books.BookTypeRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingBrandRepository;
import com.serhat.secondhand.listing.domain.repository.clothing.ClothingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicBrandRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicModelVariantRepository;
import com.serhat.secondhand.listing.domain.repository.electronics.ElectronicTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.HeatingTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.ListingOwnerTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateAdTypeRepository;
import com.serhat.secondhand.listing.domain.repository.realestate.RealEstateTypeRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportConditionRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportDisciplineRepository;
import com.serhat.secondhand.listing.domain.repository.sports.SportEquipmentTypeRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.CarBrandRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleEngineRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleGenerationRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleModelRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTrimRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleTypeRepository;
import com.serhat.secondhand.listing.domain.repository.vehicle.VehicleVersionRepository;
import com.serhat.secondhand.payment.dto.ListingFeeConfigDto;
import com.serhat.secondhand.shipping.port.out.CargoProviderPort;
import com.serhat.secondhand.showcase.application.ShowcaseService;
import com.serhat.secondhand.showcase.dto.ShowcasePricingDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnumCatalogServiceTest {

    @Mock private ElectronicTypeRepository electronicTypeRepository;
    @Mock private ElectronicBrandRepository electronicBrandRepository;
    @Mock private ElectronicModelRepository electronicModelRepository;
    @Mock private ElectronicModelVariantRepository electronicModelVariantRepository;
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
    @Mock private VehicleVersionRepository vehicleVersionRepository;
    @Mock private SportDisciplineRepository sportDisciplineRepository;
    @Mock private SportEquipmentTypeRepository sportEquipmentTypeRepository;
    @Mock private SportConditionRepository sportConditionRepository;
    @Mock private ListingAttributeCatalogService listingAttributeCatalogService;
    @Mock private SizeSystemCatalog sizeSystemCatalog;
    @Mock private ListingFeePaymentService listingFeePaymentService;
    @Mock private ShowcaseService showcaseService;
    @Mock private RealEstateSpecCatalogService realEstateSpecCatalogService;

    private EnumReadService enumReadService;
    private EnumCatalogService enumCatalogService;
    private CargoProviderPort jetKargo;

    @BeforeEach
    void setUp() {
        enumReadService = new EnumReadService(
                electronicTypeRepository,
                electronicBrandRepository,
                electronicModelRepository,
                electronicModelVariantRepository,
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
                vehicleVersionRepository,
                sportDisciplineRepository,
                sportEquipmentTypeRepository,
                sportConditionRepository,
                listingAttributeCatalogService,
                sizeSystemCatalog
        );
        jetKargo = mock(CargoProviderPort.class);

        enumCatalogService = new EnumCatalogService(
                listingFeePaymentService,
                showcaseService,
                enumReadService,
                realEstateSpecCatalogService,
                List.of(jetKargo)
        );
    }

    @Test
    void cacheConfigRegistersCatalogEnumsAndBundleSerializesCleanlyWithDefaultTyping() throws Exception {
        CarBrand bmw = new CarBrand();
        bmw.setId(UUID.randomUUID());
        bmw.setName("BMW");
        bmw.setLabel("BMW");

        VehicleType carType = new VehicleType();
        carType.setId(UUID.randomUUID());
        carType.setName("CAR");
        carType.setLabel("Otomobil");
        carType.setBodyTypes(List.of(BodyType.SEDAN, BodyType.HATCHBACK));
        carType.setFieldRules(Map.of("doors", SpecFieldRule.REQUIRED));

        VehicleModel model = new VehicleModel();
        model.setId(UUID.randomUUID());
        model.setName("3 Serisi");
        model.setBrand(bmw);
        model.setType(carType);
        model.setSupportedBodyTypes(Set.of(BodyType.SEDAN));

        ElectronicBrand apple = new ElectronicBrand();
        apple.setId(UUID.randomUUID());
        apple.setName("APPLE");
        apple.setLabel("Apple");

        ElectronicType phoneType = new ElectronicType();
        phoneType.setId(UUID.randomUUID());
        phoneType.setName("PHONE");
        phoneType.setLabel("Telefon");
        phoneType.setFieldRules(Map.of("screenSize", SpecFieldRule.REQUIRED));

        ElectronicModel iphone = new ElectronicModel();
        iphone.setId(UUID.randomUUID());
        iphone.setName("iPhone 15");
        iphone.setBrand(apple);
        iphone.setType(phoneType);
        iphone.setAliases(List.of("15", "A3090"));
        iphone.setSpecs(Map.of("refreshRateHz", 60));
        iphone.setColors(List.of(new ElectronicModelColor("Black", Color.BLACK)));

        ElectronicModelVariant variant = new ElectronicModelVariant();
        variant.setId(UUID.randomUUID());
        variant.setModel(iphone);
        variant.setName("128GB");
        variant.setStorage(128);
        variant.setStorageType(StorageType.values()[0]);
        variant.setProcessor(Processor.values()[0]);
        variant.setSpecs(Map.of("usb", "USB-C"));

        ClothingType jacket = new ClothingType();
        jacket.setId(UUID.randomUUID());
        jacket.setName("JACKET");
        jacket.setLabel("Ceket");
        jacket.setGroup(ClothingGroup.APPAREL);
        jacket.setSizeRules(Map.of("MEN", List.of("EU_ALPHA")));
        jacket.setFieldRules(Map.of("fit", SpecFieldRule.OPTIONAL));

        RealEstateType flat = new RealEstateType();
        flat.setId(UUID.randomUUID());
        flat.setName("APARTMENT");
        flat.setLabel("Daire");
        flat.setCategory(RealEstateCategory.RESIDENTIAL);
        flat.setFieldRules(Map.of("rooms", SpecFieldRule.REQUIRED));

        when(carBrandRepository.findAll()).thenReturn(List.of(bmw));
        when(vehicleTypeRepository.findAll()).thenReturn(List.of(carType));
        when(vehicleModelRepository.findAll()).thenReturn(List.of(model));
        when(electronicBrandRepository.findAll()).thenReturn(List.of(apple));
        when(electronicTypeRepository.findAll()).thenReturn(List.of(phoneType));
        when(electronicModelRepository.findAll()).thenReturn(List.of(iphone));
        when(electronicModelVariantRepository.findAll()).thenReturn(List.of(variant));
        when(clothingTypeRepository.findAll()).thenReturn(List.of(jacket));
        when(realEstateTypeRepository.findAll()).thenReturn(List.of(flat));
        when(sizeSystemCatalog.all()).thenReturn(List.of(
                new SizeSystemCatalog.SizeSystem("EU_ALPHA", "Harf", List.of(new SizeSystemCatalog.SizeValue("M", "M")))));

        Map<String, Object> bundle = enumReadService.getCatalogEnumBundle();

        CacheConfig cacheConfig = new CacheConfig();
        CacheManager cacheManager = cacheConfig.cacheManager(mock(RedisConnectionFactory.class));
        assertThat(cacheManager.getCache(EnumReadService.CACHE_NAME)).isNotNull();

        Method mapperFactory = CacheConfig.class.getDeclaredMethod("buildCacheObjectMapper");
        mapperFactory.setAccessible(true);
        ObjectMapper cacheMapper = (ObjectMapper) mapperFactory.invoke(cacheConfig);
        GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(cacheMapper);

        byte[] serialized = serializer.serialize(bundle);
        assertThat(serialized).isNotEmpty();

        @SuppressWarnings("unchecked")
        Map<String, Object> deserialized = (Map<String, Object>) serializer.deserialize(serialized);
        assertThat(deserialized).containsKeys(bundle.keySet().toArray(String[]::new));
        assertThat(deserialized.get("carBrands")).asList().hasSize(1);
        assertThat(deserialized.get("vehicleModels")).asList().hasSize(1);
        assertThat(deserialized.get("electronicModels")).asList().hasSize(1);
        assertThat(deserialized.get("clothingTypes")).asList().hasSize(1);
        assertThat(deserialized.get("sizeSystems")).asList().hasSize(1);
    }

    @Test
    void enumReadServiceBundleMethodIsAnnotatedWithCacheable() throws Exception {
        Method bundleMethod = EnumReadService.class.getMethod("getCatalogEnumBundle");
        Cacheable cacheable = bundleMethod.getAnnotation(Cacheable.class);
        assertThat(cacheable).isNotNull();
        assertThat(cacheable.value()).containsExactly(EnumReadService.CACHE_NAME);
        assertThat(cacheable.key()).isEqualTo("'dbBundle'");
    }

    @Test
    void getAllEnumsReturnsFullDictionaryWithExpectedSectionsAndConfigHashes() {
        when(jetKargo.providerName()).thenReturn("JetKargo");
        when(listingFeePaymentService.getListingFeeConfig()).thenReturn(ListingFeeConfigDto.builder()
                .creationFee(new BigDecimal("100.00"))
                .taxPercentage(new BigDecimal("20.00"))
                .taxAmount(new BigDecimal("20.00"))
                .totalCreationFee(new BigDecimal("120.00"))
                .build());
        when(showcaseService.getShowcasePricingConfig()).thenReturn(ShowcasePricingDto.builder()
                .dailyCost(new BigDecimal("10.00"))
                .taxPercentage(new BigDecimal("20.00"))
                .dailyTaxAmount(new BigDecimal("2.00"))
                .totalDailyCost(new BigDecimal("12.00"))
                .maxDays(30)
                .build());
        when(realEstateSpecCatalogService.getRoomConfigs()).thenReturn(
                List.of(new RealEstateSpecCatalogService.SpecDto("2+1", "2+1", 3, 1, null)));

        Map<String, Object> result = enumCatalogService.getAllEnums();

        assertThat(result).hasSize(60);
        assertThat(result).containsKeys(
                "listingTypes", "listingStatuses", "carBrands", "vehicleTypes", "vehicleModels",
                "vehicleGenerations", "vehicleEngines", "vehicleTrims", "fuelTypes", "colors",
                "doors", "currencies", "gearTypes", "seatCounts", "electronicTypes",
                "electronicBrands", "electronicModels", "processors", "storageTypes",
                "electronicConnectionTypes", "electronicConditions", "drivetrains", "bodyTypes",
                "realEstateTypes", "realEstateAdTypes", "heatingTypes", "roomConfigs",
                "zoningStatuses", "floors", "infrastructureStatuses", "buildingConditions",
                "ownerTypes", "clothingBrands", "clothingTypes", "clothingConditions",
                "clothingAudiences", "clothingFits", "clothingPatterns", "fabricTypes",
                "sizeSystems", "bookTypes", "bookGenres", "bookLanguages", "bookFormats",
                "bookConditions", "sportDisciplines", "sportEquipmentTypes", "sportConditions",
                "genders", "shippingStatuses", "carriers", "orderStatuses",
                "cancellableOrderStatuses", "refundableOrderStatuses", "modifiableOrderStatuses",
                "emailTypes", "auditEventTypes", "auditEventStatuses",
                "listingFeeConfig", "showcasePricingConfig"
        );
        assertThat(result.get("carriers")).asList().singleElement()
                .satisfies(c -> assertThat(((Map<?, ?>) c).get("value")).isEqualTo("JetKargo"));
        @SuppressWarnings("unchecked")
        Map<String, Object> feeConfig = (Map<String, Object>) result.get("listingFeeConfig");
        @SuppressWarnings("unchecked")
        Map<String, Object> showcaseConfig = (Map<String, Object>) result.get("showcasePricingConfig");
        assertThat(feeConfig).containsKey("cacheVersion");
        assertThat(showcaseConfig).containsEntry("maxDays", 30);
    }
}
