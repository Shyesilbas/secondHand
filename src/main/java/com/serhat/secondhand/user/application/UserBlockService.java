package com.serhat.secondhand.user.application;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.follow.repository.SellerFollowRepository;
import com.serhat.secondhand.user.domain.dto.BlockStatusDto;
import com.serhat.secondhand.user.domain.dto.BlockedUserDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.UserBlock;
import com.serhat.secondhand.user.domain.repository.UserBlockRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import com.serhat.secondhand.user.util.UserErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Mutual user blocking. A block hides both users from each other (listings, profile, chat, offers,
 * new purchases). Orders that are already running are not touched (see the user module README).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserBlockService {

    private final UserBlockRepository userBlockRepository;
    private final UserRepository userRepository;
    private final SellerFollowRepository sellerFollowRepository;

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BusinessException(UserErrorCodes.CANNOT_BLOCK_SELF);
        }
        if (!userRepository.existsById(blockedId)) {
            throw new BusinessException(UserErrorCodes.USER_NOT_FOUND_BY_ID);
        }
        if (userBlockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            return;
        }
        userBlockRepository.save(UserBlock.builder().blockerId(blockerId).blockedId(blockedId).build());
        removeFollow(blockerId, blockedId);
        removeFollow(blockedId, blockerId);
        log.info("User {} blocked user {}", blockerId, blockedId);
    }

    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        userBlockRepository.deleteByPair(blockerId, blockedId);
    }

    @Transactional(readOnly = true)
    public BlockStatusDto getBlockStatus(Long viewerId, Long targetUserId) {
        if (viewerId.equals(targetUserId)) {
            return BlockStatusDto.of(false, false);
        }
        return BlockStatusDto.of(
                userBlockRepository.existsByBlockerIdAndBlockedId(viewerId, targetUserId),
                userBlockRepository.existsByBlockerIdAndBlockedId(targetUserId, viewerId));
    }

    @Transactional(readOnly = true)
    public List<BlockedUserDto> getBlockedUsers(Long blockerId) {
        List<UserBlock> blocks = userBlockRepository.findByBlockerIdOrderByCreatedAtDesc(blockerId);
        if (blocks.isEmpty()) {
            return List.of();
        }
        Map<Long, User> users = userRepository.findAllById(
                        blocks.stream().map(UserBlock::getBlockedId).toList())
                .stream().collect(Collectors.toMap(User::getId, Function.identity()));
        return blocks.stream()
                .filter(b -> users.containsKey(b.getBlockedId()))
                .map(b -> {
                    User u = users.get(b.getBlockedId());
                    return new BlockedUserDto(u.getId(), u.getName(), u.getSurname(), null, b.getCreatedAt());
                })
                .toList();
    }

    /** Users the viewer blocked plus users who blocked the viewer. */
    @Transactional(readOnly = true)
    public Set<Long> getMutuallyHiddenUserIds(Long viewerId) {
        if (viewerId == null) {
            return Set.of();
        }
        Set<Long> ids = new HashSet<>(userBlockRepository.findBlockedIdsByBlocker(viewerId));
        ids.addAll(userBlockRepository.findBlockerIdsByBlocked(viewerId));
        return ids;
    }

    @Transactional(readOnly = true)
    public boolean isBlockedEitherWay(Long userA, Long userB) {
        if (userA == null || userB == null || userA.equals(userB)) {
            return false;
        }
        return userBlockRepository.existsByBlockerIdAndBlockedId(userA, userB)
                || userBlockRepository.existsByBlockerIdAndBlockedId(userB, userA);
    }

    /** Throws {@code USER_BLOCKED} (403) when a block exists in either direction. */
    @Transactional(readOnly = true)
    public void requireNotBlocked(Long userA, Long userB) {
        if (isBlockedEitherWay(userA, userB)) {
            throw new BusinessException(UserErrorCodes.USER_BLOCKED);
        }
    }

    /** Profile access: distinguishes who blocked whom so the UI can show the right card. */
    @Transactional(readOnly = true)
    public Result<Void> checkProfileAccess(Long viewerId, Long targetUserId) {
        BlockStatusDto status = getBlockStatus(viewerId, targetUserId);
        if (status.blockedMe()) {
            return Result.error(UserErrorCodes.USER_BLOCKED_YOU);
        }
        if (status.blockedByMe()) {
            return Result.error(UserErrorCodes.USER_BLOCKED_BY_YOU);
        }
        return Result.success();
    }

    private void removeFollow(Long followerId, Long followedId) {
        User follower = userRepository.getReferenceById(followerId);
        User followed = userRepository.getReferenceById(followedId);
        sellerFollowRepository.findByFollowerAndFollowed(follower, followed)
                .ifPresent(sellerFollowRepository::delete);
    }
}
