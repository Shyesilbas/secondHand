package com.serhat.secondhand.listing.domain.repository.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SportConditionRepository extends JpaRepository<SportCondition, UUID> {
    Optional<SportCondition> findByNameIgnoreCase(String name);
}

