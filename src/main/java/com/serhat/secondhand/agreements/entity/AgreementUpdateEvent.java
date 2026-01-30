package com.serhat.secondhand.agreements.entity;

import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "agreement_update_events",
        uniqueConstraints = @UniqueConstraint(name = "uk_agreement_update_events_type_version", columnNames = {"agreement_type", "version"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgreementUpdateEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false)
    private AgreementType agreementType;

    @Column(name = "version", nullable = false, length = 50)
    private String version;

    @Column(name = "detected_at", nullable = false, updatable = false)
    private LocalDateTime detectedAt;

    @PrePersist
    void onCreate() {
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
    }
}

