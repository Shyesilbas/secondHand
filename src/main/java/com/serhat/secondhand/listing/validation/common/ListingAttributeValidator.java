package com.serhat.secondhand.listing.validation.common;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.attribute.ListingAttributeCatalogService;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeDefinitionDto;
import com.serhat.secondhand.listing.domain.dto.response.attribute.AttributeOptionDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.attribute.AttributeLevel;
import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeOption;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Checks {@code listing.attributes} against the definitions of the listing's type and scope and rewrites
 * accepted values into a canonical form (INTEGER -> Long, DECIMAL -> BigDecimal, trimmed strings).
 * Unknown keys, catalog-level keys, wrong types, out-of-range values and unknown options are rejected.
 */
@Component
@RequiredArgsConstructor
public class ListingAttributeValidator {

    private static final int DEFAULT_MAX_STRING_LENGTH = 500;

    private final ListingAttributeCatalogService catalogService;

    /** Drops empty entries (null, blank string, empty list/map) so "not answered" is never stored. */
    public void cleanup(Listing listing) {
        if (listing == null || listing.getAttributes() == null) {
            return;
        }
        listing.getAttributes().entrySet().removeIf(e -> isEmpty(e.getValue()));
    }

    public Result<Void> validate(Listing listing) {
        if (listing == null) {
            return Result.error(ListingErrorCodes.LISTING_REQUIRED);
        }
        Map<String, Object> attributes = listing.getAttributes() != null ? listing.getAttributes() : Map.of();
        List<AttributeDefinitionDto> definitions =
                catalogService.getDefinitions(listing.getListingType(), listing.attributeScopeKey());
        Map<String, AttributeDefinitionDto> byKey = definitions.stream()
                .collect(Collectors.toMap(AttributeDefinitionDto::getKey, d -> d, (a, b) -> a, LinkedHashMap::new));

        Map<String, Object> normalized = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            AttributeDefinitionDto def = byKey.get(entry.getKey());
            if (def == null) {
                return error(ListingErrorCodes.ATTRIBUTE_UNKNOWN, entry.getKey(), "is not defined for this listing");
            }
            if (def.getLevel() != AttributeLevel.LISTING) {
                return error(ListingErrorCodes.ATTRIBUTE_CATALOG_LEVEL, entry.getKey(), "comes from the catalog and cannot be set");
            }
            Result<Object> value = normalize(def, entry.getValue());
            if (value.isError()) {
                return Result.error(value.getMessage(), value.getErrorCode());
            }
            normalized.put(entry.getKey(), value.getData());
        }

        for (AttributeDefinitionDto def : definitions) {
            if (def.isRequired() && def.getLevel() == AttributeLevel.LISTING && !normalized.containsKey(def.getKey())) {
                return error(ListingErrorCodes.ATTRIBUTE_REQUIRED, def.getKey(), "is required");
            }
        }

