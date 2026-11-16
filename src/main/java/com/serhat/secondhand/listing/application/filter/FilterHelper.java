package com.serhat.secondhand.listing.application.filter;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingStatus;
import com.serhat.secondhand.listing.util.ListingErrorCodes;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import com.serhat.secondhand.core.dto.PageRequests;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

public class FilterHelper {

    public static Pageable initializeFilter(ListingFilterDto filters) {
        if (filters.getPage() == null) filters.setPage(0);
        if (filters.getSize() == null) filters.setSize(10);
        if (filters.getStatus() == null) filters.setStatus(ListingStatus.ACTIVE);
        // Filter endpoints are public: never let a caller browse drafts, inactive or deleted listings.
        if (!filters.getStatus().isPublicBrowsable()) {
            throw new BusinessException(ListingErrorCodes.INVALID_LISTING_STATUS);
        }
        return PageRequests.of(filters.getPage(), filters.getSize());
    }

    public static List<Predicate> buildBasePredicates(CriteriaBuilder cb, Root<?> root, ListingFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        if (filters.getExcludedSellerIds() != null && !filters.getExcludedSellerIds().isEmpty()) {
            predicates.add(cb.not(root.get("seller").get("id").in(filters.getExcludedSellerIds())));
        }
        if (filters.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), filters.getStatus()));
        }
        if (filters.getTitle() != null && !filters.getTitle().trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("title")), "%" + filters.getTitle().toLowerCase() + "%"));
        }
        // The indexed catalog keys win; the free-text label LIKE only runs for clients that send no key.
        if (isBlank(filters.getCityKey()) && !isBlank(filters.getCity())) {
            predicates.add(cb.like(cb.lower(root.get("city")), "%" + filters.getCity().toLowerCase() + "%"));
        }
        if (isBlank(filters.getDistrictKey()) && !isBlank(filters.getDistrict())) {
            predicates.add(cb.like(cb.lower(root.get("district")), "%" + filters.getDistrict().toLowerCase() + "%"));
        }
        if (filters.getCityKey() != null && !filters.getCityKey().trim().isEmpty()) {
            predicates.add(cb.equal(root.get("cityKey"), filters.getCityKey().toUpperCase()));
        }
        if (filters.getDistrictKey() != null && !filters.getDistrictKey().trim().isEmpty()) {
            predicates.add(cb.equal(root.get("districtKey"), filters.getDistrictKey().toUpperCase()));
        }
        if (filters.getNeighborhoodKey() != null && !filters.getNeighborhoodKey().trim().isEmpty()) {
            predicates.add(cb.equal(root.get("neighborhoodKey"), filters.getNeighborhoodKey().toUpperCase()));
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

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
