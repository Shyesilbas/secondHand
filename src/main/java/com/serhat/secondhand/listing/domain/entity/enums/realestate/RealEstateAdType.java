package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

/**
 * Reference entity for real estate ad types (FOR_SALE, FOR_RENT, DAILY_RENT, ROOMMATE).
 * Uses explicit UUID primary keys for stable, deterministic seeding across environments.
 */
@Entity
@Table(name = "real_estate_ad_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RealEstateAdType implements Labelable, Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() { return id; }

    @Override
    public boolean isNew() { return isNew; }

    public void markNotNew() { this.isNew = false; }

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String label;
}
