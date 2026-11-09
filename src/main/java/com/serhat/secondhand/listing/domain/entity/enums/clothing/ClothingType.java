package com.serhat.secondhand.listing.domain.entity.enums.clothing;

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
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "clothing_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClothingType implements Labelable, Persistable<UUID> {

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

    @Enumerated(EnumType.STRING)
    @Column(name = "clothing_group", length = 20)
    private ClothingGroup group;

    /** Order of the type picker. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    /**
     * {@link ClothingAudience} name -> size system keys (data/common/sizes.json) a listing may use. An audience
     * missing here means the type is not offered for it.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "size_rules", nullable = false, columnDefinition = "jsonb")
    private Map<String, List<String>> sizeRules = new LinkedHashMap<>();

    /** fit / pattern / fabricType -> rule; see {@link SpecFieldRule}. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "field_rules", nullable = false, columnDefinition = "jsonb")
    private Map<String, SpecFieldRule> fieldRules = new LinkedHashMap<>();
}
