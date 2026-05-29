package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Transient;
import org.springframework.data.domain.Persistable;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "vehicle_models")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleModel implements Persistable<UUID> {

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

    @Column(nullable = false, length = 160)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_brand_id", nullable = false)
    private CarBrand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType type;

    @ElementCollection(targetClass = BodyType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "vehicle_model_body_types", joinColumns = @JoinColumn(name = "vehicle_model_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "body_type")
    private Set<BodyType> supportedBodyTypes = new HashSet<>();
}
