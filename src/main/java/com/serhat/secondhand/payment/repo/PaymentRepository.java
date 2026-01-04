package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.Payment;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findByFromUserOrToUser(User user, User user2, Pageable pageable);

    List<Payment> findByFromUserOrToUser(User user, User user2);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    Optional<Payment> findByIdempotencyKeyAndFromUser(String idempotencyKey, User fromUser);
}
