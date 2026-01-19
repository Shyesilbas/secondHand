package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CreditCard c WHERE c.cardHolder = :cardHolder")
    Optional<CreditCard> findByCardHolderWithLock(@Param("cardHolder") User cardHolder);
    
    Optional<CreditCard> findByCardHolder(User cardHolder);
    boolean existsByCardHolder(User cardHolder);
}
