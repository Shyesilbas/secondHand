package com.serhat.secondhand.complaint;

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
}
