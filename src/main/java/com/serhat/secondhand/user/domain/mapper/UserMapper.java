package com.serhat.secondhand.user.domain.mapper;

import com.serhat.secondhand.auth.domain.dto.request.RegisterRequest;
import com.serhat.secondhand.user.domain.dto.UserDto;
import com.serhat.secondhand.user.domain.entity.User;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.springframework.security.crypto.password.PasswordEncoder;


@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "email", expression = "java(user.getEmail())")
    UserDto toDto(User user);

    @Mappings({
        @Mapping(target = "id", ignore = true),
        @Mapping(target = "password", expression = "java(encoder.encode(registerRequest.getPassword()))"),
        @Mapping(target = "accountStatus", constant = "ACTIVE"),
        @Mapping(target = "accountCreationDate", expression = "java(java.time.LocalDate.now())"),
        @Mapping(target = "lastLoginDate", ignore = true),
        @Mapping(target = "lastLoginIp", ignore = true),
        @Mapping(target = "accountVerified", constant = "false"),
        @Mapping(target = "listings", ignore = true),
        @Mapping(target = "bank", ignore = true),
        @Mapping(target = "creditCard", ignore = true),
        @Mapping(target = "emails", ignore = true),
        @Mapping(target = "tokens", ignore = true),
        @Mapping(target = "verifications", ignore = true),
        @Mapping(target = "fromPayments", ignore = true),
        @Mapping(target = "toPayments", ignore = true)
    })
    User toEntity(RegisterRequest registerRequest, @Context PasswordEncoder encoder);
}
