package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.agreements.application.UserAgreementService;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.auth.domain.validator.RegistrationValidator;
import com.serhat.secondhand.auth.util.AuthErrorCodes;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private IUserService userService;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserAgreementService userAgreementService;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private RegistrationValidator registrationValidator;

    @InjectMocks
    private RegistrationService registrationService;

    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        request = RegisterRequest.builder()
                .name("Test").surname("User").email("taken@test.local").phoneNumber("+905550000001")
                .password("Secret.1234").agreementsAccepted(true).acceptedAgreementIds(List.of(UUID.randomUUID()))
                .build();
        when(registrationValidator.validate(request)).thenReturn(Result.success());
    }

    @Test
    void takenEmailGetsTheSameAnswerAsANewAccount() {
        when(userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber()))
                .thenReturn(Result.error("User already exists", "USER_ALREADY_EXISTS"));
        Result<RegisterResponse> taken = registrationService.register(request);

        when(userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber())).thenReturn(Result.success());
        User created = new User();
        created.setId(42L);
        when(userMapper.toEntity(request, passwordEncoder)).thenReturn(created);
        when(userService.save(created)).thenReturn(Result.success());
        Result<RegisterResponse> fresh = registrationService.register(request);

        assertThat(taken.isSuccess()).isTrue();
        assertThat(fresh.isSuccess()).isTrue();
        assertThat(taken.getData()).isEqualTo(fresh.getData());
    }

    @Test
    void takenEmailCreatesNothingButStillHashesThePassword() {
        when(userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber()))
                .thenReturn(Result.error("User already exists", "USER_ALREADY_EXISTS"));

        registrationService.register(request);

        verify(passwordEncoder).encode("Secret.1234");
        verify(userService, never()).save(any());
        verifyNoInteractions(userAgreementService, eventPublisher);
    }

    @Test
    void concurrentRegistrationThatLosesTheRaceStillGetsTheGenericAnswer() {
        when(userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber())).thenReturn(Result.success());
        User created = new User();
        when(userMapper.toEntity(request, passwordEncoder)).thenReturn(created);
        when(userService.save(created)).thenReturn(Result.error("User already exists", "USER_ALREADY_EXISTS"));

        Result<RegisterResponse> result = registrationService.register(request);

        assertThat(result.isSuccess()).isTrue();
        verifyNoInteractions(userAgreementService, eventPublisher);
    }

    @Test
    void missingAgreementsAreReportedBeforeAnyAccountLookup() {
        when(registrationValidator.validate(request)).thenReturn(Result.error(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED));

        Result<RegisterResponse> result = registrationService.register(request);

        assertThat(result.getErrorCode()).isEqualTo(AuthErrorCodes.AGREEMENTS_NOT_ACCEPTED.getCode());
        verify(userService, never()).validateUniqueUser(any(), any());
    }
}
