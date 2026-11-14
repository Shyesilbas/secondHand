package com.serhat.secondhand.complaint.repository;

import com.serhat.secondhand.complaint.Complaint;
import com.serhat.secondhand.complaint.ComplaintStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, String> {


    List<Complaint> findByComplainer(User complainer);

    @Query("SELECT c FROM Complaint c " +
           "JOIN FETCH c.complainer " +
           "JOIN FETCH c.complainedUser " +
           "WHERE c.complainer = :user")
    List<Complaint> findByComplainerWithDetails(@Param("user") User user);

    List<Complaint> findByComplainedUser(User complainedUser);

    @Query("SELECT c FROM Complaint c " +
           "JOIN FETCH c.complainer " +
           "JOIN FETCH c.complainedUser " +
           "WHERE c.complainedUser = :user")
    List<Complaint> findByComplainedUserWithDetails(@Param("user") User user);


    List<Complaint> findByStatus(ComplaintStatus status);


    List<Complaint> findByComplainerAndComplainedUser(User complainer, User complainedUser);


    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complainer.id = :userId")
    Long countComplaintsByComplainer(@Param("userId") Long userId);


    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complainedUser.id = :userId")
    Long countComplaintsByComplainedUser(@Param("userId") Long userId);


    @Query("SELECT c FROM Complaint c WHERE c.status IN ('PENDING', 'INVESTIGATING') ORDER BY c.createdAt ASC")
    List<Complaint> findPendingComplaints();

    boolean existsByComplainerAndComplainedUser(User complainer, User complainedUser);

    interface QueuedComplaint {
        String getId();
        java.time.LocalDateTime getEligibleForReviewAt();
    }

    /** Served by the partial index {@code idx_complaints_review_queue}. */
    @Query("SELECT c.id AS id, c.eligibleForReviewAt AS eligibleForReviewAt FROM Complaint c " +
           "WHERE c.status = com.serhat.secondhand.complaint.ComplaintStatus.PENDING " +
           "ORDER BY c.eligibleForReviewAt ASC, c.id ASC")
    org.springframework.data.domain.Slice<QueuedComplaint> findPendingForQueue(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT c.appealStatus FROM Complaint c WHERE c.id = :id")
    java.util.Optional<com.serhat.secondhand.complaint.AppealStatus> findAppealStatusById(@Param("id") String id);

    @Query("SELECT c.id AS id, c.appealSubmittedAt AS eligibleForReviewAt FROM Complaint c " +
           "WHERE c.appealStatus = com.serhat.secondhand.complaint.AppealStatus.PENDING " +
           "ORDER BY c.appealSubmittedAt ASC, c.id ASC")
    org.springframework.data.domain.Slice<QueuedComplaint> findPendingAppealsForQueue(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT c.status FROM Complaint c WHERE c.id = :id")
    java.util.Optional<ComplaintStatus> findStatusById(@Param("id") String id);

    boolean existsByComplainerAndComplainedUserAndStatusIn(User complainer, User complainedUser,
                                                            java.util.Collection<ComplaintStatus> statuses);

    @Query("SELECT c FROM Complaint c " +
           "JOIN FETCH c.complainer " +
           "JOIN FETCH c.complainedUser " +
           "LEFT JOIN FETCH c.listing " +
           "WHERE c.id = :id")
    java.util.Optional<Complaint> findByIdWithDetails(@Param("id") String id);

    /** Atomically claims a queued complaint for review; 0 means someone else has it or it is closed. */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Complaint c SET c.status = com.serhat.secondhand.complaint.ComplaintStatus.INVESTIGATING, " +
           "c.updatedAt = :now WHERE c.id = :id AND c.status = com.serhat.secondhand.complaint.ComplaintStatus.PENDING")
    int claimForReview(@Param("id") String id, @Param("now") java.time.LocalDateTime now);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Complaint c SET c.status = com.serhat.secondhand.complaint.ComplaintStatus.PENDING, " +
           "c.updatedAt = :now WHERE c.id = :id AND c.status = com.serhat.secondhand.complaint.ComplaintStatus.INVESTIGATING")
    int releaseClaim(@Param("id") String id, @Param("now") java.time.LocalDateTime now);

    /** Reviews that never finished (crash between claim and decision) go back to the queue. */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Complaint c SET c.status = com.serhat.secondhand.complaint.ComplaintStatus.PENDING " +
           "WHERE c.status = com.serhat.secondhand.complaint.ComplaintStatus.INVESTIGATING AND c.updatedAt < :before")
    int releaseStaleClaims(@Param("before") java.time.LocalDateTime before);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complainedUser.id = :userId " +
           "AND c.status = com.serhat.secondhand.complaint.ComplaintStatus.RESOLVED " +
           "AND c.appealStatus <> com.serhat.secondhand.complaint.AppealStatus.APPROVED")
    long countUpheldAgainst(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complainedUser.id = :userId " +
           "AND c.status = com.serhat.secondhand.complaint.ComplaintStatus.RESOLVED " +
           "AND c.appealStatus <> com.serhat.secondhand.complaint.AppealStatus.APPROVED " +
           "AND c.penaltyAction = :action")
    long countPenaltiesAgainst(@Param("userId") Long userId,
                               @Param("action") com.serhat.secondhand.complaint.PenaltyAction action);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complainer.id = :userId AND c.badFaithReport = true " +
           "AND c.appealStatus <> com.serhat.secondhand.complaint.AppealStatus.APPROVED")
    long countBadFaithReportsBy(@Param("userId") Long userId);

    /** Other complaints against {@code userId} since {@code since}, newest first (brigade signals). */
    @Query("SELECT c.id AS id, c.complainer.id AS complainerId, " +
           "c.complainer.accountCreationDate AS complainerCreated, c.complainer.lastLoginIp AS complainerIp, " +
           "c.reason AS reason, c.description AS description " +
           "FROM Complaint c WHERE c.complainedUser.id = :userId AND c.createdAt >= :since AND c.id <> :excludeId " +
           "ORDER BY c.createdAt DESC")
    List<RelatedComplaint> findRecentAgainst(@Param("userId") Long userId,
                                             @Param("since") java.time.LocalDateTime since,
                                             @Param("excludeId") String excludeId,
                                             org.springframework.data.domain.Pageable pageable);

    interface RelatedComplaint {
        String getId();
        Long getComplainerId();
        java.time.LocalDate getComplainerCreated();
        String getComplainerIp();
        String getReason();
        String getDescription();
    }

    /** Records an appeal only if none was filed yet; returns 0 when another request got there first. */
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Complaint c SET c.appealStatus = com.serhat.secondhand.complaint.AppealStatus.PENDING, " +
           "c.appealReason = :reason, c.appealSubmittedAt = :now, c.updatedAt = :now " +
           "WHERE c.id = :id AND c.appealStatus = com.serhat.secondhand.complaint.AppealStatus.NONE")
    int markAppealPending(@Param("id") String id, @Param("reason") String reason,
                          @Param("now") java.time.LocalDateTime now);
}
