package com.serhat.secondhand.listing.domain.repository.attribute;

import com.serhat.secondhand.listing.domain.entity.attribute.ListingAttributeDefinition;
import com.serhat.secondhand.listing.domain.entity.enums.base.ListingType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ListingAttributeDefinitionRepository extends JpaRepository<ListingAttributeDefinition, UUID> {

    @EntityGraph(attributePaths = "options")
    List<ListingAttributeDefinition> findByListingTypeAndScopeKeyInOrderBySortOrderAsc(
            ListingType listingType, Collection<String> scopeKeys);

    @EntityGraph(attributePaths = "options")
    List<ListingAttributeDefinition> findByListingType(ListingType listingType);
}
