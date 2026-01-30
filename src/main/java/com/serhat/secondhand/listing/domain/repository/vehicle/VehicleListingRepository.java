package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleListingRepository extends JpaRepository<VehicleListing, UUID> {
    

    List<VehicleListing> findByBrand_IdAndModel_Id(UUID brandId, UUID modelId);

    long countByModel_Id(UUID modelId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update VehicleListing v
            set v.model = :keepModel
            where v.model.id in :deleteIds
            """)
    int reassignModel(@Param("keepModel") com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel keepModel,
                      @Param("deleteIds") List<UUID> deleteIds);

}