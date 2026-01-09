package com.serhat.secondhand.follow.service;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.email.application.EmailService;
import com.serhat.secondhand.email.domain.entity.enums.EmailType;
import com.serhat.secondhand.follow.dto.FollowStatsDto;
import com.serhat.secondhand.follow.dto.SellerFollowDto;
import com.serhat.secondhand.follow.entity.SellerFollow;
import com.serhat.secondhand.follow.mapper.SellerFollowMapper;
import com.serhat.secondhand.follow.repository.SellerFollowRepository;
import com.serhat.secondhand.follow.util.FollowErrorCodes;
import com.serhat.secondhand.listing.domain.entity.Listing;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SellerFollowService {

    private final SellerFollowRepository sellerFollowRepository;
    private final UserRepository userRepository;
    private final SellerFollowMapper sellerFollowMapper;
    private final EmailService emailService;

    public SellerFollowDto follow(User currentUser, Long userIdToFollow) {
        if (currentUser.getId().equals(userIdToFollow)) {
            throw new BusinessException(
                "You cannot follow yourself",
                HttpStatus.BAD_REQUEST,
                FollowErrorCodes.CANNOT_FOLLOW_SELF
            );
        }

        User userToFollow = userRepository.findById(userIdToFollow)
            .orElseThrow(() -> new BusinessException(
                "User not found",
                HttpStatus.NOT_FOUND,
                FollowErrorCodes.USER_NOT_FOUND
            ));

        if (sellerFollowRepository.existsByFollowerAndFollowed(currentUser, userToFollow)) {
            throw new BusinessException(
                "You are already following this user",
                HttpStatus.BAD_REQUEST,
                FollowErrorCodes.ALREADY_FOLLOWING
            );
        }

        SellerFollow sellerFollow = SellerFollow.builder()
            .follower(currentUser)
            .followed(userToFollow)
            .notifyOnNewListing(true)
            .build();

        sellerFollow = sellerFollowRepository.save(sellerFollow);
        log.info("User {} started following user {}", currentUser.getId(), userIdToFollow);

        return sellerFollowMapper.toDto(sellerFollow);
    }

    public void unfollow(User currentUser, Long userIdToUnfollow) {
        User userToUnfollow = userRepository.findById(userIdToUnfollow)
            .orElseThrow(() -> new BusinessException(
                "User not found",
                HttpStatus.NOT_FOUND,
                FollowErrorCodes.USER_NOT_FOUND
            ));

        SellerFollow sellerFollow = sellerFollowRepository.findByFollowerAndFollowed(currentUser, userToUnfollow)
            .orElseThrow(() -> new BusinessException(
                "You are not following this user",
                HttpStatus.BAD_REQUEST,
                FollowErrorCodes.NOT_FOLLOWING
            ));

        sellerFollowRepository.delete(sellerFollow);
        log.info("User {} unfollowed user {}", currentUser.getId(), userIdToUnfollow);
    }

    public SellerFollowDto toggleNotifications(User currentUser, Long followedUserId) {
        User followedUser = userRepository.findById(followedUserId)
            .orElseThrow(() -> new BusinessException(
                "User not found",
                HttpStatus.NOT_FOUND,
                FollowErrorCodes.USER_NOT_FOUND
            ));

        SellerFollow sellerFollow = sellerFollowRepository.findByFollowerAndFollowed(currentUser, followedUser)
            .orElseThrow(() -> new BusinessException(
                "You are not following this user",
                HttpStatus.BAD_REQUEST,
                FollowErrorCodes.NOT_FOLLOWING
            ));

        sellerFollow.setNotifyOnNewListing(!sellerFollow.isNotifyOnNewListing());
        sellerFollow = sellerFollowRepository.save(sellerFollow);
        log.info("User {} toggled notifications for user {} to {}", 
            currentUser.getId(), followedUserId, sellerFollow.isNotifyOnNewListing());

        return sellerFollowMapper.toDto(sellerFollow);
    }

    @Transactional(readOnly = true)
    public Page<SellerFollowDto> getFollowing(User currentUser, Pageable pageable) {
        return sellerFollowRepository.findByFollowerOrderByCreatedAtDesc(currentUser, pageable)
            .map(sellerFollowMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SellerFollowDto> getFollowers(User currentUser, Pageable pageable) {
        return sellerFollowRepository.findByFollowedOrderByCreatedAtDesc(currentUser, pageable)
            .map(sellerFollowMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SellerFollowDto> getFollowersOfUser(Long userId, Pageable pageable) {
        return sellerFollowRepository.findByFollowedId(userId, pageable)
            .map(sellerFollowMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SellerFollowDto> getFollowingOfUser(Long userId, Pageable pageable) {
        return sellerFollowRepository.findByFollowerId(userId, pageable)
            .map(sellerFollowMapper::toDto);
    }

    @Transactional(readOnly = true)
    public FollowStatsDto getFollowStats(Long userId, User currentUser) {
        long followersCount = sellerFollowRepository.countFollowersByUserId(userId);
        long followingCount = sellerFollowRepository.countFollowingByUserId(userId);

        boolean isFollowing = false;
        boolean notifyOnNewListing = false;

        if (currentUser != null && !currentUser.getId().equals(userId)) {
            isFollowing = sellerFollowRepository.isFollowing(currentUser.getId(), userId);
            
            if (isFollowing) {
                User targetUser = userRepository.findById(userId).orElse(null);
                if (targetUser != null) {
                    var follow = sellerFollowRepository.findByFollowerAndFollowed(currentUser, targetUser);
                    notifyOnNewListing = follow.map(SellerFollow::isNotifyOnNewListing).orElse(false);
                }
            }
        }

        return FollowStatsDto.builder()
            .userId(userId)
            .followersCount(followersCount)
            .followingCount(followingCount)
            .following(isFollowing)
            .notifyOnNewListing(notifyOnNewListing)
            .build();
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(User currentUser, Long userId) {
        if (currentUser == null || currentUser.getId().equals(userId)) {
            return false;
        }
        return sellerFollowRepository.isFollowing(currentUser.getId(), userId);
    }

    @Async("notificationExecutor")
    public void notifyFollowersOfNewListing(Listing listing) {
        User seller = listing.getSeller();
        List<SellerFollow> followers = sellerFollowRepository.findByFollowedAndNotifyOnNewListingTrue(seller);

        if (followers.isEmpty()) {
            log.debug("No followers to notify for new listing by user {}", seller.getId());
            return;
        }

        log.info("Notifying {} followers about new listing {} by user {}", 
            followers.size(), listing.getId(), seller.getId());

        String subject = seller.getName() + " " + seller.getSurname() + " yeni bir ilan ekledi!";
        
        for (SellerFollow follow : followers) {
            try {
                String content = buildNewListingEmailContent(follow.getFollower(), seller, listing);
                emailService.sendEmail(follow.getFollower(), subject, content, EmailType.NEW_LISTING_NOTIFICATION);
                log.debug("Sent new listing notification to user {}", follow.getFollower().getId());
            } catch (Exception e) {
                log.error("Failed to send new listing notification to user {}: {}", 
                    follow.getFollower().getId(), e.getMessage());
            }
        }
    }

    private String buildNewListingEmailContent(User follower, User seller, Listing listing) {
        StringBuilder sb = new StringBuilder();
        sb.append("Merhaba ").append(follower.getName()).append(",\n\n");
        sb.append("Takip ettiğiniz satıcı ").append(seller.getName()).append(" ").append(seller.getSurname());
        sb.append(" yeni bir ilan ekledi:\n\n");
        sb.append("📦 ").append(listing.getTitle()).append("\n");
        sb.append("💰 ").append(listing.getPrice()).append(" ").append(listing.getCurrency()).append("\n");
        sb.append("📍 ").append(listing.getCity()).append("\n\n");
        sb.append("İlanı görüntülemek için uygulamayı ziyaret edin.\n\n");
        sb.append("---\n");
        sb.append("Bu bildirimleri kapatmak için satıcı profilinden bildirim ayarlarınızı güncelleyebilirsiniz.");
        return sb.toString();
    }
}

