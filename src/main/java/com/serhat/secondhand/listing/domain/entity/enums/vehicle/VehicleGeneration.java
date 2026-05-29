package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import org.springframework.data.domain.Persistable;
import jakarta.persistence.Transient;

@Entity
@Table(name = "vehicle_generations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleGeneration implements Labelable, Persistable<UUID> {

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

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_model_id", nullable = false)
    private VehicleModel model;

    @Override
    public String getLabel() {
        return name;
    }
}
