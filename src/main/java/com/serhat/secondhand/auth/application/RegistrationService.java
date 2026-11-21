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

    /** Error code UserService.save returns when a concurrent registration took the email or phone first. */
    private static final String USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";

    /**
     * Answers a taken email or phone exactly like a new account (same body, same password hashing cost),
     * so the endpoint cannot be used to find out which emails or phone numbers are registered.
     */
    @Transactional
    public Result<RegisterResponse> register(RegisterRequest request) {
        log.info("User registration attempt");

        Result<Void> validationResult = registrationValidator.validate(request);
        if (validationResult.isError()) {
            return Result.error(validationResult.getMessage(), validationResult.getErrorCode());
        }

        if (userService.validateUniqueUser(request.getEmail(), request.getPhoneNumber()).isError()) {
            // Spend the same BCrypt time a real registration spends before answering.
            passwordEncoder.encode(request.getPassword());
            log.info("Registration skipped: email or phone already registered");
            return Result.success(response(request));
        }

        User user = userMapper.toEntity(request, passwordEncoder);
        Result<Void> saveResult = userService.save(user);
        if (saveResult.isError()) {
            if (USER_ALREADY_EXISTS.equals(saveResult.getErrorCode())) {
                return Result.success(response(request));
            }
            return Result.error(saveResult.getMessage(), saveResult.getErrorCode());
        }

        if (request.getAcceptedAgreementIds() != null) {
            for (UUID agreementId : request.getAcceptedAgreementIds()) {
                userAgreementService.acceptAgreement(user.getId(), AcceptAgreementRequest.builder()
                    .agreementId(agreementId)
                    .build());
            }
        }

        log.info("User registered successfully: {}", user.getId());
        eventPublisher.publishEvent(new UserRegisteredEvent(user));
        return Result.success(response(request));
    }

    private static RegisterResponse response(RegisterRequest request) {
        return new RegisterResponse(
                "Registration request received.",
                "If this email is new, your account is ready: log in with your email and password. "
                        + "If you already have an account, log in or reset your password.",
                "Account verification is required to publish listings.",
                request.getEmail(),
                request.getName(),
                request.getSurname());
    }
}
