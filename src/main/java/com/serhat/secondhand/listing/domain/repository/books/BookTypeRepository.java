package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookTypeRepository extends JpaRepository<BookType, UUID> {
    Optional<BookType> findByNameIgnoreCase(String name);
}

