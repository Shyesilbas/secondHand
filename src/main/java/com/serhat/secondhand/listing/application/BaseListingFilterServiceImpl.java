package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingStatus;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import com.serhat.secondhand.listing.domain.repository.listing.ListingRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BaseListingFilterServiceImpl implements BaseListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;
    
    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterAllListings(ListingFilterDto filters) {
        log.info("Filtering all listings with criteria: {}", filters);
        
        if (filters.getPage() == null) filters.setPage(0);
        if (filters.getSize() == null) filters.setSize(20);
        if (filters.getStatus() == null) filters.setStatus(ListingStatus.ACTIVE);
        
        Pageable pageable = PageRequest.of(filters.getPage(), filters.getSize());
        
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Listing> query = cb.createQuery(Listing.class);
        Root<Listing> listing = query.from(Listing.class);

        List<Predicate> predicates = new ArrayList<>();

        // Basic filters
        if (filters.getListingType() != null) {
            predicates.add(cb.equal(listing.get("listingType"), filters.getListingType()));
        }

        if (filters.getStatus() != null) {
            predicates.add(cb.equal(listing.get("status"), filters.getStatus()));
        }

        if (filters.getCity() != null && !filters.getCity().trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(listing.get("city")), 
                "%" + filters.getCity().toLowerCase() + "%"));
        }

        if (filters.getDistrict() != null && !filters.getDistrict().trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(listing.get("district")), 
                "%" + filters.getDistrict().toLowerCase() + "%"));
        }

        // Price filters
        if (filters.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(listing.get("price"), filters.getMinPrice()));
        }

        if (filters.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(listing.get("price"), filters.getMaxPrice()));
        }

        if (filters.getCurrency() != null) {
            predicates.add(cb.equal(listing.get("currency"), filters.getCurrency()));
        }

        // Apply all predicates
        if (!predicates.isEmpty()) {
            query.where(predicates.toArray(new Predicate[0]));
        }

        // Sorting
        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression;
            switch (sortBy.toLowerCase()) {
                case "price":
                    sortExpression = listing.get("price");
                    break;
                case "createdat":
                case "created_at":
                    sortExpression = listing.get("createdAt");
                    break;
                default:
                    sortExpression = listing.get("createdAt");
            }

            if (isDesc) {
                query.orderBy(cb.desc(sortExpression));
            } else {
                query.orderBy(cb.asc(sortExpression));
            }
        } else {
            // Default sorting by creation date descending
            query.orderBy(cb.desc(listing.get("createdAt")));
        }

        // Execute query
        List<Listing> results = entityManager.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        // Count query for pagination
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Listing> countRoot = countQuery.from(Listing.class);
        countQuery.select(cb.count(countRoot));

        // Apply same predicates to count query
        if (!predicates.isEmpty()) {
            countQuery.where(predicates.toArray(new Predicate[0]));
        }

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // Convert to DTOs
        List<ListingDto> dtos = results.stream()
                .map(listingMapper::toDynamicDto)
                .toList();

        return new PageImpl<>(dtos, pageable, total);
    }
}
