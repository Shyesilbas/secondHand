package com.serhat.secondhand.shipping.repository;

import com.serhat.secondhand.shipping.entity.Shipping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {
}
