package com.serhat.secondhand.auth.application;

import com.serhat.secondhand.agreements.application.UserAgreementService;
import com.serhat.secondhand.agreements.dto.request.AcceptAgreementRequest;
import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.auth.domain.dto.response.RegisterResponse;
import com.serhat.secondhand.auth.domain.validator.RegistrationValidator;
import com.serhat.secondhand.core.result.Result;
import com.serhat.secondhand.user.application.IUserService;
import com.serhat.secondhand.user.application.event.UserRegisteredEvent;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final IUserService userService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final UserAgreementService userAgreementService;
    private final ApplicationEventPublisher eventPublisher;
    private final RegistrationValidator registrationValidator;

    @Transactional
    public Result<RegisterResponse> register(RegisterRequest request) {
        log.info("User registration attempt: {}", request.getEmail());

        Result<Void> validationResult = registrationValidator.validate(request);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        User user = userMapper.toEntity(request, passwordEncoder);
        Result<Void> saveResult = userService.save(user);
        if (saveResult.isError()) {
            return Result.error(saveResult.getMessage(), saveResult.getErrorCode());
        }

        if (request.getAcceptedAgreementIds() != null) {
            for (UUID agreementId : request.getAcceptedAgreementIds()) {
                userAgreementService.acceptAgreement(user.getId(), AcceptAgreementRequest.builder()
                    .agreementId(agreementId)
                    .isAcceptedTheLastVersion(true)
                    .build());
            }
        }

        log.info("User registered successfully: {}", user.getEmail());

        eventPublisher.publishEvent(new UserRegisteredEvent(user));

        return Result.success(new RegisterResponse(
                "Registration Successful.",
                "Account verification is a must for publish listing. Your account status is " + user.getAccountStatus(),
                "Your built in email account also created.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getSurname()));
    }
}
