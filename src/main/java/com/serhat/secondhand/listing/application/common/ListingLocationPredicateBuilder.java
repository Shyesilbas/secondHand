package com.serhat.secondhand.listing.application.common;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ListingLocationPredicateBuilder {

    public <T extends Listing> List<Predicate> buildLocationPredicates(
            CriteriaBuilder cb, 
            Root<T> root, 
            ListingFilterDto filters
    ) {
        List<Predicate> predicates = new ArrayList<>();

        if (filters == null) {
            return predicates;
        }

        // Support matching location keys
        if (filters.getCityKey() != null && !filters.getCityKey().isBlank()) {
            predicates.add(cb.equal(root.get("cityKey"), filters.getCityKey().toUpperCase()));
        }

        if (filters.getDistrictKey() != null && !filters.getDistrictKey().isBlank()) {
            predicates.add(cb.equal(root.get("districtKey"), filters.getDistrictKey().toUpperCase()));
        }

        if (filters.getNeighborhoodKey() != null && !filters.getNeighborhoodKey().isBlank()) {
            predicates.add(cb.equal(root.get("neighborhoodKey"), filters.getNeighborhoodKey().toUpperCase()));
        }

        return predicates;
    }
}
