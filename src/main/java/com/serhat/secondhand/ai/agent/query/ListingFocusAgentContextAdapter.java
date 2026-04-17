package com.serhat.secondhand.ai.agent.query;

import com.serhat.secondhand.ai.agent.dto.AgentUiContextRequest;
import com.serhat.secondhand.listing.application.common.ListingQueryService;
import com.serhat.secondhand.listing.domain.dto.response.common.LookupDto;
import com.serhat.secondhand.listing.domain.dto.response.common.ModelDto;
import com.serhat.secondhand.listing.domain.dto.response.electronics.ElectronicListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * UI'daki listingId ile kullanıcının o an odaklandığı ilanın kısa özetini üretir.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ListingFocusAgentContextAdapter implements AgentContextAdapter {

    private static final String SOURCE = "listing_focus";

    private final ListingQueryService listingQueryService;

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
            return new AgentContextSection(SOURCE, summarize(dto.get()), "ok");
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

    private static String summarize(ListingDto l) {
        String type = l.getType() != null ? l.getType().name() : "?";
        String status = l.getStatus() != null ? l.getStatus().name() : "?";
        String price = l.getPrice() != null ? l.getPrice().toPlainString() : "-";
        String currency = l.getCurrency() != null ? l.getCurrency().name() : "-";
        String base = "id=%s, listingNo=%s, title=%s, type=%s, status=%s, price=%s %s, city=%s, district=%s"
                .formatted(
                        l.getId(),
                        nullToDash(l.getListingNo()),
                        nullToDash(l.getTitle()),
                        type,
                        status,
                        price,
                        currency,
                        nullToDash(l.getCity()),
                        nullToDash(l.getDistrict())
                );
        StringBuilder out = new StringBuilder(base);
        if (l instanceof ElectronicListingDto e) {
            out.append(", electronics=").append(electronicSummary(e));
        }
        String desc = l.getDescription();
        if (desc != null && !desc.isBlank()) {
            String snippet = desc.length() > 400 ? desc.substring(0, 400).trim() + "…" : desc.trim();
            out.append(", descriptionSnippet=").append(snippet.replace('\n', ' '));
        }
        return out.toString();
    }

    private static String electronicSummary(ElectronicListingDto e) {
        return ("brand=%s, model=%s, ramGb=%s, storageGb=%s, storageType=%s, processor=%s, "
                + "screenInch=%s, batteryHealthPercent=%s, gpu=%s, os=%s, year=%s, color=%s")
                .formatted(
                        lookupLabel(e.getElectronicBrand()),
                        modelLabel(e.getModel()),
                        intOrDash(e.getRam()),
                        intOrDash(e.getStorage()),
                        e.getStorageType() != null ? e.getStorageType().name() : "-",
                        e.getProcessor() != null ? e.getProcessor().name() : "-",
                        intOrDash(e.getScreenSize()),
                        intOrDash(e.getBatteryHealthPercent()),
                        nullToDash(e.getGpuModel()),
                        nullToDash(e.getOperatingSystem()),
                        intOrDash(e.getYear()),
                        e.getColor() != null ? e.getColor().name() : "-"
                );
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

    private static String modelLabel(ModelDto m) {
        if (m == null) {
            return "-";
        }
        if (m.name() != null && !m.name().isBlank()) {
            return m.name().trim();
        }
        return "-";
    }

    private static String intOrDash(Integer n) {
        return n == null ? "-" : n.toString();
    }

    private static String nullToDash(String v) {
        return v == null || v.isBlank() ? "-" : v.trim();
    }
}
