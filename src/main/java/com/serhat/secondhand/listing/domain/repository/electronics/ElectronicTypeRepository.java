package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ElectronicTypeRepository extends JpaRepository<ElectronicType, UUID> {

    // Not cached: these are JPA entities (lazy proxies, mutable seed rows). EnumReadService caches its DTO output.
    List<ElectronicType> findAll();

    Optional<ElectronicType> findByNameIgnoreCase(String name);
}

