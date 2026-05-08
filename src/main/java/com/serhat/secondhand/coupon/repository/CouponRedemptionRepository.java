package com.serhat.secondhand.coupon.repository;

import com.serhat.secondhand.coupon.entity.Coupon;
import com.serhat.secondhand.coupon.entity.CouponRedemption;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    long countByCoupon(Coupon coupon);
    long countByCouponAndUser(Coupon coupon, User user);

    @Query("SELECT DISTINCT r.coupon.id FROM CouponRedemption r WHERE r.user.id = :userId")
    List<UUID> findDistinctCouponIdsByUser_Id(@Param("userId") Long userId);

    @Query("""
            SELECT r FROM CouponRedemption r
            JOIN FETCH r.coupon c
            LEFT JOIN FETCH r.order o
            WHERE r.user.id = :userId
            ORDER BY r.redeemedAt DESC
            """)
    List<CouponRedemption> findByUser_IdWithCouponAndOrderOrderByRedeemedAtDesc(@Param("userId") Long userId);
}


