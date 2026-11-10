package com.serhat.secondhand.follow.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.follow.dto.SellerFollowDto;
import com.serhat.secondhand.follow.repository.SellerFollowRepository;
import com.serhat.secondhand.follow.util.FollowErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SellerFollowServiceErrorTest {

    @Mock
    private SellerFollowRepository sellerFollowRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SellerFollowService sellerFollowService;

    @Test
    void follow_whenTargetUserNotFound_returnsUserNotFoundErrorCode() {
        User currentUser = User.builder().id(1L).build();
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        Result<SellerFollowDto> result = sellerFollowService.follow(currentUser, 2L);

        assertTrue(result.isError());
        assertEquals(FollowErrorCodes.USER_NOT_FOUND.getCode(), result.getErrorCode());
        assertEquals("User not found", result.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, FollowErrorCodes.USER_NOT_FOUND.getHttpStatus());
    }

    @Test
    void follow_whenFollowingSelf_returnsCannotFollowSelfErrorCode() {
        User currentUser = User.builder().id(1L).build();

        Result<SellerFollowDto> result = sellerFollowService.follow(currentUser, 1L);

        assertTrue(result.isError());
        assertEquals(FollowErrorCodes.CANNOT_FOLLOW_SELF.getCode(), result.getErrorCode());
        assertEquals("You cannot follow yourself", result.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, FollowErrorCodes.CANNOT_FOLLOW_SELF.getHttpStatus());
    }
}
