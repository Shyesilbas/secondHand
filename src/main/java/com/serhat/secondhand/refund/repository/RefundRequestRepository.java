package com.serhat.secondhand.refund.repository;

import com.serhat.secondhand.refund.entity.RefundRequest;
import com.serhat.secondhand.refund.entity.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {

    Optional<RefundRequest> findByRefundNumber(String refundNumber);

    Page<RefundRequest> findByUserId(Long userId, Pageable pageable);

    Page<RefundRequest> findByOrderId(Long orderId, Pageable pageable);

    Optional<RefundRequest> findByOrderItemIdAndStatus(Long orderItemId, RefundStatus status);

    List<RefundRequest> findByStatusAndCreatedAtBefore(RefundStatus status, LocalDateTime dateTime);

    @Query("SELECT r FROM RefundRequest r WHERE r.user.id = :userId AND r.id = :id")
    Optional<RefundRequest> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT r FROM RefundRequest r WHERE r.orderItem.id = :orderItemId")
    Optional<RefundRequest> findByOrderItemId(Long orderItemId);

    boolean existsByOrderItemIdAndStatusIn(Long orderItemId, List<RefundStatus> statuses);
}


