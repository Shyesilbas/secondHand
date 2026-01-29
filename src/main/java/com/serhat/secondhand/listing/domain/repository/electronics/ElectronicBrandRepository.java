package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ElectronicBrandRepository extends JpaRepository<ElectronicBrand, UUID> {
    Optional<ElectronicBrand> findByNameIgnoreCase(String name);
}

