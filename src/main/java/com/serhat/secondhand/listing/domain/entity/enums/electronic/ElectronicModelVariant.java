package com.serhat.secondhand.listing.domain.entity.enums.electronic;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.domain.Persistable;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * A configuration of an electronic model (phone: storage + RAM, laptop: CPU + GPU + RAM + SSD). A listing that
 * picks a variant copies these facts and the model's specs (ElectronicSpecSnapshotter).
 */
@Entity
@Table(name = "electronic_model_variants")
@Getter
@Setter
@NoArgsConstructor
public class ElectronicModelVariant implements Persistable<UUID> {

    @Id
    private UUID id;

    @Transient
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "electronic_model_id", nullable = false)
    private ElectronicModel model;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    private Integer ram;

    private Integer storage;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", length = 50)
    private StorageType storageType;

    @Enumerated(EnumType.STRING)
    @Column(length = 100)
    private Processor processor;

    @Column(length = 150)
    private String chipset;

    @Column(name = "gpu_model", length = 100)
    private String gpuModel;

    /** Variant-level facts that override the model's specs (same keys as ElectronicModel.specs). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "specs", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> specs = new LinkedHashMap<>();

    @Column(length = 20)
    private String source;
}
