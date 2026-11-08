package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Leaf of the vehicle catalog: one engine + gearbox + drivetrain combination of a generation
 * (e.g. Golf 8 1.5 eTSI 150 PS DSG). A listing that picks a version gets its spec columns from here.
 * {@code startYear}/{@code endYear} null means the generation's years apply.
 */
@Entity
@Table(name = "vehicle_versions")
@Getter
@Setter
@NoArgsConstructor
public class VehicleVersion implements Labelable, Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_generation_id", nullable = false)
    private VehicleGeneration generation;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", length = 50)
    private FuelType fuelType;

    @Column(name = "engine_capacity")
    private Integer engineCapacity;

    @Column(name = "horse_power")
    private Integer horsePower;

    @Column(name = "power_kw")
    private Integer powerKw;

    @Column(name = "torque_nm")
    private Integer torqueNm;

    @Enumerated(EnumType.STRING)
    @Column(name = "gearbox", length = 50)
    private GearType gearbox;

    @Column(name = "gear_count")
    private Integer gearCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "drivetrain", length = 50)
    private Drivetrain drivetrain;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "end_year")
    private Integer endYear;

    @Column(name = "list_price_try", precision = 14, scale = 2)
    private BigDecimal listPriceTry;

    /** {@code claude-draft} or {@code verified}. */
    @Column(nullable = false, length = 30)
    private String source = "claude-draft";

    /** CATALOG-level attributes (trunk volume, 0-100, consumption...), keys defined in data/attributes. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> specs = new LinkedHashMap<>();

    /** Trims this version is sold with; empty = not narrowed, every trim of the generation is offered. */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "vehicle_version_trims",
            joinColumns = @JoinColumn(name = "vehicle_version_id"),
            inverseJoinColumns = @JoinColumn(name = "vehicle_trim_id"))
    private Set<VehicleTrim> trims = new LinkedHashSet<>();

    @Override
    public String getLabel() {
        return name;
    }

    /** First model year this version can be, falling back to the generation's range. */
    public Integer effectiveStartYear() {
        return startYear != null ? startYear : (generation != null ? generation.getStartYear() : null);
    }

    public Integer effectiveEndYear() {
        return endYear != null ? endYear : (generation != null ? generation.getEndYear() : null);
    }
}
