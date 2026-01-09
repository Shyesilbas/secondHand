package com.serhat.secondhand.follow.repository;

import com.serhat.secondhand.follow.entity.SellerFollow;
import com.serhat.secondhand.user.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerFollowRepository extends JpaRepository<SellerFollow, Long> {

    Optional<SellerFollow> findByFollowerAndFollowed(User follower, User followed);

    boolean existsByFollowerAndFollowed(User follower, User followed);

    Page<SellerFollow> findByFollowerOrderByCreatedAtDesc(User follower, Pageable pageable);

    Page<SellerFollow> findByFollowedOrderByCreatedAtDesc(User followed, Pageable pageable);

    long countByFollowed(User followed);

    long countByFollower(User follower);

    List<SellerFollow> findByFollowedAndNotifyOnNewListingTrue(User followed);

    @Query("SELECT sf FROM SellerFollow sf WHERE sf.follower.id = :followerId")
    Page<SellerFollow> findByFollowerId(@Param("followerId") Long followerId, Pageable pageable);

    @Query("SELECT sf FROM SellerFollow sf WHERE sf.followed.id = :followedId")
    Page<SellerFollow> findByFollowedId(@Param("followedId") Long followedId, Pageable pageable);

    @Query("SELECT COUNT(sf) FROM SellerFollow sf WHERE sf.followed.id = :userId")
    long countFollowersByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(sf) FROM SellerFollow sf WHERE sf.follower.id = :userId")
    long countFollowingByUserId(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(sf) > 0 THEN true ELSE false END FROM SellerFollow sf WHERE sf.follower.id = :followerId AND sf.followed.id = :followedId")
    boolean isFollowing(@Param("followerId") Long followerId, @Param("followedId") Long followedId);

    void deleteByFollowerAndFollowed(User follower, User followed);
}

