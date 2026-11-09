package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.common.BookGenreDto;
import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ClothingListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ElectronicListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.SportsListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * UI'daki listingId ile kullanıcının o an odaklandığı ilanın tüm 6 kategorideki teknik özetini
 * ve veritabanındaki benzer aktif ilanlara dayalı gerçek piyasa fiyat istatistiğini üretir.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ListingFocusAgentContextAdapter implements AgentContextAdapter {

    private static final String SOURCE = "listing_focus";
    private static final int BENCHMARK_SAMPLE_LIMIT = 40;

    private final ListingQueryService listingQueryService;
    private final ListingSearchService listingSearchService;

    @Override
    public AgentContextSection fetch(Long userId, AgentUiContextRequest uiContext) {
        if (uiContext == null || uiContext.listingId() == null || uiContext.listingId().isBlank()) {
            return new AgentContextSection(SOURCE, "Arayüzde aktif ilan kimliği (listingId) yok.", "skipped");
        }
        String raw = uiContext.listingId().trim();
        try {
            Optional<ListingDto> dto = resolveListingDto(userId, raw);
            if (dto.isEmpty()) {
                return new AgentContextSection(SOURCE, "İlan bulunamadı veya erişilemiyor.", "unavailable");
            }
            ListingDto listing = dto.get();
            String summary = summarize(listing);
            String benchmark = buildMarketPriceBenchmark(listing, userId);
            if (!benchmark.isBlank()) {
                summary = summary + ", " + benchmark;
            }
            return new AgentContextSection(SOURCE, summary, "ok");
        } catch (Exception e) {
            log.warn("listing_focus bağlamı alınamadı user={} listingKey={}: {}", userId, raw, e.getMessage());
            return new AgentContextSection(SOURCE, "İlan detayı geçici olarak alınamadı.", "unavailable");
        }
    }

    private Optional<ListingDto> resolveListingDto(Long userId, String raw) {
        try {
            UUID listingId = UUID.fromString(raw);
            return listingQueryService.findByIdAsDto(listingId, userId, userId);
        } catch (IllegalArgumentException ignored) {
            return listingQueryService.findByListingNoAsDto(raw, userId, userId);
        }
    }

    static String summarize(ListingDto l) {
        String type = l.getType() != null ? l.getType().name() : "?";
        String status = l.getStatus() != null ? l.getStatus().name() : "?";
        BigDecimal effectivePrice = effectivePrice(l);
        String price = effectivePrice != null ? effectivePrice.toPlainString() : "-";
        String originalPrice = (l.getCampaignPrice() != null && l.getPrice() != null)
                ? " (kampanya öncesi: " + l.getPrice().toPlainString() + ")"
                : "";
        String currency = l.getCurrency() != null ? l.getCurrency().name() : "-";
        String base = "id=%s, listingNo=%s, title=%s, type=%s, status=%s, price=%s %s%s, city=%s, district=%s, allowMeetup=%s"
                .formatted(
                        l.getId(),
                        nullToDash(l.getListingNo()),
                        nullToDash(l.getTitle()),
                        type,
                        status,
                        price,
                        currency,
                        originalPrice,
                        nullToDash(l.getCity()),
                        nullToDash(l.getDistrict()),
                        l.isAllowMeetup()
                );
        StringBuilder out = new StringBuilder(base);
        if (l instanceof ElectronicListingDto e) {
            out.append(", electronics={").append(electronicSummary(e)).append("}");
        } else if (l instanceof VehicleListingDto v) {
            out.append(", vehicle={").append(vehicleSummary(v)).append("}");
        } else if (l instanceof RealEstateListingDto r) {
            out.append(", realEstate={").append(realEstateSummary(r)).append("}");
        } else if (l instanceof ClothingListingDto c) {
            out.append(", clothing={").append(clothingSummary(c)).append("}");
        } else if (l instanceof BooksListingDto b) {
            out.append(", book={").append(bookSummary(b)).append("}");
        } else if (l instanceof SportsListingDto s) {
            out.append(", sports={").append(sportsSummary(s)).append("}");
        }

        String attrs = formatAttributes(l.getAttributes());
        if (!attrs.isBlank()) {
            out.append(", attributes=").append(attrs);
        }

        String desc = l.getDescription();
        if (desc != null && !desc.isBlank()) {
            String snippet = desc.length() > 400 ? desc.substring(0, 400).trim() + "…" : desc.trim();
            out.append(", descriptionSnippet=").append(snippet.replace('\n', ' '));
        }
        return out.toString();
    }

    private static String electronicSummary(ElectronicListingDto e) {
        return ("type=%s, brand=%s, model=%s, variant=%s, condition=%s, year=%s, ramGb=%s, storageGb=%s, storageType=%s, "
                + "processor=%s, chipset=%s, screenInch=%s, batteryHealthPercent=%s, batteryCapacityMah=%s, "
                + "cameraMp=%s, gpu=%s, os=%s, color=%s, warrantyProof=%s, supports5g=%s, dualSim=%s, hasNfc=%s, "
                + "wireless=%s, noiseCancelling=%s, batteryLifeHours=%s")
                .formatted(
                        lookupLabel(e.getElectronicType()),
                        lookupLabel(e.getElectronicBrand()),
                        modelLabel(e.getModel()),
                        nullToDash(e.getVariantName()),
                        enumNameOrDash(e.getCondition()),
                        intOrDash(e.getYear()),
                        intOrDash(e.getRam()),
                        intOrDash(e.getStorage()),
                        enumNameOrDash(e.getStorageType()),
                        enumNameOrDash(e.getProcessor()),
                        nullToDash(e.getChipset()),
                        intOrDash(e.getScreenSize()),
                        e.getAttributes() != null && e.getAttributes().get("batteryHealthPercent") != null
                                ? e.getAttributes().get("batteryHealthPercent").toString() : "-",
                        intOrDash(e.getBatteryCapacityMah()),
                        intOrDash(e.getCameraMegapixels()),
                        nullToDash(e.getGpuModel()),
                        nullToDash(e.getOperatingSystem()),
                        enumNameOrDash(e.getColor()),
                        e.isWarrantyProof(),
                        boolOrDash(e.getSupports5g()),
                        boolOrDash(e.getDualSim()),
                        boolOrDash(e.getHasNfc()),
                        boolOrDash(e.getWireless()),
                        boolOrDash(e.getNoiseCancelling()),
                        intOrDash(e.getBatteryLifeHours())
                );
    }

    private static String vehicleSummary(VehicleListingDto v) {
        return ("vehicleType=%s, brand=%s, model=%s, generation=%s, engine=%s, trim=%s, version=%s, "
                + "year=%s, mileageKm=%s, fuelType=%s, gearbox=%s, horsePower=%s, engineCapacityCc=%s, "
                + "drivetrain=%s, bodyType=%s, doors=%s, seats=%s, color=%s, accidentHistory=%s, accidentDetails=%s, "
                + "swap=%s, inspectionValidUntil=%s")
                .formatted(
                        lookupLabel(v.getVehicleType()),
                        lookupLabel(v.getBrand()),
                        modelLabel(v.getModel()),
                        lookupLabel(v.getGeneration()),
                        lookupLabel(v.getEngine()),
                        lookupLabel(v.getTrim()),
                        lookupLabel(v.getVehicleVersion()),
                        intOrDash(v.getYear()),
                        intOrDash(v.getMileage()),
                        enumNameOrDash(v.getFuelType()),
                        enumNameOrDash(v.getGearbox()),
                        intOrDash(v.getHorsePower()),
                        intOrDash(v.getEngineCapacity()),
                        enumNameOrDash(v.getDrivetrain()),
                        enumNameOrDash(v.getBodyType()),
                        enumNameOrDash(v.getDoors()),
                        enumNameOrDash(v.getSeatCount()),
                        enumNameOrDash(v.getColor()),
                        boolOrDash(v.getAccidentHistory()),
                        nullToDash(v.getAccidentDetails()),
                        boolOrDash(v.getSwap()),
                        v.getInspectionValidUntil() != null ? v.getInspectionValidUntil().toString() : "-"
                );
    }

    private static String realEstateSummary(RealEstateListingDto r) {
        return ("adType=%s, propertyType=%s, heating=%s, ownerType=%s, grossM2=%s, netM2=%s, rooms=%s, "
                + "bathrooms=%s, floor=%s, totalFloors=%s, buildingAge=%s, buildingCondition=%s, "
                + "furnished=%s, balcony=%s, elevator=%s, parking=%s, inSite=%s, siteName=%s, "
                + "monthlyFee=%s, zoningStatus=%s, exchangeable=%s")
                .formatted(
                        lookupLabel(r.getAdType()),
                        lookupLabel(r.getRealEstateType()),
                        lookupLabel(r.getHeatingType()),
                        lookupLabel(r.getOwnerType()),
                        intOrDash(r.getGrossAreaM2()),
                        intOrDash(r.getNetAreaM2()),
                        r.getRoomConfigKey() != null && !r.getRoomConfigKey().isBlank()
                                ? r.getRoomConfigKey()
                                : intOrDash(r.getRoomCount()),
                        intOrDash(r.getBathroomCount()),
                        r.getFloorKey() != null && !r.getFloorKey().isBlank()
                                ? r.getFloorKey()
                                : intOrDash(r.getFloorNumber()),
                        intOrDash(r.getTotalFloors()),
                        intOrDash(r.getBuildingAge()),
                        nullToDash(r.getBuildingCondition()),
                        r.isFurnished(),
                        r.isHasBalcony(),
                        r.isHasElevator(),
                        r.isHasParking(),
                        r.isInSite(),
                        nullToDash(r.getSiteName()),
                        r.getMonthlyFee() != null ? r.getMonthlyFee().toPlainString() : "-",
                        nullToDash(r.getZoningStatusKey()),
                        r.isExchangeable()
                );
    }

    private static String clothingSummary(ClothingListingDto c) {
        return ("brand=%s, type=%s, audience=%s, condition=%s, size=%s, "
                + "color=%s, fit=%s, pattern=%s, fabricType=%s, purchaseYear=%s")
                .formatted(
                        lookupLabel(c.getBrand()),
                        lookupLabel(c.getClothingType()),
                        enumNameOrDash(c.getAudience()),
                        enumNameOrDash(c.getCondition()),
                        nullToDash(c.getSizeLabel()),
                        enumNameOrDash(c.getColor()),
                        enumNameOrDash(c.getFit()),
                        enumNameOrDash(c.getPattern()),
                        enumNameOrDash(c.getFabricType()),
                        intOrDash(c.getPurchaseYear())
                );
    }

    private static String bookSummary(BooksListingDto b) {
        return ("author=%s, bookType=%s, genre=%s, language=%s, format=%s, condition=%s, "
                + "publicationYear=%s, pageCount=%s, isbn=%s")
                .formatted(
                        nullToDash(b.getAuthor()),
                        lookupLabel(b.getBookType()),
                        genreLabel(b.getGenre()),
                        lookupLabel(b.getLanguage()),
                        lookupLabel(b.getFormat()),
                        lookupLabel(b.getCondition()),
                        intOrDash(b.getPublicationYear()),
                        intOrDash(b.getPageCount()),
                        nullToDash(b.getIsbn())
                );
    }

    private static String sportsSummary(SportsListingDto s) {
        return "discipline=%s, equipmentType=%s, condition=%s".formatted(
                lookupLabel(s.getDiscipline()),
                lookupLabel(s.getEquipmentType()),
                lookupLabel(s.getCondition())
        );
    }

    private String buildMarketPriceBenchmark(ListingDto target, Long userId) {
        BigDecimal currentPrice = effectivePrice(target);
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0 || target.getType() == null) {
            return "";
        }
        try {
            ListingFilterDto strictFilter = buildBenchmarkFilter(target, true);
            List<BigDecimal> prices = fetchPrices(strictFilter, userId);

            if (prices.size() < 2) {
                ListingFilterDto broadFilter = buildBenchmarkFilter(target, false);
                if (broadFilter != null) {
                    List<BigDecimal> broadPrices = fetchPrices(broadFilter, userId);
                    if (broadPrices.size() > prices.size()) {
                        prices = broadPrices;
                    }
                }
            }

            if (prices.isEmpty()) {
                return "";
            }

            BigDecimal min = prices.stream().min(BigDecimal::compareTo).orElse(currentPrice);
            BigDecimal max = prices.stream().max(BigDecimal::compareTo).orElse(currentPrice);
            if (currentPrice.compareTo(min) < 0) {
                min = currentPrice;
            }
            if (currentPrice.compareTo(max) > 0) {
                max = currentPrice;
            }
            BigDecimal sum = prices.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal avg = sum.divide(BigDecimal.valueOf(prices.size()), 0, RoundingMode.HALF_UP);
            BigDecimal roundedCurrent = currentPrice.setScale(0, RoundingMode.HALF_UP);
            BigDecimal roundedMin = min.setScale(0, RoundingMode.HALF_UP);
            BigDecimal roundedMax = max.setScale(0, RoundingMode.HALF_UP);

            String status = evaluateDealStatus(roundedCurrent, avg);
            String currency = target.getCurrency() != null ? target.getCurrency().name() : "TRY";

            return ("marketPriceBenchmark={sampleSize=%d, min=%s, max=%s, avg=%s, current=%s, currency=%s, status=%s}")
                    .formatted(
                            prices.size(),
                            roundedMin.toPlainString(),
                            roundedMax.toPlainString(),
                            avg.toPlainString(),
                            roundedCurrent.toPlainString(),
                            currency,
                            status
                    );
        } catch (Exception e) {
            log.debug("Market price benchmark calculation skipped for listing {}: {}", target.getId(), e.getMessage());
            return "";
        }
    }

    private List<BigDecimal> fetchPrices(ListingFilterDto filter, Long userId) {
        if (filter == null) {
            return List.of();
        }
        Page<ListingDto> page = listingSearchService.filterByCategory(filter, userId);
        if (page == null || page.isEmpty()) {
            return List.of();
        }
        return page.getContent().stream()
                .map(ListingFocusAgentContextAdapter::effectivePrice)
                .filter(Objects::nonNull)
                .filter(p -> p.compareTo(BigDecimal.ZERO) > 0)
                .toList();
    }

    private ListingFilterDto buildBenchmarkFilter(ListingDto target, boolean strict) {
        ListingFilterDto filter;
        if (target instanceof ElectronicListingDto e) {
            ElectronicListingFilterDto ef = new ElectronicListingFilterDto();
            if (e.getElectronicType() != null && e.getElectronicType().id() != null) {
                ef.setElectronicTypeIds(List.of(e.getElectronicType().id()));
            }
            if (strict) {
                if (e.getElectronicBrand() != null && e.getElectronicBrand().id() != null) {
                    ef.setElectronicBrandIds(List.of(e.getElectronicBrand().id()));
                }
                if (e.getModel() != null && e.getModel().id() != null) {
                    ef.setElectronicModelIds(List.of(e.getModel().id()));
                }
            }
            filter = ef;
        } else if (target instanceof VehicleListingDto v) {
            VehicleListingFilterDto vf = new VehicleListingFilterDto();
            if (v.getVehicleType() != null && v.getVehicleType().id() != null) {
                vf.setVehicleTypeIds(List.of(v.getVehicleType().id()));
            }
            if (strict) {
                if (v.getBrand() != null && v.getBrand().id() != null) {
                    vf.setBrandIds(List.of(v.getBrand().id()));
                }
                if (v.getModel() != null && v.getModel().id() != null) {
                    vf.setVehicleModelIds(List.of(v.getModel().id()));
                }
            }
            filter = vf;
        } else if (target instanceof RealEstateListingDto r) {
            RealEstateFilterDto rf = new RealEstateFilterDto();
            if (r.getAdType() != null && r.getAdType().id() != null) {
                rf.setAdTypeId(r.getAdType().id());
            }
            if (r.getRealEstateType() != null && r.getRealEstateType().id() != null) {
                rf.setRealEstateTypeIds(List.of(r.getRealEstateType().id()));
            }
            if (strict && r.getCity() != null && !r.getCity().isBlank()) {
                rf.setCity(r.getCity());
            }
            filter = rf;
        } else if (target instanceof ClothingListingDto c) {
            ClothingListingFilterDto cf = new ClothingListingFilterDto();
            if (c.getClothingType() != null && c.getClothingType().id() != null) {
                cf.setTypes(List.of(c.getClothingType().id()));
            }
            if (strict && c.getBrand() != null && c.getBrand().id() != null) {
                cf.setBrands(List.of(c.getBrand().id()));
            }
            filter = cf;
        } else if (target instanceof BooksListingDto b) {
            BooksListingFilterDto bf = new BooksListingFilterDto();
            if (b.getBookType() != null && b.getBookType().id() != null) {
                bf.setBookTypeIds(List.of(b.getBookType().id()));
            }
            if (strict && b.getGenre() != null && b.getGenre().id() != null) {
                bf.setGenreIds(List.of(b.getGenre().id()));
            }
            filter = bf;
        } else if (target instanceof SportsListingDto s) {
            SportsListingFilterDto sf = new SportsListingFilterDto();
            if (s.getDiscipline() != null && s.getDiscipline().id() != null) {
                sf.setDisciplineIds(List.of(s.getDiscipline().id()));
            }
            if (strict && s.getEquipmentType() != null && s.getEquipmentType().id() != null) {
                sf.setEquipmentTypeIds(List.of(s.getEquipmentType().id()));
            }
            filter = sf;
        } else {
            return null;
        }

        filter.setListingType(target.getType());
        filter.setStatus(ListingStatus.ACTIVE);
        filter.setCurrency(target.getCurrency());
        filter.setPage(0);
        filter.setSize(BENCHMARK_SAMPLE_LIMIT);
        return filter;
    }

    static String evaluateDealStatus(BigDecimal currentPrice, BigDecimal avgPrice) {
        if (currentPrice == null || avgPrice == null || avgPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return "Fair Price";
        }
        BigDecimal goodThreshold = avgPrice.multiply(new BigDecimal("0.90"));
        BigDecimal highThreshold = avgPrice.multiply(new BigDecimal("1.10"));
        if (currentPrice.compareTo(goodThreshold) <= 0) {
            return "Good Deal";
        }
        if (currentPrice.compareTo(highThreshold) >= 0) {
            return "High Price";
        }
        return "Fair Price";
    }

    private static BigDecimal effectivePrice(ListingDto l) {
        if (l == null) {
            return null;
        }
        return l.getCampaignPrice() != null ? l.getCampaignPrice() : l.getPrice();
    }

    private static String formatAttributes(Map<String, Object> attributes) {
        if (attributes == null || attributes.isEmpty()) {
            return "";
        }
        return attributes.entrySet().stream()
                .filter(e -> e.getKey() != null && e.getValue() != null && !e.getValue().toString().isBlank())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining(", ", "{", "}"));
    }

    private static String lookupLabel(LookupDto d) {
        if (d == null) {
            return "-";
        }
        if (d.label() != null && !d.label().isBlank()) {
            return d.label().trim();
        }
        return d.name() != null && !d.name().isBlank() ? d.name().trim() : "-";
    }

    private static String genreLabel(BookGenreDto g) {
        if (g == null) {
            return "-";
        }
        if (g.label() != null && !g.label().isBlank()) {
            return g.label().trim();
        }
        return g.name() != null && !g.name().isBlank() ? g.name().trim() : "-";
    }

    private static String modelLabel(ModelDto m) {
        if (m == null) {
            return "-";
        }
        if (m.name() != null && !m.name().isBlank()) {
            return m.name().trim();
        }
        return "-";
    }

    private static String enumNameOrDash(Enum<?> e) {
        return e == null ? "-" : e.name();
    }

    private static String boolOrDash(Boolean b) {
        return b == null ? "-" : b.toString();
    }

    private static String intOrDash(Integer n) {
        return n == null ? "-" : n.toString();
    }

    private static String nullToDash(String v) {
        return v == null || v.isBlank() ? "-" : v.trim();
    }
}
