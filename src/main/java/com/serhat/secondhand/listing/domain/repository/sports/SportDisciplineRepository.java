package com.serhat.secondhand.listing.domain.repository.sports;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SportDisciplineRepository extends JpaRepository<SportDiscipline, UUID> {
    Optional<SportDiscipline> findByNameIgnoreCase(String name);
}

