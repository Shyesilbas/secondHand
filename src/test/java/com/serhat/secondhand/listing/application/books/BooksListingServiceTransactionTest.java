package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.domain.dto.request.books.BooksCreateRequest;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

class BooksListingServiceTransactionTest {

    /** The self-call into createListing bypasses the proxy; without this a catalog edition's lazy authors fail with a 500. */
    @Test
    void createBooksListingRunsInItsOwnTransaction() throws NoSuchMethodException {
        var method = BooksListingService.class.getMethod("createBooksListing", BooksCreateRequest.class, Long.class);
        assertThat(method.getAnnotation(Transactional.class)).isNotNull();
    }
}
