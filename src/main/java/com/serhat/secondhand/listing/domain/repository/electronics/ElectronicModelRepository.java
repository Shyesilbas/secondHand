package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ElectronicModelRepository extends JpaRepository<ElectronicModel, UUID> {
    Optional<ElectronicModel> findByBrand_IdAndNameIgnoreCase(UUID brandId, String name);
    Optional<ElectronicModel> findByBrand_IdAndType_IdAndNameIgnoreCase(UUID brandId, UUID typeId, String name);
    List<ElectronicModel> findByBrand_Id(UUID brandId);
    List<ElectronicModel> findByBrand_IdAndType_Id(UUID brandId, UUID typeId);
    List<ElectronicModel> findAllByBrand_IdAndNameIgnoreCase(UUID brandId, String name);
    List<ElectronicModel> findByTypeIsNull();
}

