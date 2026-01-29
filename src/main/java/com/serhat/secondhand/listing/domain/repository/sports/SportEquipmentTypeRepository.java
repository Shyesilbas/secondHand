package com.serhat.secondhand.listing.domain.repository.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SportEquipmentTypeRepository extends JpaRepository<SportEquipmentType, UUID> {
    Optional<SportEquipmentType> findByNameIgnoreCase(String name);
}

