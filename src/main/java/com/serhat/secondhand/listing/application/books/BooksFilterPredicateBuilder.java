package com.serhat.secondhand.listing.application.books;

import com.serhat.secondhand.listing.application.FilterPredicateBuilder;
import com.serhat.secondhand.listing.domain.dto.response.listing.BooksListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.BooksListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.JoinType;
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
        
        predicates.add(cb.equal(root.get("listingType"), ListingType.BOOKS));
        
        if (filters.getBookTypeIds() != null && !filters.getBookTypeIds().isEmpty()) {
            predicates.add(root.join("bookType", JoinType.LEFT).get("id").in(filters.getBookTypeIds()));
        }
        
        if (filters.getGenreIds() != null && !filters.getGenreIds().isEmpty()) {
            predicates.add(root.join("genre", JoinType.LEFT).get("id").in(filters.getGenreIds()));
        }
        
        if (filters.getLanguageIds() != null && !filters.getLanguageIds().isEmpty()) {
            predicates.add(root.join("language", JoinType.LEFT).get("id").in(filters.getLanguageIds()));
        }
        
        if (filters.getFormatIds() != null && !filters.getFormatIds().isEmpty()) {
            predicates.add(root.join("format", JoinType.LEFT).get("id").in(filters.getFormatIds()));
        }

        if (filters.getConditionIds() != null && !filters.getConditionIds().isEmpty()) {
            predicates.add(root.join("condition", JoinType.LEFT).get("id").in(filters.getConditionIds()));
        }
        
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
            case "genre" -> Optional.of(root.join("genre", JoinType.LEFT).get("label"));
            case "language" -> Optional.of(root.join("language", JoinType.LEFT).get("label"));
            case "format" -> Optional.of(root.join("format", JoinType.LEFT).get("label"));
            case "condition" -> Optional.of(root.join("condition", JoinType.LEFT).get("label"));
            default -> Optional.empty();
        };
    }
}
