package com.serhat.secondhand.listing.domain.entity.enums.vehicle;

import com.serhat.secondhand.listing.domain.entity.enums.common.Labelable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "vehicle_trims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleTrim implements Labelable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_generation_id", nullable = false)
    private VehicleGeneration generation;

    @Override
    public String getLabel() {
        return name;
    }
}
