package com.serhat.secondhand.user.domain.repository;

import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Bank b WHERE b.accountHolder = :user")
    boolean hasUserBankAccount(@Param("user") User user);

    Optional<User> findById(Long id);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(CONCAT(u.name, ' ', u.surname)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.surname) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY u.name ASC")
    List<User> searchUsers(@Param("query") String query, Pageable pageable);

}
