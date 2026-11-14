package com.serhat.secondhand.complaint;

import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complainer_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_complaint_complainer"))
    private User complainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complained_user_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_complaint_complained_user"))
    private User complainedUser;

    @Column(name = "reason", nullable = false)
    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id",
            foreignKey = @ForeignKey(name = "fk_complaint_listing"))
    private Listing listing;

    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ComplaintStatus status;

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "eligible_for_review_at", nullable = false)
    private LocalDateTime eligibleForReviewAt;

    @Column(name = "chat_room_id")
    private Long chatRoomId;

    @Column(name = "reported_message_id")
    private Long reportedMessageId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "evidence_image_urls", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> evidenceImageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "violation_category", length = 64)
    private ViolationCategory violationCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "penalty_action", length = 64)
    private PenaltyAction penaltyAction;

    @Column(name = "ai_confidence_score", precision = 3, scale = 2)
    private BigDecimal aiConfidenceScore;

    @Column(name = "ai_reviewed_at")
    private LocalDateTime aiReviewedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "appeal_status", nullable = false, length = 32)
    @Builder.Default
    private AppealStatus appealStatus = AppealStatus.NONE;

    @Column(name = "appeal_reason", length = 1000)
    private String appealReason;

    @Column(name = "appeal_reviewed_at")
    private LocalDateTime appealReviewedAt;

    @Column(name = "appeal_submitted_at")
    private LocalDateTime appealSubmittedAt;

    @Column(name = "appeal_decision_notes", length = 1000)
    private String appealDecisionNotes;

    /** Aura found the complaint itself malicious and the complainer was sanctioned (proposal section 5.3). */
    @Column(name = "is_bad_faith_report", nullable = false)
    @Builder.Default
    private boolean badFaithReport = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "complainer_penalty_action", length = 64)
    private PenaltyAction complainerPenaltyAction;

    /** End of the appeal period, or null when this decision cannot be appealed. */
    public LocalDateTime appealDeadline(java.time.Duration appealWindow) {
        if (status != ComplaintStatus.RESOLVED || penaltyAction == null || !penaltyAction.isAppealable()
                || resolvedAt == null) {
            return null;
        }
        return resolvedAt.plus(appealWindow);
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (status == null) {
            status = ComplaintStatus.PENDING;
        }
        if (appealStatus == null) {
            appealStatus = AppealStatus.NONE;
        }
        if (eligibleForReviewAt == null) {
            throw new IllegalStateException("Complaint.eligibleForReviewAt must be set before persisting");
        }
    }
}

