package com.serhat.secondhand.listing.application;

import com.serhat.secondhand.listing.domain.dto.response.listing.ListingDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.RealEstateFilterDto;
import com.serhat.secondhand.listing.domain.dto.response.listing.VehicleListingFilterDto;
import com.serhat.secondhand.listing.domain.entity.RealEstateListing;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.vehicle.ListingType;
import com.serhat.secondhand.listing.domain.mapper.ListingMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealEstateListingServiceImpl implements RealEstateListingFilterService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ListingMapper listingMapper;

    @Override
    public Page<ListingDto> filterRealEstates(RealEstateFilterDto filters) {
        log.info("Filtering Real Estates with criteria: {}", filters);

        Pageable pageable = FilterHelper.initializeFilter(filters);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Query for results - Use VehicleListing directly since it extends Listing
        CriteriaQuery<RealEstateListing> query = cb.createQuery(RealEstateListing.class);
        Root<RealEstateListing> root = query.from(RealEstateListing.class);

        List<Predicate> predicates = buildPredicates(cb, root, filters);

        query.select(root)
                .where(predicates.toArray(new Predicate[0]))
                .orderBy(buildOrderBy(cb, root, filters));

        TypedQuery<RealEstateListing> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<RealEstateListing> results = typedQuery.getResultList();

        // Count query for total
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<RealEstateListing> countRoot = countQuery.from(RealEstateListing.class);

        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filters);

        countQuery.select(cb.count(countRoot))
                .where(countPredicates.toArray(new Predicate[0]));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        // Convert to DTOs
        List<ListingDto> dtos = results.stream()
                .map(listingMapper::toDynamicDto)
                .toList();

        return new PageImpl<>(dtos, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<RealEstateListing> root,
                                            RealEstateFilterDto filters) {
        List<Predicate> predicates = new ArrayList<>();

        // Sadece emlak ilanlarını getir
        predicates.add(cb.equal(root.get("listingType"), ListingType.REAL_ESTATE));

        // Ortak filtreler (fiyat, şehir, district vs.)
        predicates.addAll(FilterHelper.buildBasePredicates(cb, root, filters));

        // Isınma türü
        if (filters.getHeatingTypes() != null && !filters.getHeatingTypes().isEmpty()) {
            predicates.add(root.get("heatingType").in(filters.getHeatingTypes()));
        }

        // Emlak tipi (daire, villa, arsa vs.)
        if (filters.getRealEstateTypes() != null && !filters.getRealEstateTypes().isEmpty()) {
            predicates.add(root.get("realEstateType").in(filters.getRealEstateTypes()));
        }

        // Kat bilgisi
        if (filters.getFloor() != null) {
            predicates.add(cb.equal(root.get("floor"), filters.getFloor()));
        }

        // İlan tipi (kiralık/satılık)
        if (filters.getAdType() != null) {
            predicates.add(cb.equal(root.get("adType"), filters.getAdType()));
        }

        // Sahibinden / emlakçıdan
        if (filters.getOwnerType() != null) {
            predicates.add(cb.equal(root.get("ownerType"), filters.getOwnerType()));
        }

        // Metrekare aralığı
        if (filters.getMinSquareMeters() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("squareMeters"), filters.getMinSquareMeters()));
        }
        if (filters.getMaxSquareMeters() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("squareMeters"), filters.getMaxSquareMeters()));
        }

        // Oda sayısı aralığı
        if (filters.getMinRoomCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("roomCount"), filters.getMinRoomCount()));
        }
        if (filters.getMaxRoomCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("roomCount"), filters.getMaxRoomCount()));
        }

        // Banyo sayısı aralığı
        if (filters.getMinBathroomCount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("bathroomCount"), filters.getMinBathroomCount()));
        }
        if (filters.getMaxBathroomCount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("bathroomCount"), filters.getMaxBathroomCount()));
        }

        // Bina yaşı aralığı
        if (filters.getMinBuildingAge() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("buildingAge"), filters.getMinBuildingAge()));
        }
        if (filters.getMaxBuildingAge() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("buildingAge"), filters.getMaxBuildingAge()));
        }

        // Eşyalı mı?
        if (filters.isFurnished()) {
            predicates.add(cb.equal(root.get("furnished"), true));
        }

        return predicates;
    }


    private List<Order> buildOrderBy(CriteriaBuilder cb, Root<RealEstateListing> root,
                                     RealEstateFilterDto filters) {
        List<Order> orders = new ArrayList<>();

        if (filters.getSortBy() != null && !filters.getSortBy().trim().isEmpty()) {
            String sortBy = filters.getSortBy().toLowerCase();
            boolean isDesc = "DESC".equalsIgnoreCase(filters.getSortDirection());

            Expression<?> sortExpression = switch (sortBy) {
                case "price" -> root.get("price");
                case "createdat", "created_at" -> root.get("createdAt");
                case "squaremeters", "square_meters" -> root.get("squareMeters");
                case "roomcount", "room_count" -> root.get("roomCount");
                case "buildingage", "building_age" -> root.get("buildingAge");
                default -> root.get("createdAt"); // default fallback
            };

            orders.add(isDesc ? cb.desc(sortExpression) : cb.asc(sortExpression));
        } else {
            // Varsayılan sıralama: en yeni ilan en üstte
            orders.add(cb.desc(root.get("createdAt")));
        }

        return orders;
    }

}
