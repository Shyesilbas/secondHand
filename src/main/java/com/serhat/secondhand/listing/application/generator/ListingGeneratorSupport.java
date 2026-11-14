package com.serhat.secondhand.listing.application.generator;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import com.serhat.secondhand.listing.domain.entity.enums.base.Currency;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Shared helpers for local catalog-driven listing generators: base listing payload construction,
 * creation result verification, listing-level attribute loading, and deterministic text formatting.
 */
final class ListingGeneratorSupport {

    private ListingGeneratorSupport() {
    }

    static BaseListingCreateRequest baseRequest(
            String title,
            String description,
            BigDecimal price,
            GeneratorLocations.Place place,
            String imageUrl,
            boolean allowMeetup) {
        return new BaseListingCreateRequest(
                title,
                description,
                price,
                Currency.TRY,
                place.cityLabel(),
                place.districtLabel(),
                place.cityKey(),
                place.districtKey(),
                place.neighborhoodKey(),
                imageUrl,
                allowMeetup,
                null
        );
    }

    static UUID requireCreated(Result<UUID> result, String vertical, String context) {
        if (result.isError()) {
            throw new IllegalStateException(
                    "Generated " + vertical + " listing rejected (" + context + "): "
                            + result.getErrorCode() + " " + result.getMessage());
        }
        return result.getData();
    }

    static Map<String, AttributeDefinitionDto> listingAttributes(
            ListingAttributeCatalogService attributeCatalogService,
            ListingType listingType,
            String subTypeName) {
        return attributeCatalogService.getDefinitions(listingType, subTypeName).stream()
                .filter(d -> d.getLevel() == AttributeLevel.LISTING)
                .collect(Collectors.toMap(
                        AttributeDefinitionDto::getKey, d -> d, (a, b) -> a, LinkedHashMap::new));
    }

    static String formatGroupedInt(long value) {
        return String.format(Locale.ROOT, "%,d", value).replace(',', '.');
    }

    static String formatTry(long amount) {
        return formatGroupedInt(amount) + " TL";
    }

    static String truncate(String s, int maxLength) {
        return s.length() <= maxLength ? s : s.substring(0, maxLength).trim();
    }
}
