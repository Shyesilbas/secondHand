package com.serhat.secondhand.listing.validation.books;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.listing.application.books.Isbn;
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

        // cleanup() already turned a valid ISBN into its ISBN-13; anything else left here is invalid.
        String isbn = listing.getIsbn();
        if (isbn != null && Isbn.toIsbn13(isbn).filter(isbn::equals).isEmpty()) {
            return Result.error("ISBN is not a valid ISBN-10 or ISBN-13", "BOOK_ISBN_INVALID");
        }

        return Result.success();
    }

    @Override
    public void cleanup(BooksListing listing) {
        if (listing == null) {
            return;
        }
        listing.setIsbn(blankToNull(listing.getIsbn()));
        if (listing.getIsbn() != null) {
            Isbn.toIsbn13(listing.getIsbn()).ifPresent(listing::setIsbn);
        }
        listing.setPublisher(blankToNull(listing.getPublisher()));
        listing.setTranslator(blankToNull(listing.getTranslator()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}

