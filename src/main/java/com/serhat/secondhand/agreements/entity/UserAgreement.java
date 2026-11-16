package com.serhat.secondhand.agreements.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_agreements",
    indexes = {
        @Index(name = "idx_user_agreements_agreement_id", columnList = "agreement_id"),
        @Index(name = "idx_user_agreements_user_accepted", columnList = "user_id, accepted_date"),
        @Index(name = "idx_user_agreements_user_id", columnList = "user_id")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userAgreementId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Agreement agreement;

    @Column(name = "accepted_version", length = 50)
    private String acceptedVersion;

    private boolean isAcceptedTheLastVersion;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate acceptedDate;
}
