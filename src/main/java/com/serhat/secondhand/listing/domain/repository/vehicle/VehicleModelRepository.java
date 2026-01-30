package com.serhat.secondhand.listing.domain.repository.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.vehicle.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface VehicleModelRepository extends JpaRepository<VehicleModel, UUID> {
    List<VehicleModel> findByBrand_Id(UUID brandId);
    List<VehicleModel> findAllByBrand_IdAndType_IdAndNameIgnoreCase(UUID brandId, UUID typeId, String name);
    List<VehicleModel> findAllByBrand_IdAndNameIgnoreCase(UUID brandId, String name);
    List<VehicleModel> findAllByBrand_IdAndTypeIsNullAndNameIgnoreCase(UUID brandId, String name);
    List<VehicleModel> findByTypeIsNull();

    @Query("""
            select m.brand.id, m.type.id, lower(m.name), count(m.id)
            from VehicleModel m
            group by m.brand.id, m.type.id, lower(m.name)
            having count(m.id) > 1
            """)
    List<Object[]> findDuplicateModelKeys();
}

