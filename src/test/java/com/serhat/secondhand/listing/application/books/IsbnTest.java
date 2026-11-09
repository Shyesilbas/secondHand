package com.serhat.secondhand.listing.application.books;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class IsbnTest {

    @Test
    void acceptsValidIsbn13WithHyphens() {
        assertThat(Isbn.toIsbn13("978-975-05-0609-3")).contains("9789750506093");
    }

    @Test
    void convertsIsbn10IncludingXCheckDigit() {
        assertThat(Isbn.toIsbn13("975050609X")).contains("9789750506093");
        assertThat(Isbn.toIsbn13("0-306-40615-2")).contains("9780306406157");
    }

    @Test
    void rejectsWrongChecksumsAndShapes() {
        assertThat(Isbn.toIsbn13("9789750506094")).isEmpty();
        assertThat(Isbn.toIsbn13("9750506091")).isEmpty();
        assertThat(Isbn.toIsbn13("1234567890123")).isEmpty();
        assertThat(Isbn.toIsbn13("abc")).isEmpty();
        assertThat(Isbn.toIsbn13(null)).isEmpty();
    }
}
