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

    @Query("SELECT oic.orderItem.id, SUM(oic.cancelledQuantity) FROM OrderItemCancel oic WHERE oic.orderItem.id IN :orderItemIds GROUP BY oic.orderItem.id")
    java.util.List<Object[]> findCancelledQuantitiesByOrderItemIds(@Param("orderItemIds") java.util.Collection<Long> orderItemIds);
}



