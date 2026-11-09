package com.serhat.secondhand.listing.domain.dto.response.books;

import java.util.UUID;

/** One catalog edition with its work's facts, for the listing form's ISBN / title search. */
public record BookEditionCatalogDto(
        UUID id,
        String isbn,
        String title,
        String authors,
        UUID bookTypeId,
        String bookTypeLabel,
        UUID genreId,
        String genreLabel,
        String publisher,
        Integer publicationYear,
        Integer pageCount,
        UUID formatId,
        String formatLabel,
        UUID languageId,
        String languageLabel,
        String translator,
        String coverUrl,
        Integer examYear,
        String source
) {}
