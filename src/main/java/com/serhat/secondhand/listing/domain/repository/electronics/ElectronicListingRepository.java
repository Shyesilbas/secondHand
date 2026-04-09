package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ElectronicListingRepository extends JpaRepository<ElectronicListing, UUID> {
    @EntityGraph(attributePaths = {"seller", "electronicType", "electronicModel"})
    Page<ElectronicListing> findByElectronicBrand(ElectronicBrand electronicBrand, Pageable pageable);
    
    @EntityGraph(attributePaths = {"seller", "electronicType", "electronicModel"})
    Page<ElectronicListing> findByElectronicType(ElectronicType electronicType, Pageable pageable);

    @EntityGraph(attributePaths = {"seller", "electronicType", "electronicModel"})
    Page<ElectronicListing> findByElectronicType_Id(UUID electronicTypeId, Pageable pageable);

}
