package com.serhat.secondhand.ewallet.repository;

import com.serhat.secondhand.ewallet.entity.EWallet;
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
public interface EWalletRepository extends JpaRepository<EWallet, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EWallet e WHERE e.user = :user")
    Optional<EWallet> findByUserWithLock(@Param("user") User user);
    
    Optional<EWallet> findByUser(User user);
    
    boolean existsByUser(User user);
}
