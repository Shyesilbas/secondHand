package com.serhat.secondhand.ai.agent.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.ai.agent.dto.SuggestedListingDto;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.domain.dto.response.books.BooksListingDto;
import com.serhat.secondhand.listing.domain.dto.response.clothing.ClothingListingDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.dto.response.realestate.RealEstateListingDto;
import com.serhat.secondhand.listing.domain.dto.response.sports.SportsListingDto;
import com.serhat.secondhand.listing.domain.dto.response.vehicle.VehicleListingDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuraListingSearchOrchestrator {

    private static final int DEFAULT_SIZE = 8;
    private static final int MAX_SIZE = 10;
    private static final int MAX_QUERY_LEN = 200;

    private static final Pattern BYPASS_SEARCH_INTENT = Pattern.compile(
            "(?i)^\\s*(merhaba|selam|hi|hello|nasılsın|kimsin|ne yapabilirsin|help|yardım|günaydın|iyi akşamlar|iyi günler|teşekkürler|thanks|ok|tamam)\\s*[.!?]?\\s*$"
    );

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final ListingSearchService listingSearchService;
    private final AuraAgentSearchRateLimiter rateLimiter;

    @Value("${aura.agent.search.enabled:true}")
    private boolean searchEnabled;

    public AgentSearchAugmentation augment(Long userId, String userMessage, String memoryData) {
        log.info("Aura augment invoked for userId={}, userMessage='{}'", userId, userMessage);
        if (!searchEnabled || userId == null || userMessage == null || userMessage.isBlank()) {
            log.info("Aura search not enabled or input invalid");
            return AgentSearchAugmentation.empty();
        }

        // Bypass search planning immediately for simple greetings/generic chat
        if (BYPASS_SEARCH_INTENT.matcher(userMessage).matches()) {
            log.info("Aura search bypassed: generic greeting or chat matched BYPASS_SEARCH_INTENT");
            return AgentSearchAugmentation.empty();
        }

        if (!rateLimiter.tryAcquire(userId)) {
            log.warn("Aura listing search rate limited userId={}", userId);
            return AgentSearchAugmentation.rateLimited();
        }

        SearchPlan plan = extractPlanWithLlm(userMessage, memoryData);
        log.info("Aura LLM search plan extracted: {}", plan);
        if (plan.mode() == SearchPlanMode.NONE) {
            if (plan.explicitNone()) {
                log.info("Aura search skipped: LLM explicitly classified intent as NONE");
                return AgentSearchAugmentation.empty();
            }
            // Fall back to a global search only when LLM planning failed/errored
            String fallbackQuery = truncate(userMessage.trim(), MAX_QUERY_LEN);
            log.info("Aura fallback query generated after plan parse failure: '{}'", fallbackQuery);
            if (fallbackQuery != null && fallbackQuery.length() >= 3) {
                plan = SearchPlan.global(fallbackQuery, DEFAULT_SIZE);
            } else {
                log.info("Aura fallback query too short, skipping search");
                return AgentSearchAugmentation.empty();
            }
        }

        try {
            Page<ListingDto> page = executeSearch(plan, userId);
            if (page == null || page.isEmpty()) {
                log.info("Aura executeSearch returned no matches or page is empty");
                return new AgentSearchAugmentation(
                        "CANLI_ARAMA_SONUCU: Uygun ilan bulunamadı veya sonuç boş.",
                        List.of(),
                        "ok"
                    );
            }
            log.info("Aura executeSearch found {} listings", page.getNumberOfElements());
            return buildAugmentation(page);
        } catch (Exception e) {
            log.error("Aura listing search failed: {}", e.getMessage(), e);
            return AgentSearchAugmentation.empty();
        }
    }

    private SearchPlan extractPlanWithLlm(String userMessage, String memoryData) {
        try {
            String raw = geminiClient.generateJsonForMemory(buildPlanPrompt(userMessage, memoryData));
            return parsePlan(raw);
        } catch (Exception e) {
            log.debug("Plan LLM parse path failed: {}", e.getMessage());
            return SearchPlan.none();
        }
    }

    private String buildPlanPrompt(String userMessage, String memoryData) {
        return """
                Task: Decide if the user wants to SEARCH or DISCOVER product listings on a second-hand marketplace (SecondHand).
                Return ONLY one JSON object, no markdown, no code fences, no extra text.
                Keys (exactly):
                mode: string — one of NONE, GLOBAL_TEXT, CATEGORY_FILTER
                searchQuery: string or null — concise keyword(s) for title/text search (Turkish OK), max 200 chars
                category: string or null — one of ELECTRONICS, VEHICLE, REAL_ESTATE, CLOTHING, BOOKS, SPORTS
                minPrice: number or null
                maxPrice: number or null
                city: string or null — city name if specified (e.g. "İstanbul", "Ankara")
                district: string or null — district name if specified (e.g. "Kadıköy", "Çankaya")
                minYear: integer or null — minimum model/publication year if specified
                maxYear: integer or null — maximum model/publication year if specified
                maxMileage: integer or null — maximum vehicle mileage (km) if specified
                minRam: integer or null — minimum RAM in GB for electronics if specified
                minStorage: integer or null — minimum storage in GB for electronics if specified
                minRoomCount: integer or null — minimum room count for real estate if specified
                resultSize: integer from 1 to 10

                Rules:
                - Use CATEGORY_FILTER whenever a category can be inferred AND the user specifies any structured filter (minPrice, maxPrice, city, district, minRam, minStorage, minYear, maxMileage, minRoomCount) or asks for a category browse. You may also set searchQuery alongside CATEGORY_FILTER.
                - Use GLOBAL_TEXT when the user searches by product/model name without structured category filters.
                - Use NONE when the user is asking about a single currently viewed listing ("bu ilan", "fiyatı uygun mu", "pazarlık mesajı yaz"), asking about their own orders/notifications/escrow/account, greeting, or asking how to use the platform without requesting listing discovery.

                USER_MEMORY_SNIPPET:
                %s

                USER_MESSAGE:
                %s
                """.formatted(memoryData == null || memoryData.isBlank() ? "-" : memoryData.trim(), userMessage.trim());
    }

    SearchPlan parsePlan(String raw) {
        String json = extractJsonObject(raw);
        if (json == null) {
            return SearchPlan.none();
        }
        JsonNode node;
        try {
            node = objectMapper.readTree(json);
        } catch (Exception e) {
            return SearchPlan.none();
        }
        String modeStr = textOrNull(node.get("mode"));
        SearchPlanMode mode = parseMode(modeStr);
        if (mode == SearchPlanMode.NONE) {
            return SearchPlan.noneExplicit();
        }

        int size = clampSize(node.path("resultSize").asInt(DEFAULT_SIZE));
        String searchQuery = truncate(textOrNull(node.get("searchQuery")), MAX_QUERY_LEN);
        BigDecimal min = decimalOrNull(node.get("minPrice"));
        BigDecimal max = decimalOrNull(node.get("maxPrice"));
        String city = textOrNull(node.get("city"));
        String district = textOrNull(node.get("district"));
        Integer minYear = intOrNull(node.get("minYear"));
        Integer maxYear = intOrNull(node.get("maxYear"));
        Integer maxMileage = intOrNull(node.get("maxMileage"));
        Integer minRam = intOrNull(node.get("minRam"));
        Integer minStorage = intOrNull(node.get("minStorage"));
        Integer minRoomCount = intOrNull(node.get("minRoomCount"));
        ListingType category = parseListingType(textOrNull(node.get("category")));

        boolean hasStructuredFilters = min != null || max != null || city != null || district != null
                || minYear != null || maxYear != null || maxMileage != null
                || minRam != null || minStorage != null || minRoomCount != null;

        // Upgrade to CATEGORY_FILTER if category + structured filters exist
        if (category != null && (mode == SearchPlanMode.CATEGORY_FILTER || hasStructuredFilters)) {
            return new SearchPlan(
                    SearchPlanMode.CATEGORY_FILTER,
                    searchQuery,
                    category,
                    min,
                    max,
                    city,
                    district,
                    minYear,
                    maxYear,
                    maxMileage,
                    minRam,
                    minStorage,
                    minRoomCount,
                    size,
                    false
            );
        }

        if (mode == SearchPlanMode.GLOBAL_TEXT || (searchQuery != null && !searchQuery.isBlank())) {
            if (searchQuery == null || searchQuery.isBlank()) {
                return SearchPlan.noneExplicit();
            }
            return new SearchPlan(
                    SearchPlanMode.GLOBAL_TEXT,
                    searchQuery,
                    category,
                    min,
                    max,
                    city,
                    district,
                    minYear,
                    maxYear,
                    maxMileage,
                    minRam,
                    minStorage,
                    minRoomCount,
                    size,
                    false
            );
        }

        return SearchPlan.noneExplicit();
    }

    private Page<ListingDto> executeSearch(SearchPlan plan, Long userId) {
        int size = clampSize(plan.resultSize() > 0 ? plan.resultSize() : DEFAULT_SIZE);
        log.info("Aura executing DB search. Mode={}, Category={}, Query='{}', City='{}', Size={}",
                plan.mode(), plan.category(), plan.searchQuery(), plan.city(), size);
        Page<ListingDto> result = switch (plan.mode()) {
            case GLOBAL_TEXT -> listingSearchService.globalSearch(plan.searchQuery(), 0, size, userId);
            case CATEGORY_FILTER -> {
                ListingFilterDto filters = buildCategoryFilter(plan, size, true);
                Page<ListingDto> page = listingSearchService.filterByCategory(filters, userId);
                if ((page == null || page.isEmpty()) && plan.searchQuery() != null && !plan.searchQuery().isBlank()) {
                    // Retry category filter without strict title substring if title narrowed it to 0
                    ListingFilterDto relaxed = buildCategoryFilter(plan, size, false);
                    page = listingSearchService.filterByCategory(relaxed, userId);
                    if (page == null || page.isEmpty()) {
                        page = listingSearchService.globalSearch(plan.searchQuery(), 0, size, userId);
                    }
                }
                yield page;
            }
            case NONE -> Page.empty();
        };
        log.info("Aura DB search result totalElements={}, contentSize={}", result.getTotalElements(), result.getContent().size());
        return result;
    }

    private ListingFilterDto buildCategoryFilter(SearchPlan plan, int size, boolean includeTitleQuery) {
        ListingType type = plan.category() != null ? plan.category() : ListingType.ELECTRONICS;
        ListingFilterDto f = switch (type) {
            case ELECTRONICS -> {
                ElectronicListingFilterDto ef = new ElectronicListingFilterDto();
                ef.setMinRam(plan.minRam());
                ef.setMinStorage(plan.minStorage());
                ef.setMinYear(plan.minYear());
                ef.setMaxYear(plan.maxYear());
                yield ef;
            }
            case VEHICLE -> {
                VehicleListingFilterDto vf = new VehicleListingFilterDto();
                vf.setMinYear(plan.minYear());
                vf.setMaxYear(plan.maxYear());
                vf.setMaxMileage(plan.maxMileage());
                yield vf;
            }
            case REAL_ESTATE -> {
                RealEstateFilterDto rf = new RealEstateFilterDto();
                rf.setMinRoomCount(plan.minRoomCount());
                yield rf;
            }
            case CLOTHING -> new ClothingListingFilterDto();
            case BOOKS -> {
                BooksListingFilterDto bf = new BooksListingFilterDto();
                bf.setMinYear(plan.minYear());
                bf.setMaxYear(plan.maxYear());
                yield bf;
            }
            case SPORTS -> new SportsListingFilterDto();
            case OTHER -> new ElectronicListingFilterDto();
        };
        f.setListingType(type);
        f.setStatus(ListingStatus.ACTIVE);
        f.setPage(0);
        f.setSize(size);
        if (includeTitleQuery && plan.searchQuery() != null && !plan.searchQuery().isBlank()) {
            f.setTitle(plan.searchQuery());
        }
        if (plan.city() != null && !plan.city().isBlank()) {
            f.setCity(plan.city());
        }
        if (plan.district() != null && !plan.district().isBlank()) {
            f.setDistrict(plan.district());
        }
        if (plan.minPrice() != null) {
            f.setMinPrice(plan.minPrice());
        }
        if (plan.maxPrice() != null) {
            f.setMaxPrice(plan.maxPrice());
        }
        return f;
    }

    private AgentSearchAugmentation buildAugmentation(Page<ListingDto> page) {
        StringBuilder sb = new StringBuilder();
        sb.append("CANLI_ARAMA_SONUÇLARI (veritabanından; yalnızca aşağıdaki ilanlar gerçektir, başka ilan uydurma):\n");
        List<SuggestedListingDto> suggested = new ArrayList<>();
        int i = 1;
        for (ListingDto dto : page.getContent()) {
            String line = formatListingLine(i, dto);
            sb.append(line).append("\n");
            suggested.add(toSuggested(dto));
            i++;
        }
        sb.append("Toplam eşleşen (sayfa): ").append(page.getTotalElements());
        return new AgentSearchAugmentation(sb.toString().trim(), suggested, "ok");
    }

    private static String formatListingLine(int index, ListingDto dto) {
        BigDecimal effectivePrice = dto.getCampaignPrice() != null ? dto.getCampaignPrice() : dto.getPrice();
        String price = effectivePrice != null ? effectivePrice.toPlainString() : "-";
        String cur = dto.getCurrency() != null ? dto.getCurrency().name() : "";
        String specs = formatCompactSpecs(dto);
        return "%d) id=%s | ilanNo=%s | kategori=%s | başlık=%s | fiyat=%s %s | şehir=%s | ilçe=%s%s"
                .formatted(
                        index,
                        dto.getId(),
                        nullToDash(dto.getListingNo()),
                        dto.getType() != null ? dto.getType().name() : "-",
                        nullToDash(dto.getTitle()),
                        price,
                        cur,
                        nullToDash(dto.getCity()),
                        nullToDash(dto.getDistrict()),
                        specs.isBlank() ? "" : " | özellikler=" + specs
                );
    }

    private static String formatCompactSpecs(ListingDto dto) {
        if (dto instanceof ElectronicListingDto e) {
            List<String> parts = new ArrayList<>();
            if (e.getElectronicBrand() != null && e.getElectronicBrand().label() != null) parts.add(e.getElectronicBrand().label());
            if (e.getModel() != null && e.getModel().name() != null) parts.add(e.getModel().name());
            if (e.getRam() != null) parts.add(e.getRam() + "GB RAM");
            if (e.getStorage() != null) parts.add(e.getStorage() + "GB");
            if (e.getYear() != null) parts.add(e.getYear().toString());
            return String.join(", ", parts);
        }
        if (dto instanceof VehicleListingDto v) {
            List<String> parts = new ArrayList<>();
            if (v.getBrand() != null && v.getBrand().label() != null) parts.add(v.getBrand().label());
            if (v.getModel() != null && v.getModel().name() != null) parts.add(v.getModel().name());
            if (v.getYear() != null) parts.add(v.getYear().toString());
            if (v.getMileage() != null) parts.add(v.getMileage() + " km");
            if (v.getFuelType() != null) parts.add(v.getFuelType().name());
            if (v.getGearbox() != null) parts.add(v.getGearbox().name());
            return String.join(", ", parts);
        }
        if (dto instanceof RealEstateListingDto r) {
            List<String> parts = new ArrayList<>();
            if (r.getAdType() != null && r.getAdType().label() != null) parts.add(r.getAdType().label());
            if (r.getRealEstateType() != null && r.getRealEstateType().label() != null) parts.add(r.getRealEstateType().label());
            if (r.getNetAreaM2() != null) parts.add(r.getNetAreaM2() + " m2");
            if (r.getRoomConfigKey() != null) parts.add(r.getRoomConfigKey());
            else if (r.getRoomCount() != null) parts.add(r.getRoomCount() + " oda");
            return String.join(", ", parts);
        }
        if (dto instanceof ClothingListingDto c) {
            List<String> parts = new ArrayList<>();
            if (c.getBrand() != null && c.getBrand().label() != null) parts.add(c.getBrand().label());
            if (c.getSizeLabel() != null) parts.add(c.getSizeLabel());
            if (c.getCondition() != null) parts.add(c.getCondition().name());
            return String.join(", ", parts);
        }
        if (dto instanceof BooksListingDto b) {
            List<String> parts = new ArrayList<>();
            if (b.getAuthor() != null && !b.getAuthor().isBlank()) parts.add(b.getAuthor());
            if (b.getPublicationYear() != null) parts.add(b.getPublicationYear().toString());
            return String.join(", ", parts);
        }
        if (dto instanceof SportsListingDto s) {
            List<String> parts = new ArrayList<>();
            if (s.getDiscipline() != null && s.getDiscipline().label() != null) parts.add(s.getDiscipline().label());
            if (s.getEquipmentType() != null && s.getEquipmentType().label() != null) parts.add(s.getEquipmentType().label());
            return String.join(", ", parts);
        }
        return "";
    }

    private static SuggestedListingDto toSuggested(ListingDto dto) {
        BigDecimal effectivePrice = dto.getCampaignPrice() != null ? dto.getCampaignPrice() : dto.getPrice();
        String price = effectivePrice != null ? effectivePrice.toPlainString() : null;
        String cur = dto.getCurrency() != null ? dto.getCurrency().name() : null;
        return new SuggestedListingDto(
                dto.getId() != null ? dto.getId().toString() : null,
                dto.getListingNo(),
                dto.getTitle(),
                price,
                cur,
                dto.getCity(),
                dto.getDistrict(),
                dto.getImageUrl()
        );
    }

    private static String nullToDash(String v) {
        return v == null || v.isBlank() ? "-" : v.trim();
    }

    private static int clampSize(int size) {
        if (size < 1) {
            return DEFAULT_SIZE;
        }
        return Math.min(size, MAX_SIZE);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    private static SearchPlanMode parseMode(String modeStr) {
        if (modeStr == null) {
            return SearchPlanMode.NONE;
        }
        return switch (modeStr.trim().toUpperCase(Locale.ROOT)) {
            case "GLOBAL_TEXT" -> SearchPlanMode.GLOBAL_TEXT;
            case "CATEGORY_FILTER" -> SearchPlanMode.CATEGORY_FILTER;
            default -> SearchPlanMode.NONE;
        };
    }

    private static ListingType parseListingType(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        try {
            return ListingType.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static BigDecimal decimalOrNull(JsonNode n) {
        if (n == null || n.isNull() || !n.isNumber()) {
            return null;
        }
        return n.decimalValue();
    }

    private static Integer intOrNull(JsonNode n) {
        if (n == null || n.isNull() || !n.isNumber()) {
            return null;
        }
        return n.intValue();
    }

    private static String textOrNull(JsonNode n) {
        if (n == null || n.isNull()) {
            return null;
        }
        String t = n.asText(null);
        return t == null || t.isBlank() ? null : t.trim();
    }

    private static String extractJsonObject(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start < 0 || end <= start) {
            return null;
        }
        return trimmed.substring(start, end + 1).trim();
    }
}
