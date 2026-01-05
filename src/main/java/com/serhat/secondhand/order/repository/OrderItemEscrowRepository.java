package com.serhat.secondhand.order.repository;

import com.serhat.secondhand.order.entity.Order;
import com.serhat.secondhand.order.entity.OrderItem;
import com.serhat.secondhand.order.entity.OrderItemEscrow;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemEscrowRepository extends JpaRepository<OrderItemEscrow, Long> {

    Optional<OrderItemEscrow> findByOrderItem(OrderItem orderItem);

    @Query("SELECT oie FROM OrderItemEscrow oie WHERE oie.order = :order")
    List<OrderItemEscrow> findByOrder(@Param("order") Order order);

    @Query("SELECT oie FROM OrderItemEscrow oie WHERE oie.status = :status")
    List<OrderItemEscrow> findByStatus(@Param("status") OrderItemEscrow.EscrowStatus status);

    @Query("SELECT oie FROM OrderItemEscrow oie WHERE oie.seller = :seller")
    List<OrderItemEscrow> findBySeller(@Param("seller") User seller);

    @Query("SELECT oie FROM OrderItemEscrow oie WHERE oie.order = :order AND oie.status = :status")
    List<OrderItemEscrow> findByOrderAndStatus(@Param("order") Order order, @Param("status") OrderItemEscrow.EscrowStatus status);
}

