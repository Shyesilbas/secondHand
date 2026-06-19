package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

/**
 * Reference entity for listing owner types (OWNER, AGENCY, BUILDER, BANK).
 * Uses explicit UUID primary keys for stable, deterministic seeding across environments.
 */
@Entity
@Table(name = "listing_owner_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingOwnerType implements Labelable, Persistable<UUID> {

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
