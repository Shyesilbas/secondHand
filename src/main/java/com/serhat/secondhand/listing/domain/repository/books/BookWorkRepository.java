package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.enums.books.BookWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BookWorkRepository extends JpaRepository<BookWork, UUID> {
}
