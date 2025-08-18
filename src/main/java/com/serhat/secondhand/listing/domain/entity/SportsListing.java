package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "sports_listings")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Data
public class SportsListing extends Listing {

    @Enumerated(EnumType.STRING)
    private SportDiscipline discipline;

    @Enumerated(EnumType.STRING)
    private SportEquipmentType equipmentType;

    @Enumerated(EnumType.STRING)
    private SportCondition condition;
}


