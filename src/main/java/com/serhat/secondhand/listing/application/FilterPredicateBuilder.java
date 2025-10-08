package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.List;
import java.util.Optional;

public interface FilterPredicateBuilder<T extends Listing, F extends ListingFilterDto> {
    
    /**
     * Build category-specific predicates for filtering
     */
    List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<T> root, F filters);
    
    /**
     * Get sort expression for the given sort field
     * @param root The query root
     * @param sortBy The field to sort by
     * @return Optional expression, empty if field is not supported
     */
    Optional<Expression<?>> getSortExpression(Root<T> root, String sortBy);
}
