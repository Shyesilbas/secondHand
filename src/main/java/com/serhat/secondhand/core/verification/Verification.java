package com.serhat.secondhand.core.verification;

import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "verification_codes")
public class Verification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String code;

    @Enumerated(EnumType.STRING)
    private CodeType codeType;

    private LocalDateTime codeExpiresAt;
    private LocalDateTime createdAt;
    @Builder.Default
    private Integer verificationAttemptLeft = 3;

    private boolean isVerified;

}
