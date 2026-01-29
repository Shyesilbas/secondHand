package com.serhat.secondhand.listing.detail.strategy;

import com.serhat.secondhand.listing.detail.ListingDetailStrategy;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.repository.books.BooksListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookDetailStrategy implements ListingDetailStrategy {

    private final BooksListingRepository booksListingRepository;

    @Override
    public String getDetailSummary(UUID listingId) {
        BooksListing book = booksListingRepository.findById(listingId).orElse(null);
        if (book == null) {
            return "";
        }

        String author = book.getAuthor();
        String genre = book.getGenre() != null ? book.getGenre().getLabel().toLowerCase() : null;
        String language = book.getLanguage() != null ? book.getLanguage().getLabel().toLowerCase() : null;
        Integer publicationYear = book.getPublicationYear();
        Integer pageCount = book.getPageCount();
        String format = book.getFormat() != null ? book.getFormat().getLabel().toLowerCase() : null;
        String condition = book.getCondition() != null ? book.getCondition().getLabel().toLowerCase() : null;

        StringBuilder sb = new StringBuilder("Bu kitap");
        if (author != null && !author.isBlank()) {
            sb.append(" ").append(author).append(" yazarlıdır");
        }
        if (publicationYear != null) {
            sb.append(", ").append(publicationYear).append(" basım");
        }
        if (pageCount != null) {
            sb.append(", ").append(pageCount).append(" sayfa");
        }
        if (language != null && !language.isBlank()) {
            sb.append(", ").append(language).append(" dilinde");
        }
        if (genre != null && !genre.isBlank()) {
            sb.append(", ").append(genre).append(" türündedir");
        }
        if (format != null && !format.isBlank()) {
            sb.append(", ").append(format).append(" formatındadır");
        }
        if (condition != null && !condition.isBlank()) {
            sb.append(", ").append(condition).append(" kondisyondadır");
        }
        sb.append(".");

        return sb.toString();
    }

    @Override
    public boolean supports(ListingType type) {
        return type == ListingType.BOOKS;
    }
}

