package com.serhat.secondhand.listing.domain.repository.books;

import com.serhat.secondhand.listing.domain.entity.BooksListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BooksListingRepository extends JpaRepository<BooksListing, UUID> {
}


