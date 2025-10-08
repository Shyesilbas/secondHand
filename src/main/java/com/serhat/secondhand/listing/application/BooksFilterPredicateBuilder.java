package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class BooksFilterPredicateBuilder implements FilterPredicateBuilder<BooksListing, BooksListingFilterDto> {

    @Override
    public List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<BooksListing> root, BooksListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();
        
        // Listing type constraint
        predicates.add(cb.equal(root.get("listingType"), ListingType.BOOKS));
        
        // Books-specific filters
        if (filters.getGenres() != null && !filters.getGenres().isEmpty()) {
            predicates.add(root.get("genre").in(filters.getGenres()));
        }
        
        if (filters.getLanguages() != null && !filters.getLanguages().isEmpty()) {
            predicates.add(root.get("language").in(filters.getLanguages()));
        }
        
        if (filters.getFormats() != null && !filters.getFormats().isEmpty()) {
            predicates.add(root.get("format").in(filters.getFormats()));
        }
        
        if (filters.getConditions() != null && !filters.getConditions().isEmpty()) {
            predicates.add(root.get("condition").in(filters.getConditions()));
        }
        
        // Range filters
        if (filters.getMinYear() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("publicationYear"), filters.getMinYear()));
        }
        
        if (filters.getMaxYear() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("publicationYear"), filters.getMaxYear()));
        }
        
        if (filters.getMinPageCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("pageCount"), filters.getMinPageCount()));
        }
        
        if (filters.getMaxPageCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("pageCount"), filters.getMaxPageCount()));
        }
        
        return predicates;
    }

    @Override
    public Optional<Expression<?>> getSortExpression(Root<BooksListing> root, String sortBy) {
        return switch (sortBy) {
            case "price" -> Optional.of(root.get("price"));
            case "createdat", "created_at" -> Optional.of(root.get("createdAt"));
            case "year", "publicationyear", "publication_year" -> Optional.of(root.get("publicationYear"));
            case "pagecount", "page_count" -> Optional.of(root.get("pageCount"));
            case "author" -> Optional.of(root.get("author"));
            default -> Optional.empty();
        };
    }
}
