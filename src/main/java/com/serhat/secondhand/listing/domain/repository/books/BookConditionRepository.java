package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookConditionRepository extends JpaRepository<BookCondition, UUID> {
    Optional<BookCondition> findByNameIgnoreCase(String name);
}

