package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import org.springframework.data.domain.Persistable;
import jakarta.persistence.Transient;

@Entity
@Table(name = "vehicle_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleType implements Labelable, Persistable<UUID> {

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

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String label;

    /** Order of the type picker. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** Body types a listing of this type may use. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "body_types", nullable = false, columnDefinition = "jsonb")
    private List<BodyType> bodyTypes = new ArrayList<>();

    /** Spec field name -> rule; see {@link SpecFieldRule}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_rules", nullable = false, columnDefinition = "jsonb")
    private Map<String, SpecFieldRule> fieldRules = new LinkedHashMap<>();
}

