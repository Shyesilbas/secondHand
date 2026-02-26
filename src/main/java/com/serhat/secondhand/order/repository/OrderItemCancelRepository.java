package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemCancel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemCancelRepository extends JpaRepository<OrderItemCancel, Long> {


    @Query("SELECT COALESCE(SUM(oic.cancelledQuantity), 0) FROM OrderItemCancel oic WHERE oic.orderItem = :orderItem")
    Integer sumCancelledQuantityByOrderItem(@Param("orderItem") OrderItem orderItem);
}



