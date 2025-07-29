package com.serhat.secondhand.user.domain.mapper;

import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import com.serhat.secondhand.user.domain.entity.enums.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .surname(user.getSurname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .gender(user.getGender())
                .birthdate(user.getBirthdate())
                .accountCreationDate(user.getAccountCreationDate())
                .userType(user.getUserType())
                .accountStatus(user.getAccountStatus())
                .fullName(user.getName() + " " + user.getSurname())
                .canSell(canUserSell(user.getUserType()))
                .canBuy(canUserBuy(user.getUserType()))
                .build();
    }

    public User toEntity(RegisterRequest registerRequest) {
        if (registerRequest == null) {
            return null;
        }

        return User.builder()
                .name(registerRequest.getName())
                .surname(registerRequest.getSurname())
                .email(registerRequest.getEmail())
                .phoneNumber(registerRequest.getPhoneNumber())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .gender(registerRequest.getGender())
                .birthdate(registerRequest.getBirthdate())
                .userType(registerRequest.getUserType())
                .accountStatus(AccountStatus.ACTIVE)
                .accountCreationDate(LocalDate.now())
                .lastLoginDate(null)
                .LastLoginIp(null)
                .build();
    }

    private boolean canUserSell(UserType userType) {
        return userType == UserType.SELLER || userType == UserType.BOTH;
    }

    private boolean canUserBuy(UserType userType) {
        return userType == UserType.BUYER || userType == UserType.BOTH;
    }
}
