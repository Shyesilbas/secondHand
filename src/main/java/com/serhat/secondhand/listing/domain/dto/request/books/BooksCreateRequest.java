package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingCreateRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;

public record BooksCreateRequest(
        @NotNull @Valid BaseListingCreateRequest base,
        @NotNull @Min(1) Integer quantity,
        @NotBlank String author,
        @NotNull UUID bookTypeId,
        @NotNull UUID genreId,
        @NotNull UUID languageId,
        @NotNull @Min(1450) @Max(2100) Integer publicationYear,
        @NotNull @Positive Integer pageCount,
        @NotNull UUID formatId,
        @NotNull UUID conditionId,
        String isbn
) {}


