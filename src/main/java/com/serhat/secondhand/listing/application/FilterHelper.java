package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;

public class FilterHelper {


    public static Pageable initializeFilter(ListingFilterDto filters) {
        if (filters.getPage() == null) {
            filters.setPage(0);
        }
        if (filters.getSize() == null) {
            filters.setSize(10);
        }
        if (filters.getStatus() == null) {
            filters.setStatus(ListingStatus.ACTIVE);
        }
        
        return PageRequest.of(filters.getPage(), filters.getSize());
    }

    public static List<Predicate> buildBasePredicates(CriteriaBuilder cb, Root<?> root, ListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

                if (filters.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), filters.getStatus()));
        }

                if (filters.getCity() != null && !filters.getCity().trim().isEmpty()) {
            predicates.add(cb.like(
                cb.lower(root.get("city")),
                "%" + filters.getCity().toLowerCase() + "%"
            ));
        }

                if (filters.getDistrict() != null && !filters.getDistrict().trim().isEmpty()) {
            predicates.add(cb.like(
                cb.lower(root.get("district")),
                "%" + filters.getDistrict().toLowerCase() + "%"
            ));
        }

                if (filters.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filters.getMinPrice()));
        }

        if (filters.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("price"), filters.getMaxPrice()));
        }

                if (filters.getCurrency() != null) {
            predicates.add(cb.equal(root.get("currency"), filters.getCurrency()));
        }

        return predicates;
    }
}
