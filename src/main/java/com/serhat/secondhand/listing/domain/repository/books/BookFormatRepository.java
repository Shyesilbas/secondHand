package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookFormat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookFormatRepository extends JpaRepository<BookFormat, UUID> {
    Optional<BookFormat> findByNameIgnoreCase(String name);
}