        if (listing.getAttributes() != null) {
            listing.getAttributes().clear();
            listing.getAttributes().putAll(normalized);
        }
        return Result.success();
    }

    private Result<Object> normalize(AttributeDefinitionDto def, Object raw) {
        String key = def.getKey();
        return switch (def.getDataType()) {
            case STRING -> {
                if (!(raw instanceof String s)) yield typeError(key, "text");
                String trimmed = s.trim();
                int max = def.getMax() != null ? def.getMax().intValue() : DEFAULT_MAX_STRING_LENGTH;
                if (trimmed.length() > max) {
                    yield error(ListingErrorCodes.ATTRIBUTE_OUT_OF_RANGE, key, "is longer than " + max + " characters");
                }
                yield Result.success(trimmed);
            }
            case INTEGER -> {
                BigDecimal number = toNumber(raw);
                if (number == null || number.stripTrailingZeros().scale() > 0) yield typeError(key, "a whole number");
                Result<Object> range = checkRange(def, number);
                yield range.isError() ? range : Result.success(number.longValueExact());
            }
            case DECIMAL -> {
                BigDecimal number = toNumber(raw);
                if (number == null) yield typeError(key, "a number");
                Result<Object> range = checkRange(def, number);
                yield range.isError() ? range : Result.success(number);
            }
            case BOOLEAN -> raw instanceof Boolean b ? Result.success(b) : typeError(key, "true or false");
            case DATE -> {
                if (!(raw instanceof String s)) yield typeError(key, "a date (yyyy-MM-dd)");
                try {
                    yield Result.success(LocalDate.parse(s.trim()).toString());
                } catch (DateTimeParseException e) {
                    yield typeError(key, "a date (yyyy-MM-dd)");
                }
            }
            case ENUM -> {
                if (!(raw instanceof String s)) yield typeError(key, "one option");
                yield optionValues(def, ListingAttributeOption.GROUP_VALUE).contains(s.trim())
                        ? Result.success(s.trim())
                        : error(ListingErrorCodes.ATTRIBUTE_INVALID_OPTION, key, "has no option '" + s + "'");
            }
            case MULTI_ENUM -> {
                if (!(raw instanceof Collection<?> values)) yield typeError(key, "a list of options");
                Set<String> allowed = optionValues(def, ListingAttributeOption.GROUP_VALUE);
                List<String> picked = new ArrayList<>();
                for (Object v : values) {
                    if (!(v instanceof String s) || !allowed.contains(s.trim())) {
                        yield error(ListingErrorCodes.ATTRIBUTE_INVALID_OPTION, key, "has no option '" + v + "'");
                    }
                    if (!picked.contains(s.trim())) {
                        picked.add(s.trim());
                    }
                }
                yield Result.success(picked);
            }
            case ENUM_MAP -> {
                if (!(raw instanceof Map<?, ?> map)) yield typeError(key, "an object of part -> option");
                Set<String> allowedKeys = optionValues(def, ListingAttributeOption.GROUP_KEY);
                Set<String> allowedValues = optionValues(def, ListingAttributeOption.GROUP_VALUE);
                Map<String, String> result = new LinkedHashMap<>();
                for (Map.Entry<?, ?> e : map.entrySet()) {
                    if (!(e.getKey() instanceof String k) || !allowedKeys.contains(k)) {
                        yield error(ListingErrorCodes.ATTRIBUTE_INVALID_OPTION, key, "has no part '" + e.getKey() + "'");
                    }
                    if (!(e.getValue() instanceof String v) || !allowedValues.contains(v)) {
                        yield error(ListingErrorCodes.ATTRIBUTE_INVALID_OPTION, key, "has no option '" + e.getValue() + "' for " + k);
                    }
                    result.put(k, v);
                }
                yield Result.success(result);
            }
        };
    }

    private Result<Object> checkRange(AttributeDefinitionDto def, BigDecimal number) {
        if (def.getMin() != null && number.compareTo(def.getMin()) < 0) {
            return error(ListingErrorCodes.ATTRIBUTE_OUT_OF_RANGE, def.getKey(), "must be at least " + def.getMin().stripTrailingZeros().toPlainString());
        }
        if (def.getMax() != null && number.compareTo(def.getMax()) > 0) {
            return error(ListingErrorCodes.ATTRIBUTE_OUT_OF_RANGE, def.getKey(), "must be at most " + def.getMax().stripTrailingZeros().toPlainString());
        }
        return Result.success();
    }

    private static BigDecimal toNumber(Object raw) {
        if (raw instanceof BigDecimal b) return b;
        if (raw instanceof Integer || raw instanceof Long || raw instanceof Short) return BigDecimal.valueOf(((Number) raw).longValue());
        if (raw instanceof Double || raw instanceof Float) {
            double d = ((Number) raw).doubleValue();
            return Double.isFinite(d) ? BigDecimal.valueOf(d) : null;
        }
        if (raw instanceof java.math.BigInteger bi) return new BigDecimal(bi);
        return null;
    }

    private static Set<String> optionValues(AttributeDefinitionDto def, String group) {
        Set<String> values = new HashSet<>();
        for (AttributeOptionDto o : def.getOptions()) {
            if (group.equals(o.getGroup())) {
                values.add(o.getValue());
            }
        }
        return values;
    }

    private static boolean isEmpty(Object value) {
        return value == null
                || (value instanceof String s && s.isBlank())
                || (value instanceof Collection<?> c && c.isEmpty())
                || (value instanceof Map<?, ?> m && m.isEmpty());
    }

    private static <T> Result<T> typeError(String key, String expected) {
        return error(ListingErrorCodes.ATTRIBUTE_TYPE_MISMATCH, key, "must be " + expected);
    }

    private static <T> Result<T> error(ListingErrorCodes code, String key, String detail) {
        return Result.error("Attribute '" + key + "' " + detail, code.getCode());
    }
}
