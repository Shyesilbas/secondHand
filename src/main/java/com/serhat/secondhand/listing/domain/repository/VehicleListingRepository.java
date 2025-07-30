package com.serhat.secondhand.listing.domain.repository;

import com.serhat.secondhand.listing.domain.dto.request.VehicleSearchCriteria;
import com.serhat.secondhand.listing.domain.entity.VehicleListing;
import com.serhat.secondhand.listing.domain.entity.enums.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleListingRepository extends JpaRepository<VehicleListing, UUID> {
    

    List<VehicleListing> findByBrandAndModel(CarBrand brand, String model);

    @Query("SELECT v FROM VehicleListing v WHERE " +
           "(:#{#criteria.brand().orElse(null)} IS NULL OR v.brand = :#{#criteria.brand().orElse(null)}) AND " +
           "(:#{#criteria.model().orElse(null)} IS NULL OR v.model LIKE %:#{#criteria.model().orElse('')}%) AND " +
           "(:#{#criteria.yearMin().orElse(null)} IS NULL OR v.year >= :#{#criteria.yearMin().orElse(0)}) AND " +
           "(:#{#criteria.yearMax().orElse(null)} IS NULL OR v.year <= :#{#criteria.yearMax().orElse(9999)}) AND " +
           "(:#{#criteria.priceMin().orElse(null)} IS NULL OR v.price >= :#{#criteria.priceMin().orElse(0)}) AND " +
           "(:#{#criteria.priceMax().orElse(null)} IS NULL OR v.price <= :#{#criteria.priceMax().orElse(999999999)}) AND " +
           "(:#{#criteria.city().orElse(null)} IS NULL OR v.city = :#{#criteria.city().orElse(null)}) AND " +
           "(:#{#criteria.district().orElse(null)} IS NULL OR v.district = :#{#criteria.district().orElse(null)}) AND " +
           "(:#{#criteria.mileageMax().orElse(null)} IS NULL OR v.mileage <= :#{#criteria.mileageMax().orElse(9999999)}) AND " +
           "(:#{#criteria.fuelType().orElse(null)} IS NULL OR v.fuelType = :#{#criteria.fuelType().orElse(null)}) AND " +
           "(:#{#criteria.doors().orElse(null)} IS NULL OR v.doors = :#{#criteria.doors().orElse(null)}) AND " +
           "(:#{#criteria.color().orElse(null)} IS NULL OR v.color = :#{#criteria.color().orElse(null)})")
    List<VehicleListing> searchByCriteria(@Param("criteria") VehicleSearchCriteria criteria);
}