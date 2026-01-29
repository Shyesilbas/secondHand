package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record BooksCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull Currency currency,
        @NotNull @Min(1) Integer quantity,
        @NotBlank String city,
        @NotBlank String district,
        @NotBlank String author,
        @NotNull UUID bookTypeId,
        @NotNull UUID genreId,
        @NotNull UUID languageId,
        @NotNull @Min(1450) @Max(2100) Integer publicationYear,
        @NotNull @Positive Integer pageCount,
        @NotNull UUID formatId,
        @NotNull UUID conditionId,
        String isbn,
        String imageUrl
) {}


