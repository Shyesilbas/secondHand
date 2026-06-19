package com.serhat.secondhand.coupon.repository;

import com.serhat.secondhand.coupon.entity.Coupon;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Coupon c where upper(c.code) = upper(:code)")
    Optional<Coupon> findByCodeIgnoreCaseForUpdate(@Param("code") String code);

    @Query("""
        select c from Coupon c
        where c.active = true
          and (c.startsAt is null or c.startsAt <= :now)
          and (c.endsAt is null or c.endsAt >= :now)
        order by c.createdAt desc
        """)
    List<Coupon> findActiveNow(@Param("now") LocalDateTime now);
}

