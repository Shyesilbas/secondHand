package com.serhat.secondhand.agreements.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.agreements.entity.enums.AgreementType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "agreement_requirements",
        uniqueConstraints = @UniqueConstraint(name = "uk_agreement_requirements_group_type", columnNames = {"group_code", "agreement_type"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgreementRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "group_code", nullable = false)
    private String groupCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "agreement_type", nullable = false)
    private AgreementType agreementType;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    @Column(name = "updated_date", nullable = false)
    private LocalDate updatedDate;

    @PrePersist
    public void onCreate() {
        LocalDate now = LocalDate.now();
        if (createdDate == null) createdDate = now;
        if (updatedDate == null) updatedDate = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedDate = LocalDate.now();
    }
}

