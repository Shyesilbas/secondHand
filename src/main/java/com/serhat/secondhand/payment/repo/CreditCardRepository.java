package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, UUID> {
    
    Optional<CreditCard> findByCardHolder(User cardHolder);
    boolean existsByCardHolder(User cardHolder);
}
