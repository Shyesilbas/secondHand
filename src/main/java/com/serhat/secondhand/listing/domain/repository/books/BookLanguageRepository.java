package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookLanguage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookLanguageRepository extends JpaRepository<BookLanguage, UUID> {
    Optional<BookLanguage> findByNameIgnoreCase(String name);
}

