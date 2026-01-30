package com.serhat.secondhand.listing.validation.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BooksHierarchyValidator implements BooksSpecValidator {

    @Override
    public Result<Void> validate(BooksListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (isGenreTypeMismatch(listing.getBookType(), listing.getGenre())) {
            return Result.error("Book genre does not belong to selected book type", "BOOK_GENRE_TYPE_MISMATCH");
        }

        return Result.success();
    }

    @Override
    public void cleanup(BooksListing listing) {
    }

    private boolean isGenreTypeMismatch(BookType selectedType, BookGenre genre) {
        if (selectedType == null || genre == null) {
            return false;
        }
        UUID selectedTypeId = selectedType.getId();
        BookType genreType = genre.getBookType();
        UUID genreTypeId = genreType != null ? genreType.getId() : null;
        if (selectedTypeId == null || genreTypeId == null) {
            return false;
        }
        return !selectedTypeId.equals(genreTypeId);
    }
}

