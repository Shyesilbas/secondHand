package com.serhat.secondhand.cart.repository;

import com.serhat.secondhand.cart.entity.Cart;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {


    List<Cart> findByUserId(Long userId);

    @Query(value = "SELECT c FROM Cart c JOIN FETCH c.listing l JOIN FETCH l.seller s WHERE c.user.id = :userId",
            countQuery = "SELECT COUNT(c) FROM Cart c WHERE c.user.id = :userId")
    Page<Cart> findByUserIdWithListing(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Cart c JOIN FETCH c.listing l JOIN FETCH l.seller s WHERE c.user.id = :userId")
    List<Cart> findByUserIdWithListing(@Param("userId") Long userId);

    Optional<Cart> findByUserIdAndListingId(Long userId, UUID listingId);

    boolean existsByUserIdAndListingId(Long userId, UUID listingId);

    long countByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId AND c.listing.id = :listingId")
    void deleteByUserIdAndListingId(@Param("userId") Long userId, @Param("listingId") UUID listingId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Cart c WHERE c.listing.id = :listingId AND c.reservedAt > :expirationTime")
    int countReservedQuantityByListing(@Param("listingId") UUID listingId, @Param("expirationTime") LocalDateTime expirationTime);

    @Query("SELECT c FROM Cart c WHERE c.reservedAt IS NOT NULL AND c.reservedAt < :expirationTime")
    List<Cart> findExpiredReservations(@Param("expirationTime") LocalDateTime expirationTime);
}