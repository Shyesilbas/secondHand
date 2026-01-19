package com.serhat.secondhand.payment.repo;

import com.serhat.secondhand.payment.entity.Bank;
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
public interface BankRepository extends JpaRepository<Bank, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bank b WHERE b.accountHolder = :user")
    Optional<Bank> findByAccountHolderWithLock(@Param("user") User user);

    Optional<Bank> findByAccountHolder(User user);
    
    boolean existsByAccountHolder(User user);
}
