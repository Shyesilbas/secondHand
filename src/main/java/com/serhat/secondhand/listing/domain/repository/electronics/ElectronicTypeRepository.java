package com.serhat.secondhand.listing.domain.repository.electronics;

import com.serhat.secondhand.listing.domain.entity.enums.electronic.ElectronicType;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ElectronicTypeRepository extends JpaRepository<ElectronicType, UUID> {
    
    @Cacheable(value = "electronicTypes", key = "'all'")
    List<ElectronicType> findAll();
    
    @Cacheable(value = "electronicTypes", key = "#name")
    Optional<ElectronicType> findByNameIgnoreCase(String name);
}

