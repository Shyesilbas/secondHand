package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.Currency;
import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public record BooksCreateRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull Currency currency,
        @NotBlank String city,
        @NotBlank String district,
        @NotBlank String author,
        @NotNull BookGenre genre,
        @NotNull BookLanguage language,
        @NotNull @Min(1450) @Max(2100) Integer publicationYear,
        @NotNull @Positive Integer pageCount,
        @NotNull BookFormat format,
        @NotNull BookCondition condition,
        String isbn,
        String imageUrl
) {}


