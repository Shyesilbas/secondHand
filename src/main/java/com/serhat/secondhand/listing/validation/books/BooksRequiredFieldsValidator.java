package com.serhat.secondhand.listing.validation.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import org.springframework.stereotype.Component;

@Component
public class BooksRequiredFieldsValidator implements BooksSpecValidator {

    @Override
    public Result<Void> validate(BooksListing listing) {
        if (listing == null) {
            return Result.error("Listing is required", "LISTING_REQUIRED");
        }

        if (listing.getBookType() == null) {
            return Result.error("Book type is required", "BOOK_TYPE_REQUIRED");
        }
        if (listing.getGenre() == null) {
            return Result.error("Book genre is required", "BOOK_GENRE_REQUIRED");
        }
        if (listing.getLanguage() == null) {
            return Result.error("Book language is required", "BOOK_LANGUAGE_REQUIRED");
        }
        if (listing.getFormat() == null) {
            return Result.error("Book format is required", "BOOK_FORMAT_REQUIRED");
        }
        if (listing.getCondition() == null) {
            return Result.error("Book condition is required", "BOOK_CONDITION_REQUIRED");
        }

        String author = listing.getAuthor();
        if (author == null || author.isBlank()) {
            return Result.error("Author is required", "BOOK_AUTHOR_REQUIRED");
        }

        Integer publicationYear = listing.getPublicationYear();
        if (publicationYear == null || publicationYear < 1450 || publicationYear > 2100) {
            return Result.error("Publication year must be valid", "BOOK_PUBLICATION_YEAR_INVALID");
        }

        Integer pageCount = listing.getPageCount();
        if (pageCount == null || pageCount <= 0) {
            return Result.error("Page count must be greater than 0", "BOOK_PAGE_COUNT_INVALID");
        }

        String isbn = listing.getIsbn();
        if (isbn != null && !isbn.isBlank() && isbn.trim().length() > 20) {
            return Result.error("ISBN is too long", "BOOK_ISBN_TOO_LONG");
        }

        return Result.success();
    }

    @Override
    public void cleanup(BooksListing listing) {
    }
}

