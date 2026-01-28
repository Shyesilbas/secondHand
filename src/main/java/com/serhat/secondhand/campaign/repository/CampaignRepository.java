package com.serhat.secondhand.campaign.repository;

import com.serhat.secondhand.campaign.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {

    Page<Campaign> findBySellerIdOrderByCreatedAtDesc(Long sellerId, Pageable pageable);
    @Modifying
    @Query("UPDATE Campaign c SET c.active = false WHERE c.active = true AND c.endsAt < :now")
    void deactivateAllExpired(@Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT c FROM Campaign c " +
            "LEFT JOIN FETCH c.eligibleListingIds " +
            "LEFT JOIN FETCH c.eligibleTypes " +
            "WHERE c.seller.id IN :sellerIds " +
            "AND c.active = true " +
            "AND (c.startsAt IS NULL OR c.startsAt <= CURRENT_TIMESTAMP) " +
            "AND (c.endsAt IS NULL OR c.endsAt >= CURRENT_TIMESTAMP)")
    List<Campaign> findAllActiveBySellerIdsWithDetails(@Param("sellerIds") List<Long> sellerIds);

}


