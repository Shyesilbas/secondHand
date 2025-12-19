package com.serhat.secondhand.campaign.repository;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    List<Campaign> findBySellerOrderByCreatedAtDesc(User seller);

    @Query("""
        select c from Campaign c
        where c.active = true
          and c.seller.id in :sellerIds
          and (c.startsAt is null or c.startsAt <= :now)
          and (c.endsAt is null or c.endsAt >= :now)
        """)
    List<Campaign> findActiveCampaignsForSellers(@Param("sellerIds") List<Long> sellerIds, @Param("now") LocalDateTime now);
}

