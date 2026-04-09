package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookGenre;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookGenreRepository extends JpaRepository<BookGenre, UUID> {
    
    @Cacheable(value = "bookGenres", key = "'all'")
    List<BookGenre> findAll();
    
    @Cacheable(value = "bookGenres", key = "#name")
    Optional<BookGenre> findByNameIgnoreCase(String name);
}

