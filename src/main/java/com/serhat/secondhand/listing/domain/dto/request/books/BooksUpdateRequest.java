package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;

import java.util.Optional;
import java.math.BigDecimal;
import java.util.UUID;

public record BooksUpdateRequest(
        Optional<String> title,
        Optional<String> description,
        Optional<BigDecimal> price,
        Optional<Currency> currency,
        Optional<Integer> quantity,
        Optional<String> city,
        Optional<String> district,
        Optional<String> author,
        Optional<UUID> bookTypeId,
        Optional<UUID> genreId,
        Optional<UUID> languageId,
        Optional<Integer> publicationYear,
        Optional<Integer> pageCount,
        Optional<UUID> formatId,
        Optional<UUID> conditionId,
        Optional<String> isbn,
        Optional<String> imageUrl
) {}


