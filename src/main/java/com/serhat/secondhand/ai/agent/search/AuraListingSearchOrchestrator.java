package com.serhat.secondhand.ai.agent.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.serhat.secondhand.ai.agent.dto.SuggestedListingDto;
import com.serhat.secondhand.ai.application.GeminiClient;
import com.serhat.secondhand.listing.application.query.ListingSearchService;
import com.serhat.secondhand.listing.domain.dto.response.listing.*;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
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

    private static final Pattern LISTING_INTENT = Pattern.compile(
            "(?i).*(öner|listele|bul\\s|arama|search|ilan|göster|hangi\\s+ilan|laptop|bilgisayar|telefon|macbook|iphone|araç|araba|otomobil|kitap|giyim|ev|daire).*"
    );

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final ListingSearchService listingSearchService;
    private final AuraAgentSearchRateLimiter rateLimiter;

    @Value("${aura.agent.search.enabled:true}")
    private boolean searchEnabled;

    public AgentSearchAugmentation augment(Long userId, String userMessage, String memoryData) {
        if (!searchEnabled || userId == null || userMessage == null || userMessage.isBlank()) {
            return AgentSearchAugmentation.empty();
        }
        if (!rateLimiter.tryAcquire(userId)) {
            log.info("Aura listing search rate limited userId={}", userId);
            return AgentSearchAugmentation.rateLimited();
        }

        SearchPlan plan = extractPlanWithLlm(userMessage, memoryData);
        if (plan.mode() == SearchPlanMode.NONE) {
            plan = heuristicListingIntent(userMessage);
        }
        if (plan.mode() == SearchPlanMode.NONE) {
            return AgentSearchAugmentation.empty();
        }

        try {
            Page<ListingDto> page = executeSearch(plan, userId);
            if (page == null || page.isEmpty()) {
                return new AgentSearchAugmentation(
                        "CANLI_ARAMA_SONUCU: Uygun ilan bulunamadı veya sonuç boş.",
                        List.of(),
                        "ok"
                );
            }
            return buildAugmentation(page);
        } catch (Exception e) {
            log.warn("Aura listing search failed: {}", e.getMessage());
            return AgentSearchAugmentation.empty();
        }
    }

    private SearchPlan extractPlanWithLlm(String userMessage, String memoryData) {
        try {
            String raw = geminiClient.generateTextForMemory(buildPlanPrompt(userMessage, memoryData));
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
                searchQuery: string or null — concise search text for GLOBAL_TEXT (Turkish OK), max 200 chars
                category: string or null — one of ELECTRONICS, VEHICLE, REAL_ESTATE, CLOTHING, BOOKS, SPORTS
                minPrice: number or null
                maxPrice: number or null
                resultSize: integer from 1 to 10

                Rules:
                - GLOBAL_TEXT: user asks to find/recommend/show listings, compare options in listings, "bilgisayar öner", "ilan ara", product names, price ideas.
                - CATEGORY_FILTER: category is explicit and a filter without strong free-text (optional; prefer GLOBAL_TEXT when unsure).
                - NONE: greetings, password, pure "how to use site" without discovery, unrelated topics.

                USER_MEMORY_SNIPPET:
                %s

                USER_MESSAGE:
                %s
                """.formatted(memoryData == null || memoryData.isBlank() ? "-" : memoryData.trim(), userMessage.trim());
    }

    private SearchPlan parsePlan(String raw) {
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
            return SearchPlan.none();
        }

        int size = clampSize(node.path("resultSize").asInt(DEFAULT_SIZE));
        String searchQuery = textOrNull(node.get("searchQuery"));
        BigDecimal min = decimalOrNull(node.get("minPrice"));
        BigDecimal max = decimalOrNull(node.get("maxPrice"));
        ListingType category = parseListingType(textOrNull(node.get("category")));

        if (mode == SearchPlanMode.GLOBAL_TEXT) {
            if (searchQuery == null || searchQuery.isBlank()) {
                return SearchPlan.none();
            }
            return SearchPlan.global(truncate(searchQuery, MAX_QUERY_LEN), size);
        }

        if (mode == SearchPlanMode.CATEGORY_FILTER) {
            if (category == null) {
                return SearchPlan.none();
            }
            return SearchPlan.category(category, min, max, size);
        }

        return SearchPlan.none();
    }

    private SearchPlan heuristicListingIntent(String message) {
        if (!LISTING_INTENT.matcher(message).matches()) {
            return SearchPlan.none();
        }
        String q = truncate(message.trim(), MAX_QUERY_LEN);
        return SearchPlan.global(q, DEFAULT_SIZE);
    }

    private Page<ListingDto> executeSearch(SearchPlan plan, Long userId) {
        int size = clampSize(plan.resultSize() > 0 ? plan.resultSize() : DEFAULT_SIZE);
        return switch (plan.mode()) {
            case GLOBAL_TEXT -> listingSearchService.globalSearch(plan.searchQuery(), 0, size, userId);
            case CATEGORY_FILTER -> {
                ListingFilterDto filters = buildCategoryFilter(plan.category(), plan.minPrice(), plan.maxPrice(), size);
                yield listingSearchService.filterByCategory(filters, userId);
            }
            case NONE -> Page.empty();
        };
    }

    private ListingFilterDto buildCategoryFilter(ListingType type, BigDecimal min, BigDecimal max, int size) {
        ListingFilterDto f = switch (type) {
            case ELECTRONICS -> new ElectronicListingFilterDto();
            case VEHICLE -> new VehicleListingFilterDto();
            case REAL_ESTATE -> new RealEstateFilterDto();
            case CLOTHING -> new ClothingListingFilterDto();
            case BOOKS -> new BooksListingFilterDto();
            case SPORTS -> new SportsListingFilterDto();
            case OTHER -> new ElectronicListingFilterDto();
        };
        f.setListingType(type);
        f.setStatus(ListingStatus.ACTIVE);
        f.setPage(0);
        f.setSize(size);
        if (min != null) {
            f.setMinPrice(min);
        }
        if (max != null) {
            f.setMaxPrice(max);
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
        String price = dto.getPrice() != null ? dto.getPrice().toPlainString() : "-";
        String cur = dto.getCurrency() != null ? dto.getCurrency().name() : "";
        return "%d) id=%s | ilanNo=%s | başlık=%s | fiyat=%s %s | şehir=%s | ilçe=%s"
                .formatted(
                        index,
                        dto.getId(),
                        nullToDash(dto.getListingNo()),
                        nullToDash(dto.getTitle()),
                        price,
                        cur,
                        nullToDash(dto.getCity()),
                        nullToDash(dto.getDistrict())
                );
    }

    private static SuggestedListingDto toSuggested(ListingDto dto) {
        String price = dto.getPrice() != null ? dto.getPrice().toPlainString() : null;
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
