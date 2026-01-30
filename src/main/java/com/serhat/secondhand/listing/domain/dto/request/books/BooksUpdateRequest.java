package com.serhat.secondhand.listing.domain.dto.request.books;

import com.serhat.secondhand.listing.domain.dto.request.common.BaseListingUpdateRequest;

import java.util.Optional;
import java.util.UUID;

public record BooksUpdateRequest(
        BaseListingUpdateRequest base,
        Optional<Integer> quantity,
        Optional<String> author,
        Optional<UUID> bookTypeId,
        Optional<UUID> genreId,
        Optional<UUID> languageId,
        Optional<Integer> publicationYear,
        Optional<Integer> pageCount,
        Optional<UUID> formatId,
        Optional<UUID> conditionId,
        Optional<String> isbn
) {}


