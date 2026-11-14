package com.serhat.secondhand.user;

import com.serhat.secondhand.core.exception.BusinessException;
import com.serhat.secondhand.follow.repository.SellerFollowRepository;
import com.serhat.secondhand.user.application.UserBlockService;
import com.serhat.secondhand.user.domain.dto.BlockStatusDto;
import com.serhat.secondhand.user.domain.entity.UserBlock;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserBlockRepository;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserBlockServiceTest {

    private final UserBlockRepository blocks = mock(UserBlockRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final SellerFollowRepository follows = mock(SellerFollowRepository.class);
    private final UserBlockService service = new UserBlockService(blocks, users, follows);

    @Test
    void blockingYourselfIsRejected() {
        assertThatThrownBy(() -> service.blockUser(1L, 1L))
                .isInstanceOf(BusinessException.class).hasMessageContaining("yourself");
        verifyNoInteractions(blocks);
    }

    @Test
    void blockingIsIdempotent() {
        when(users.existsById(2L)).thenReturn(true);
        when(blocks.existsByBlockerIdAndBlockedId(1L, 2L)).thenReturn(true);

        service.blockUser(1L, 2L);

        verify(blocks, never()).save(any());
    }

    @Test
    void blockSavesRowAndDropsFollowsBothWays() {
        when(users.existsById(2L)).thenReturn(true);
        User a = new User();
        a.setId(1L);
        User b = new User();
        b.setId(2L);
        when(users.getReferenceById(1L)).thenReturn(a);
        when(users.getReferenceById(2L)).thenReturn(b);
        when(follows.findByFollowerAndFollowed(any(), any())).thenReturn(Optional.empty());

        service.blockUser(1L, 2L);

        verify(blocks).save(any(UserBlock.class));
        verify(follows).findByFollowerAndFollowed(a, b);
        verify(follows).findByFollowerAndFollowed(b, a);
    }

    @Test
    void statusDistinguishesDirection() {
        when(blocks.existsByBlockerIdAndBlockedId(1L, 2L)).thenReturn(false);
        when(blocks.existsByBlockerIdAndBlockedId(2L, 1L)).thenReturn(true);

        BlockStatusDto status = service.getBlockStatus(1L, 2L);

        assertThat(status.blockedMe()).isTrue();
        assertThat(status.blockedByMe()).isFalse();
        assertThat(status.eitherBlocked()).isTrue();
    }

    @Test
    void hiddenIdsUnionBothDirections() {
        when(blocks.findBlockedIdsByBlocker(1L)).thenReturn(List.of(2L, 3L));
        when(blocks.findBlockerIdsByBlocked(1L)).thenReturn(List.of(3L, 4L));

        assertThat(service.getMutuallyHiddenUserIds(1L)).containsExactlyInAnyOrder(2L, 3L, 4L);
        assertThat(service.getMutuallyHiddenUserIds(null)).isEmpty();
    }

    @Test
    void profileAccessReportsWhoBlockedWhom() {
        when(blocks.existsByBlockerIdAndBlockedId(2L, 1L)).thenReturn(true);
        assertThat(service.checkProfileAccess(1L, 2L).getErrorCode()).isEqualTo("USER_BLOCKED_YOU");

        when(blocks.existsByBlockerIdAndBlockedId(2L, 1L)).thenReturn(false);
        when(blocks.existsByBlockerIdAndBlockedId(1L, 2L)).thenReturn(true);
        assertThat(service.checkProfileAccess(1L, 2L).getErrorCode()).isEqualTo("USER_BLOCKED_BY_YOU");
    }

    @Test
    void requireNotBlockedThrowsEitherWay() {
        when(blocks.existsByBlockerIdAndBlockedId(2L, 1L)).thenReturn(true);
        assertThatThrownBy(() -> service.requireNotBlocked(1L, 2L)).isInstanceOf(BusinessException.class);
    }
}
