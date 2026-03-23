package com.serhat.secondhand.listing.application.filter;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.util.List;
import java.util.Optional;

public interface FilterPredicateBuilder<T extends Listing, F extends ListingFilterDto> {

    List<Predicate> buildSpecificPredicates(CriteriaBuilder cb, Root<T> root, F filters);

    Optional<Expression<?>> getSortExpression(Root<T> root, String sortBy);
}
