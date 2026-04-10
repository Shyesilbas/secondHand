package com.serhat.secondhand.campaign.repository;

import com.serhat.secondhand.campaign.entity.Campaign;
import com.serhat.secondhand.campaign.repository.projection.CampaignEligibleListingProjection;
import com.serhat.secondhand.campaign.repository.projection.CampaignEligibleTypeProjection;
import com.serhat.secondhand.campaign.repository.projection.CampaignListProjection;
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

    @Query("SELECT c.id AS id, c.name AS name, c.active AS active, c.startsAt AS startsAt, " +
            "c.endsAt AS endsAt, c.discountKind AS discountKind, c.value AS value, " +
            "c.applyToFutureListings AS applyToFutureListings " +
            "FROM Campaign c WHERE c.seller.id = :sellerId ORDER BY c.createdAt DESC")
    Page<CampaignListProjection> findPageSummaryBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    @Modifying
    @Query("UPDATE Campaign c SET c.active = false WHERE c.active = true AND c.endsAt < :now")
    int deactivateAllExpired(@Param("now") LocalDateTime now);

    @Query("SELECT c FROM Campaign c " +
            "WHERE c.seller.id IN :sellerIds " +
            "AND c.active = true " +
            "AND (c.startsAt IS NULL OR c.startsAt <= CURRENT_TIMESTAMP) " +
            "AND (c.endsAt IS NULL OR c.endsAt >= CURRENT_TIMESTAMP)")
    List<Campaign> findAllActiveBySellerIds(@Param("sellerIds") List<Long> sellerIds);

    @Query("SELECT c.id AS campaignId, t AS listingType " +
            "FROM Campaign c JOIN c.eligibleTypes t WHERE c.id IN :campaignIds")
    List<CampaignEligibleTypeProjection> findEligibleTypesByCampaignIds(@Param("campaignIds") List<UUID> campaignIds);

    @Query("SELECT c.id AS campaignId, l AS listingId " +
            "FROM Campaign c JOIN c.eligibleListingIds l WHERE c.id IN :campaignIds")
    List<CampaignEligibleListingProjection> findEligibleListingIdsByCampaignIds(@Param("campaignIds") List<UUID> campaignIds);

}


