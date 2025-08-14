package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.ElectronicListing;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ElectronicListingRepository extends JpaRepository<ElectronicListing, UUID> {
    List<ElectronicListing> findByElectronicBrand(ElectronicBrand electronicBrand);
    List<ElectronicListing> findByElectronicType(ElectronicType electronicType);

}
