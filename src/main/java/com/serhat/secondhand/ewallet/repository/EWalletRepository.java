package com.serhat.secondhand.ewallet.repository;

import com.serhat.secondhand.ewallet.entity.EWallet;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EWalletRepository extends JpaRepository<EWallet, UUID> {
    
    Optional<EWallet> findByUser(User user);
    
    boolean existsByUser(User user);
}
