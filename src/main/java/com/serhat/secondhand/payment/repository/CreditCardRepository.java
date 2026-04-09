package com.serhat.secondhand.payment.repository;

import com.serhat.secondhand.payment.entity.CreditCard;
import com.serhat.secondhand.user.domain.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, UUID> {

    List<CreditCard> findAllByCardHolder(User cardHolder);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CreditCard c WHERE c.id = :id AND c.cardHolder = :cardHolder")
    Optional<CreditCard> findByIdAndCardHolderWithLock(@Param("id") UUID id, @Param("cardHolder") User cardHolder);

    boolean existsByCardHolder(User cardHolder);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CreditCard c WHERE c.id = :id AND c.cardHolder.id = :userId")
    int deleteByIdAndCardHolderId(@Param("id") UUID id, @Param("userId") Long userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM CreditCard c WHERE c.cardHolder.id = :userId")
    int deleteAllByCardHolderId(@Param("userId") Long userId);
}
