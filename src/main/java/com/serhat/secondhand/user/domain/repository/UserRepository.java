package com.serhat.secondhand.user.domain.repository;

import com.serhat.secondhand.payment.entity.PaymentStatus;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    Optional<User> findById(Long id);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(CONCAT(u.name, ' ', u.surname)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.surname) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY u.name ASC")
    List<User> searchUsers(@Param("query") String query, Pageable pageable);

    @Query("SELECT u.id FROM User u")
    List<Long> findAllUserIds();

    @Query("SELECT COUNT(u) FROM User u WHERE NOT EXISTS "
            + "(SELECT 1 FROM Order o WHERE o.user = u AND o.paymentStatus = :completed)")
    long countUsersNeverCompletedPaidOrder(@Param("completed") PaymentStatus completed);

    @Query("SELECT u FROM User u WHERE u.plan = 'PREMIUM' AND u.expirationDate < :now")
    List<User> findExpiredPremiumUsers(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT u FROM User u WHERE u.plan = 'PREMIUM' AND u.expirationDate >= :now")
    List<User> findActivePremiumUsers(@Param("now") java.time.LocalDateTime now);

    @Query("SELECT u FROM User u WHERE u.plan = 'PREMIUM' AND u.expirationDate BETWEEN :now AND :soon")
    List<User> findExpiringSoonUsers(@Param("now") java.time.LocalDateTime now, @Param("soon") java.time.LocalDateTime soon);


    /** Atomically takes one Aura slot for today; returns 0 when today's limit is already used up. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE users
               SET daily_aura_usage = CASE WHEN daily_aura_reset_date = :today THEN daily_aura_usage + 1 ELSE 1 END,
                   daily_aura_reset_date = :today
             WHERE id = :userId
               AND (daily_aura_reset_date IS DISTINCT FROM :today OR daily_aura_usage < :dailyLimit)
            """, nativeQuery = true)
    int reserveAuraSlot(@Param("userId") Long userId, @Param("today") java.time.LocalDate today,
                        @Param("dailyLimit") int dailyLimit);

    /** Gives back a slot taken today by {@link #reserveAuraSlot} when the question could not be answered. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE users SET daily_aura_usage = daily_aura_usage - 1
             WHERE id = :userId AND daily_aura_reset_date = :today AND daily_aura_usage > 0
            """, nativeQuery = true)
    int releaseAuraSlot(@Param("userId") Long userId, @Param("today") java.time.LocalDate today);
}
