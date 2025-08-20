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
@Table(name = "user_agreements")
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

    private boolean isAcceptedTheLastVersion;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate acceptedDate;
}
