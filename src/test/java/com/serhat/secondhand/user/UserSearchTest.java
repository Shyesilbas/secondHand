package com.serhat.secondhand.user;

import com.serhat.secondhand.user.application.UserNotificationService;
import com.serhat.secondhand.user.application.UserService;
import com.serhat.secondhand.user.domain.dto.PublicUserProfileDto;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import com.serhat.secondhand.user.domain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/** User search returns public profile fields only and cannot page through the whole user base. */
class UserSearchTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final UserMapper userMapper = mock(UserMapper.class);
    private final UserService service = new UserService(
            userRepository, mock(UserNotificationService.class), userMapper, null);

    private void givenOneMatch() {
        User user = new User();
        user.setId(7L);
        when(userRepository.searchUsers(eq("ay"), any(Pageable.class))).thenReturn(List.of(user));
        when(userMapper.toDto(user)).thenReturn(UserDto.builder()
                .id(7L).name("Ayse").surname("Kaya")
                .email("ayse@example.com").phoneNumber("05550000000")
                .birthdate(LocalDate.of(1990, 1, 1)).accountCreationDate(LocalDate.of(2024, 5, 1))
                .accountVerified(true).canSendMessage(true)
                .build());
    }

    @Test
    void resultsCarryPublicProfileFieldsOnly() {
        givenOneMatch();

        List<PublicUserProfileDto> results = service.searchUsers("ay", 10);

        assertThat(results).singleElement().satisfies(dto -> {
            assertThat(dto.id()).isEqualTo(7L);
            assertThat(dto.name()).isEqualTo("Ayse");
        });
        List<String> fields = Arrays.stream(PublicUserProfileDto.class.getRecordComponents())
                .map(c -> c.getName()).toList();
        assertThat(fields).doesNotContain("email", "phoneNumber", "birthdate", "gender", "role", "accountStatus");
    }

    @Test
    void limitIsCappedAndClampedToAtLeastOne() {
        givenOneMatch();
        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);

        service.searchUsers("ay", 100_000);
        service.searchUsers("ay", -5);

        verify(userRepository, times(2)).searchUsers(eq("ay"), pageable.capture());
        assertThat(pageable.getAllValues()).extracting(Pageable::getPageSize).containsExactly(20, 1);
    }

    @Test
    void shortQueryDoesNotHitTheDatabase() {
        assertThat(service.searchUsers(" a ", 10)).isEmpty();
        verifyNoInteractions(userRepository);
    }
}
