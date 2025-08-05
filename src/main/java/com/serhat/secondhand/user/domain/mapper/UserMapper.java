package com.serhat.secondhand.user.domain.mapper;

import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import com.serhat.secondhand.user.domain.entity.enums.AccountStatus;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.springframework.security.crypto.password.PasswordEncoder;


@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getName() + \" \" + user.getSurname())")
    UserDto toDto(User user);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "password", expression = "java(encoder.encode(registerRequest.getPassword()))"),
        @Mapping(target = "accountStatus", constant = "PENDING"),
        @Mapping(target = "accountCreationDate", expression = "java(java.time.LocalDate.now())"),
        @Mapping(target = "lastLoginDate", ignore = true),
        @Mapping(target = "lastLoginIp", ignore = true),
        @Mapping(target = "canSell", constant = "false"),
        @Mapping(target = "accountVerified", constant = "false"),
        @Mapping(target = "listings", ignore = true),
        @Mapping(target = "bankAccounts", ignore = true),
        @Mapping(target = "creditCards", ignore = true),
        @Mapping(target = "emails", ignore = true),
        @Mapping(target = "tokens", ignore = true),
        @Mapping(target = "verifications", ignore = true),
        @Mapping(target = "fromPayments", ignore = true),
        @Mapping(target = "toPayments", ignore = true)
    })
    User toEntity(RegisterRequest registerRequest, @Context PasswordEncoder encoder);
}
