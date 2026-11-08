package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModelVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface ElectronicModelVariantRepository extends JpaRepository<ElectronicModelVariant, UUID> {

    List<ElectronicModelVariant> findByModel_IdOrderBySortOrderAscNameAsc(UUID modelId);

    List<ElectronicModelVariant> findByModel_IdIn(Collection<UUID> modelIds);

    /** Variants of the model that the seed no longer lists and no listing points to. */
    @Modifying
    @Query(value = """
            DELETE FROM electronic_model_variants v
            WHERE v.electronic_model_id = :modelId
              AND NOT (v.id = ANY(CAST(:keepIds AS uuid[])))
              AND NOT EXISTS (SELECT 1 FROM electronic_listings e WHERE e.electronic_variant_id = v.id)
            """, nativeQuery = true)
    int deleteStaleUnreferenced(@Param("modelId") UUID modelId, @Param("keepIds") String keepIds);
}
