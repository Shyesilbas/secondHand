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
@Table(name = "agreements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID agreementId;

    @Enumerated(EnumType.STRING)
    private AgreementType agreementType;

    private String version;

    private String content;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate createdDate;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate updatedDate;
}
