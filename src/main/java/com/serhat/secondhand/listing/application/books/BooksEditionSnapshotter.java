package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookEdition;
import com.serhat.secondhand.listing.domain.entity.enums.books.BookWork;
import org.springframework.stereotype.Component;

/**
 * Copies the picked catalog edition's facts over the listing: author(s), type and genre from the work; year, pages,
 * format, language, ISBN, publisher and translator from the edition. A fact the catalog does not know keeps the
 * seller's value. Without an edition the facts are seller-declared (unverified).
 */
@Component
public class BooksEditionSnapshotter {

    public void apply(BooksListing listing) {
        if (listing == null || listing.getEdition() == null) {
            return;
        }
        BookEdition edition = listing.getEdition();
        BookWork work = edition.getWork();
        if (!work.getAuthors().isEmpty()) listing.setAuthor(work.authorNames());
        listing.setBookType(work.getBookType());
        listing.setGenre(work.getGenre());
        listing.setLanguage(edition.getLanguage());
        listing.setFormat(edition.getFormat());
        listing.setPublisher(edition.getPublisher().getLabel());
        if (edition.getPublicationYear() != null) listing.setPublicationYear(edition.getPublicationYear());
        if (edition.getPageCount() != null) listing.setPageCount(edition.getPageCount());
        if (edition.getIsbn() != null) listing.setIsbn(edition.getIsbn());
        if (edition.getTranslator() != null) listing.setTranslator(edition.getTranslator());
    }
}
