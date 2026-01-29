package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookGenreRepository extends JpaRepository<BookGenre, UUID> {
    Optional<BookGenre> findByNameIgnoreCase(String name);
}

