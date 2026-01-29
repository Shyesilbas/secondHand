package com.serhat.secondhand.listing.domain.entity;

import com.serhat.secondhand.listing.domain.entity.enums.sports.SportCondition;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportDiscipline;
import com.serhat.secondhand.listing.domain.entity.enums.sports.SportEquipmentType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_discipline_id")
    private SportDiscipline discipline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_equipment_type_id")
    private SportEquipmentType equipmentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_condition_id")
    private SportCondition condition;
}


