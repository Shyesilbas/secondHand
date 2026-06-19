package com.serhat.secondhand.escrow.domain.repository;

import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscrowRepository extends JpaRepository<Escrow, Long> {
    List<Escrow> findByOrderId(Long orderId);
    List<Escrow> findBySellerId(Long sellerId);
    Optional<Escrow> findByOrderItemId(Long orderItemId);
    List<Escrow> findByOrderIdAndStatus(Long orderId, PaymentStatus status);
    List<Escrow> findByOrderItemIdIn(List<Long> orderItemIds);
    List<Escrow> findByOrderIdInAndSellerIdAndStatus(List<Long> orderIds, Long sellerId, PaymentStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Escrow e where e.order.id = :orderId and e.status = :status")
    List<Escrow> findByOrderIdAndStatusForUpdate(@Param("orderId") Long orderId, @Param("status") PaymentStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Escrow e where e.orderItem.id in :orderItemIds")
    List<Escrow> findByOrderItemIdInForUpdate(@Param("orderItemIds") List<Long> orderItemIds);
}
