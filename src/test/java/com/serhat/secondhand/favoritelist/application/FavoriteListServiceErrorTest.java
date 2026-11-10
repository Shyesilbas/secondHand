package com.serhat.secondhand.favoritelist.application;

import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.favoritelist.dto.FavoriteListDto;
import com.serhat.secondhand.favoritelist.repository.FavoriteListRepository;
import com.serhat.secondhand.favoritelist.util.FavoriteListErrorCodes;
import com.serhat.secondhand.user.domain.entity.User;
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
class FavoriteListServiceErrorTest {

    @Mock
    private FavoriteListRepository favoriteListRepository;

    @InjectMocks
    private FavoriteListService favoriteListService;

    @Test
    void getListById_whenNotFound_returnsFavoriteListNotFoundErrorCode() {
        User currentUser = User.builder().id(1L).build();
        when(favoriteListRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        Result<FavoriteListDto> result = favoriteListService.getListById(999L, currentUser);

        assertTrue(result.isError());
        assertEquals(FavoriteListErrorCodes.FAVORITE_LIST_NOT_FOUND.getCode(), result.getErrorCode());
        assertEquals("List not found", result.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, FavoriteListErrorCodes.FAVORITE_LIST_NOT_FOUND.getHttpStatus());
    }
}
