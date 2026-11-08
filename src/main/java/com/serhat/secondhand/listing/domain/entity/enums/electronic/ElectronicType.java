package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import org.springframework.data.domain.Persistable;
import jakarta.persistence.Transient;
import com.serhat.secondhand.listing.domain.entity.enums.common.SpecFieldRule;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(name = "electronic_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicType implements Labelable, Persistable<UUID> {

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

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String label;

    /** Order of the type picker. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /** Spec field name -> rule (data/electronics/types.json); see {@link SpecFieldRule}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_rules", nullable = false, columnDefinition = "jsonb")
    private Map<String, SpecFieldRule> fieldRules = new LinkedHashMap<>();
}
