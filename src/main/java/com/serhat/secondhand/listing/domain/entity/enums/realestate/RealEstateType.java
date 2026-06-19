package com.serhat.secondhand.listing.domain.entity.enums.realestate;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Persistable;

import java.util.UUID;

/**
 * Reference entity for real estate property types (e.g. APARTMENT, VILLA, LAND).
 * Uses explicit UUID primary keys (no @GeneratedValue) so that seed data can
 * assign deterministic IDs that remain stable across deployments and environments.
 * Implements {@link Persistable} to allow JPA to distinguish new vs. existing rows
 * via the transient {@code isNew} flag, enabling idempotent upsert-style seeding.
 */
@Entity
@Table(name = "real_estate_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RealEstateType implements Labelable, Persistable<UUID> {

    @Id
    private UUID id;

    /**
     * Transient flag used by Spring Data to decide between INSERT and UPDATE.
     * Set to {@code true} only when constructing a brand-new (unsaved) instance.
     */
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
