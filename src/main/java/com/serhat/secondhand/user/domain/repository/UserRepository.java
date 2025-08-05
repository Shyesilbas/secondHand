package com.serhat.secondhand.user.domain.repository;

import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Bank b WHERE b.accountHolder = :user")
    boolean hasUserBankAccount(@Param("user") User user);

    Optional<User> findById(Long id);

}
