package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemRefund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRefundRepository extends JpaRepository<OrderItemRefund, Long> {


    @Query("SELECT COALESCE(SUM(oir.refundedQuantity), 0) FROM OrderItemRefund oir WHERE oir.orderItem = :orderItem")
    Integer sumRefundedQuantityByOrderItem(@Param("orderItem") OrderItem orderItem);
}



