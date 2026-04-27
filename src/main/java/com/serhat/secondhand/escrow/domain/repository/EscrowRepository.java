package com.serhat.secondhand.escrow.domain.repository;

import com.serhat.secondhand.escrow.domain.entity.Escrow;
import com.serhat.secondhand.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
