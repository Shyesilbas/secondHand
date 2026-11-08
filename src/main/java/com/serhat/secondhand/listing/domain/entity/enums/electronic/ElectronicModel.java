package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import org.springframework.data.domain.Persistable;
import jakarta.persistence.Transient;

@Entity
@Table(name = "electronic_models")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectronicModel implements Persistable<UUID> {

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

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private ElectronicBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private ElectronicType type;

    @Column(name = "release_year")
    private Integer releaseYear;

    @Column(name = "is_legacy")
    private Boolean isLegacy = false;

    @jakarta.persistence.Convert(converter = com.serhat.secondhand.core.converter.StringListJsonConverter.class)
    @Column(name = "aliases", columnDefinition = "TEXT")
    private java.util.List<String> aliases = new java.util.ArrayList<>();

    /** Catalog facts of the model (data/electronics/<type>/<brand>.json "specs"); keys in ElectronicCatalogSpecs. */
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "specs", nullable = false, columnDefinition = "jsonb")
    private java.util.Map<String, Object> specs = new java.util.LinkedHashMap<>();

    /** Official colors; each maps to a {@link Color} so color filters keep working. */
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "colors", nullable = false, columnDefinition = "jsonb")
    private java.util.List<ElectronicModelColor> colors = new java.util.ArrayList<>();

    /** claude-draft | verified; null when the model has no catalog facts yet. */
    @Column(name = "source", length = 20)
    private String source;
}
