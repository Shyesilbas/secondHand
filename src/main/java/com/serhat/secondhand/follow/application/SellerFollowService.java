package com.serhat.secondhand.follow.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.email.application.event.EmailEventPublisher;
import com.serhat.secondhand.email.application.event.impl.NewListingEmailEvent;
import com.serhat.secondhand.email.application.event.model.NewListingEmailData;
import com.serhat.secondhand.email.config.EmailConfig;
import com.serhat.secondhand.follow.dto.FollowStatsDto;
import com.serhat.secondhand.notification.application.NotificationEventPublisher;
import com.serhat.secondhand.notification.template.NotificationTemplateCatalog;
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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SellerFollowService {

    private final SellerFollowRepository sellerFollowRepository;
    private final UserRepository userRepository;
    private final SellerFollowMapper sellerFollowMapper;
    private final EmailEventPublisher emailEventPublisher;
    private final EmailConfig emailConfig;
    private final NotificationEventPublisher notificationEventPublisher;
    private final NotificationTemplateCatalog notificationTemplateCatalog;

    public Result<SellerFollowDto> follow(User currentUser, Long userIdToFollow) {
        if (currentUser.getId().equals(userIdToFollow)) {
            return Result.error(FollowErrorCodes.CANNOT_FOLLOW_SELF);
        }

        User userToFollow = userRepository.findById(userIdToFollow)
            .orElse(null);

        if (userToFollow == null) {
            return Result.error(FollowErrorCodes.USER_NOT_FOUND);
        }

        if (sellerFollowRepository.existsByFollowerAndFollowed(currentUser, userToFollow)) {
            return Result.error(FollowErrorCodes.ALREADY_FOLLOWING);
        }

        var archivedFollow = sellerFollowRepository.findAnyByFollowerAndFollowed(currentUser.getId(), userToFollow.getId())
                .orElse(null);
        if (archivedFollow != null && archivedFollow.getDeletedAt() != null) {
            archivedFollow.setDeletedAt(null);
            archivedFollow.setNotifyOnNewListing(true);
            SellerFollow reactivated = sellerFollowRepository.save(archivedFollow);
            log.info("User {} re-followed user {} by reactivating archived relation", currentUser.getId(), userIdToFollow);
            return Result.success(sellerFollowMapper.toDto(reactivated));
        }

        SellerFollow sellerFollow = SellerFollow.builder()
            .follower(currentUser)
            .followed(userToFollow)
            .notifyOnNewListing(true)
            .build();

        sellerFollow = sellerFollowRepository.save(sellerFollow);
        log.info("User {} started following user {}", currentUser.getId(), userIdToFollow);

        return Result.success(sellerFollowMapper.toDto(sellerFollow));
    }

    public Result<Void> unfollow(User currentUser, Long userIdToUnfollow) {
        User userToUnfollow = userRepository.findById(userIdToUnfollow)
            .orElse(null);

        if (userToUnfollow == null) {
            return Result.error(FollowErrorCodes.USER_NOT_FOUND);
        }

        SellerFollow sellerFollow = sellerFollowRepository.findByFollowerAndFollowed(currentUser, userToUnfollow)
            .orElse(null);

        if (sellerFollow == null) {
            return Result.error(FollowErrorCodes.NOT_FOLLOWING);
        }

        sellerFollowRepository.markDeleted(sellerFollow.getId(), LocalDateTime.now());
        log.info("User {} unfollowed user {}", currentUser.getId(), userIdToUnfollow);
        return Result.success();
    }

    public Result<SellerFollowDto> toggleNotifications(User currentUser, Long followedUserId) {
        User followedUser = userRepository.findById(followedUserId)
            .orElse(null);

        if (followedUser == null) {
            return Result.error(FollowErrorCodes.USER_NOT_FOUND);
        }

        SellerFollow sellerFollow = sellerFollowRepository.findByFollowerAndFollowed(currentUser, followedUser)
            .orElse(null);

        if (sellerFollow == null) {
            return Result.error(FollowErrorCodes.NOT_FOLLOWING);
        }

        sellerFollow.setNotifyOnNewListing(!sellerFollow.isNotifyOnNewListing());
        sellerFollow = sellerFollowRepository.save(sellerFollow);
        log.info("User {} toggled notifications for user {} to {}", 
            currentUser.getId(), followedUserId, sellerFollow.isNotifyOnNewListing());

        return Result.success(sellerFollowMapper.toDto(sellerFollow));
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

        String subject = String.format(
                emailConfig.getFollow().getNewListingSubjectFormat(),
                seller.getName(),
                seller.getSurname()
        );
        
        for (SellerFollow follow : followers) {
            try {
                var data = NewListingEmailData.builder()
                        .userName(follow.getFollower().getName())
                        .headerTitle("Yeni Bir İlan Eklendi!")
                        .introText("Takip ettiğiniz satıcı " + seller.getName() + " " + seller.getSurname() + " yeni bir ilan ekledi:")
                        .listingTitle(listing.getTitle())
                        .listingPrice(listing.getPrice() + " " + listing.getCurrency())
                        .listingCity(listing.getCity())
                        .listingUrl("/listings/" + listing.getId())
                        .manageNotificationText("Bu bildirimleri kapatmak için satıcı profilinden bildirim ayarlarınızı güncelleyebilirsiniz.")
                        .listingImage(listing.getImageUrl())
                        .build();

                emailEventPublisher.publish(new NewListingEmailEvent(follow.getFollower(), subject, data));
                log.debug("Sent new listing notification to user {}", follow.getFollower().getId());
                
                var request = notificationTemplateCatalog.listingNewFromFollowed(
                        follow.getFollower().getId(),
                        listing.getId(),
                        seller.getId(),
                        listing.getTitle()
                );
                notificationEventPublisher.publishDispatch(
                        request,
                        "follow",
                        "follow-new-listing:" + follow.getFollower().getId() + ":" + listing.getId() + ":" + seller.getId()
                );
            } catch (Exception e) {
                log.error("Failed to send new listing notification to user {}: {}", 
                    follow.getFollower().getId(), e.getMessage());
            }
        }
    }

}
